/**
 * distribuir.js — Sistema de Marketing CarlosCostaPrev + Portal do BPC
 *
 * Lê o JSON do mês (gerado pelo Claude Design todo dia 25)
 * Salva os posts de hoje em arquivos prontos pra usar:
 *   - social/instagram-hoje.txt
 *   - social/facebook-hoje.txt
 *   - social/grupos-hoje.txt
 *
 * Roda todo dia via Task Scheduler (06:00)
 */

const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const SOCIAL_DIR = path.join(__dirname, 'social');
const LOG_FILE   = path.join(__dirname, 'log-social.txt');

// ── Log ──────────────────────────────────────────────────────────────────────
function log(msg) {
  const linha = '[' + new Date().toLocaleString('pt-BR') + '] ' + msg;
  console.log(linha);
  fs.appendFileSync(LOG_FILE, linha + '\n');
}

// ── Data de hoje ─────────────────────────────────────────────────────────────
function dataHoje() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function mesAtual() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

function ehQuinta() {
  return new Date().getDay() === 4; // 0=dom, 4=qui
}

// ── Carregar JSON do mês ─────────────────────────────────────────────────────
function carregarConteudo() {
  const arquivo = path.join(__dirname, `conteudo-${mesAtual()}.json`);
  if (!fs.existsSync(arquivo)) {
    log(`AVISO: arquivo ${arquivo} não encontrado.`);
    log('Aguardando entrega do Claude Design (todo dia 25 do mês anterior).');
    return [];
  }
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

// ── Montar texto do post ──────────────────────────────────────────────────────
function montarInstagram(post) {
  let txt = '';
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  txt += `📱 INSTAGRAM — @${post.conta}\n`;
  txt += `🕐 ${post.turno.toUpperCase()} · ${post.horario}\n`;
  txt += `📐 Formato: ${post.formato.replace('_',' ').toUpperCase()}\n`;
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  txt += `GANCHO:\n${post.gancho}\n\n`;
  txt += `LEGENDA:\n${post.legenda}`;

  // Cross-mention na quinta
  if (ehQuinta() && post.cross_mention && post.cross_mention.ativa) {
    txt += post.cross_mention.texto;
  }

  txt += `\n\nCTA:\n${post.cta}\n\n`;

  if (post.slides && post.slides.length > 0) {
    txt += `SLIDES DO CARROSSEL:\n`;
    post.slides.forEach((s, i) => { txt += `  ${i+1}. ${s}\n`; });
    txt += '\n';
  }

  txt += `HASHTAGS:\n${post.hashtags.join(' ')}\n`;
  txt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  return txt;
}

function montarFacebook(post) {
  // Facebook: mesmo texto, sem hashtags no início, texto um pouco mais longo
  let txt = '';
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  txt += `👍 FACEBOOK\n`;
  txt += `🕐 ${post.turno.toUpperCase()} · ${post.horario}\n`;
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  txt += `${post.legenda}`;

  if (ehQuinta() && post.cross_mention && post.cross_mention.ativa) {
    txt += post.cross_mention.texto;
  }

  txt += `\n\n${post.cta}\n`;
  // Hashtags no final no Facebook
  txt += `\n${post.hashtags.slice(0, 5).join(' ')}\n`;
  txt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  return txt;
}

function montarGrupo(post) {
  if (!post.grupo_fb || !post.versao_grupo) return '';
  let txt = '';
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  txt += `💬 GRUPOS (WhatsApp + Facebook)\n`;
  txt += `Conta origem: @${post.conta}\n`;
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  txt += post.versao_grupo;
  txt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  return txt;
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  log('=== Distribuidor de Conteúdo ===');

  const hoje     = dataHoje();
  const conteudo = carregarConteudo();
  const postsHoje = conteudo.filter(p => p.data === hoje);

  if (postsHoje.length === 0) {
    log(`Nenhum post para hoje (${hoje}). Dia livre ou JSON ainda não chegou.`);
    return;
  }

  log(`${postsHoje.length} post(s) para hoje: ${postsHoje.map(p => p.turno).join(', ')}`);
  if (ehQuinta()) log('📌 Quinta-feira — cross-mention ativada.');

  // Gerar arquivos
  let instagram = `CONTEÚDO DO DIA — ${hoje}\nGerado automaticamente · Sistema CarlosCostaPrev\n\n`;
  let facebook  = `CONTEÚDO DO DIA — ${hoje}\nGerado automaticamente · Sistema CarlosCostaPrev\n\n`;
  let grupos    = `CONTEÚDO PARA GRUPOS — ${hoje}\nGerado automaticamente · Sistema CarlosCostaPrev\n\n`;

  postsHoje.forEach(post => {
    instagram += montarInstagram(post);
    facebook  += montarFacebook(post);
    const g = montarGrupo(post);
    if (g) grupos += g;
  });

  if (grupos === `CONTEÚDO PARA GRUPOS — ${hoje}\nGerado automaticamente · Sistema CarlosCostaPrev\n\n`) {
    grupos += 'Nenhum post com versão de grupo hoje.\n';
  }

  // Salvar
  if (!fs.existsSync(SOCIAL_DIR)) fs.mkdirSync(SOCIAL_DIR, { recursive: true });

  fs.writeFileSync(path.join(SOCIAL_DIR, 'instagram-hoje.txt'), instagram, 'utf8');
  fs.writeFileSync(path.join(SOCIAL_DIR, 'facebook-hoje.txt'),  facebook,  'utf8');
  fs.writeFileSync(path.join(SOCIAL_DIR, 'grupos-hoje.txt'),    grupos,    'utf8');

  // Salvar também com data (histórico)
  fs.writeFileSync(path.join(SOCIAL_DIR, `instagram-${hoje}.txt`), instagram, 'utf8');
  fs.writeFileSync(path.join(SOCIAL_DIR, `grupos-${hoje}.txt`),    grupos,    'utf8');

  // Gerar painel HTML
  gerarPainel(postsHoje, hoje);

  log(`✅ Arquivos salvos em scripts/social/`);
  log(`   → instagram-hoje.txt`);
  log(`   → facebook-hoje.txt`);
  log(`   → grupos-hoje.txt`);
  log(`   → painel.html`);
  log('=== Concluído ===');

  // Abrir painel no browser
  const painelPath = path.join(SOCIAL_DIR, 'painel.html');
  try {
    const { execSync } = require('child_process');
    execSync(`start "" "${painelPath}"`);
  } catch(e) { /* silencioso */ }
}

function gerarPainel(posts, hoje) {
  const estado = JSON.parse(fs.readFileSync(path.join(__dirname, 'estado.json'), 'utf8'));
  const isQui  = ehQuinta();

  function card(post) {
    const turnoIcon = post.turno === 'manha' ? '🌅' : '🌆';
    const contaIcon = post.conta === 'portaldobpc' ? '🔵' : '🟠';
    const slidesHtml = post.slides && post.slides.length
      ? `<div class="slides"><strong>Slides:</strong><ol>${post.slides.map(s=>`<li>${s}</li>`).join('')}</ol></div>` : '';
    const grupoHtml = post.grupo_fb && post.versao_grupo
      ? `<div class="grupo-box"><div class="grupo-label">💬 Versão para grupos</div><div class="grupo-text">${post.versao_grupo.replace(/\n/g,'<br>')}</div><button onclick="copiar(this,'${encodeURIComponent(post.versao_grupo)}')">Copiar texto do grupo</button></div>` : '';
    const crossHtml = isQui && post.cross_mention && post.cross_mention.ativa
      ? `<div class="cross-badge">📌 Cross-mention ativa hoje (quinta-feira)</div>` : '';
    const legendaCompleta = post.legenda + (isQui && post.cross_mention?.ativa ? post.cross_mention.texto : '');

    return `
    <div class="card ${post.turno}">
      <div class="card-head">
        <span>${turnoIcon} ${post.turno.toUpperCase()} · ${post.horario}</span>
        <span>${contaIcon} @${post.conta}</span>
        <span class="fmt">${post.formato.replace('_',' ')}</span>
      </div>
      <div class="card-body">
        ${crossHtml}
        <div class="gancho">"${post.gancho}"</div>
        <div class="legenda">${post.legenda.replace(/\n/g,'<br>')}</div>
        ${slidesHtml}
        <div class="cta-box">→ ${post.cta}</div>
        <div class="tags">${post.hashtags.join(' ')}</div>
        <div class="btns">
          <button onclick="copiar(this,'${encodeURIComponent(legendaCompleta + '\n\n' + post.cta + '\n\n' + post.hashtags.join(' '))}')">📋 Copiar legenda completa</button>
          <button onclick="copiar(this,'${encodeURIComponent(post.hashtags.join(' '))}')">🏷 Copiar hashtags</button>
        </div>
        ${grupoHtml}
      </div>
    </div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Painel de Conteúdo — ${hoje}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f7f0e8; color: #221913; padding: 24px; }
  header { background: #221913; color: #fff; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  header h1 { font-size: 1.3rem; }
  header .meta { font-size: 0.8rem; opacity: 0.7; }
  .status-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
  .status-chip { background: #fff; border: 1px solid #d0bca5; border-radius: 999px; padding: 6px 14px; font-size: 0.8rem; }
  .status-chip.ok { border-color: #c4673a; color: #c4673a; font-weight: 700; }
  .card { background: #fff; border-radius: 16px; border: 1px solid #e3d4c2; margin-bottom: 20px; overflow: hidden; }
  .card.manha .card-head { background: #a8542d; }
  .card.tarde .card-head { background: #221913; }
  .card-head { color: #fff; padding: 12px 18px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; font-size: 0.85rem; font-weight: 600; }
  .fmt { background: rgba(255,255,255,0.15); padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; margin-left: auto; }
  .card-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
  .gancho { font-size: 1.05rem; font-weight: 700; color: #221913; font-style: italic; border-left: 4px solid #c4673a; padding-left: 12px; }
  .legenda { font-size: 0.9rem; line-height: 1.65; color: #4a3a2c; background: #fbf2e9; padding: 12px; border-radius: 8px; }
  .slides { font-size: 0.85rem; color: #4a3a2c; } .slides ol { margin-left: 18px; margin-top: 6px; } .slides li { margin-bottom: 3px; }
  .cta-box { font-size: 0.85rem; font-weight: 600; color: #1a8c5a; background: #e7f4ec; padding: 8px 12px; border-radius: 8px; }
  .tags { font-size: 0.78rem; color: #7a6552; }
  .btns { display: flex; gap: 8px; flex-wrap: wrap; }
  button { background: #c4673a; color: #fff; border: none; border-radius: 999px; padding: 8px 16px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  button:hover { background: #a8542d; }
  button.copiado { background: #1a8c5a; }
  .grupo-box { background: #f0f4e8; border: 1px solid #cdd6bd; border-radius: 10px; padding: 14px; }
  .grupo-label { font-size: 0.75rem; font-weight: 700; color: #5e7245; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .grupo-text { font-size: 0.88rem; color: #4a3a2c; line-height: 1.6; margin-bottom: 10px; }
  .cross-badge { background: #eaf0f5; border-left: 3px solid #4a6a8a; border-radius: 6px; padding: 7px 12px; font-size: 0.8rem; color: #4a6a8a; font-weight: 600; }
  .nenhum { text-align: center; padding: 48px; color: #7a6552; font-style: italic; }
  footer { text-align: center; font-size: 0.75rem; color: #7a6552; margin-top: 32px; }
</style>
</head>
<body>
<header>
  <div>
    <h1>📋 Painel de Conteúdo</h1>
    <div class="meta">${hoje} · Sistema CarlosCostaPrev + Portal do BPC</div>
  </div>
  <div class="meta">${isQui ? '📌 Quinta-feira — cross-mention ativa' : ''}</div>
</header>

<div class="status-bar">
  <div class="status-chip ok">✅ ${posts.length} post(s) hoje</div>
  <div class="status-chip">📝 Blog: post #${estado.total} · ${estado.ultimoPost?.slug || '-'}</div>
  <div class="status-chip">📅 Próximo blog: ${estado.total + 1}</div>
</div>

${posts.length === 0
  ? '<div class="nenhum">Nenhum post para hoje. Dia livre! 🎉</div>'
  : posts.map(card).join('')}

<footer>Painel gerado automaticamente · distribuir.js · CarlosCostaPrev</footer>

<script>
function copiar(btn, encoded) {
  const texto = decodeURIComponent(encoded);
  navigator.clipboard.writeText(texto).then(() => {
    btn.textContent = '✅ Copiado!';
    btn.classList.add('copiado');
    setTimeout(() => {
      btn.classList.remove('copiado');
      btn.textContent = btn.textContent.includes('legenda') ? '📋 Copiar legenda completa' : btn.textContent.includes('hash') ? '🏷 Copiar hashtags' : '📋 Copiar';
    }, 2000);
  });
}
</script>
</body>
</html>`;

  fs.writeFileSync(path.join(SOCIAL_DIR, 'painel.html'), html, 'utf8');
}

main();
