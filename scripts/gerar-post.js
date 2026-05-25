/**
 * gerar-post.js — CarlosCostaPrev Blog Automation
 * Roda 2x/semana (Terça e Sexta 08h00)
 * Gera artigo via Claude API + foto via Pexels + deploy Cloudflare Pages
 */

const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const { execSync } = require('child_process');

// ── Caminhos ────────────────────────────────────────────────────────────────
const ROOT       = path.join(__dirname, '..');
const BLOG_DIR   = path.join(ROOT, 'blog');
const IMGS_DIR   = path.join(ROOT, 'assets', 'images', 'blog');
const ESTADO     = path.join(__dirname, 'estado.json');
const LOG_FILE   = path.join(__dirname, 'log.txt');

// ── Número para receber o aviso no WhatsApp ─────────────────────────────────
const WA_AVISO_NUMERO = '5521964238080'; // troque pelo seu número pessoal se quiser

// ── Chaves de API (configure no ambiente ou edite aqui) ─────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const PEXELS_KEY    = process.env.PEXELS_API_KEY    || '';
const CF_TOKEN      = process.env.CF_API_TOKEN || '';
const CF_ACCOUNT    = 'a68fb5edd5af87de47e28d4a977933c2';

// ── 52 temas (1 ano de conteúdo — 2x/semana) ────────────────────────────────
const TEMAS = [
  { slug: 'bpc-loas-como-requerer',           titulo: 'BPC/LOAS: Como Requerer e Quem Tem Direito',                              tag: 'BPC/LOAS',      q: 'elderly senior social welfare support' },
  { slug: 'aposentadoria-por-invalidez',       titulo: 'Aposentadoria por Invalidez: Requisitos e Diferenças para Auxílio-Doença', tag: 'Aposentadoria',  q: 'disability pension documents healthcare' },
  { slug: 'tempo-especial-insalubridade',      titulo: 'Tempo Especial: Como Converter Insalubridade em Aposentadoria',           tag: 'Aposentadoria',  q: 'factory worker safety industrial' },
  { slug: 'revisao-vida-toda',                 titulo: 'Revisão da Vida Toda: O Que É e Quem Pode Pedir',                         tag: 'Revisão',        q: 'legal review documents desk lawyer' },
  { slug: 'auxilio-acidente',                  titulo: 'Auxílio-Acidente: Quando o INSS Paga Mesmo Você Trabalhando',             tag: 'Auxílio',        q: 'workplace accident safety construction' },
  { slug: 'pensao-por-morte',                  titulo: 'Pensão por Morte: Quem Tem Direito e Como Requerer',                      tag: 'Pensão',         q: 'family support social security benefit' },
  { slug: 'salario-maternidade',               titulo: 'Salário-Maternidade: Regras para MEI, Autônoma e CLT',                    tag: 'Benefícios',     q: 'maternity pregnancy mother healthcare' },
  { slug: 'cnis-como-corrigir',                titulo: 'Como Corrigir Erros no CNIS e Proteger seu Benefício',                    tag: 'CNIS',           q: 'government records office documents' },
  { slug: 'aposentadoria-rural',               titulo: 'Aposentadoria Rural: Documentos e Provas Necessárias',                    tag: 'Aposentadoria',  q: 'rural farmer Brazil countryside field' },
  { slug: 'recurso-inss-negado',               titulo: 'INSS Negou seu Benefício? Como Recorrer Corretamente',                    tag: 'Recursos',       q: 'appeal justice legal court rights' },
  { slug: 'carencia-inss',                     titulo: 'Carência no INSS: O Que É e Quantos Meses São Necessários',               tag: 'INSS',           q: 'calendar planning insurance months' },
  { slug: 'aposentadoria-professor',           titulo: 'Aposentadoria de Professor: Regras e Vantagens',                          tag: 'Aposentadoria',  q: 'teacher classroom education school' },
  { slug: 'declaracao-hipossuficiencia',       titulo: 'Declaração de Hipossuficiência: Quando Usar e Como Fazer',                tag: 'Documentos',     q: 'legal documents signing pen paper' },
  { slug: 'auxilio-doenca-mei',                titulo: 'Auxílio-Doença para MEI: Tem Direito? Como Pedir?',                       tag: 'Auxílio',        q: 'small business owner sick leave medical' },
  { slug: 'pericia-inss-preparacao',           titulo: 'Perícia do INSS: Como se Preparar para Não Perder o Benefício',           tag: 'Perícia',        q: 'medical examination doctor appointment' },
  { slug: 'regra-pontos-aposentadoria',        titulo: 'Regra dos Pontos: Como Funciona em 2025',                                 tag: 'Aposentadoria',  q: 'calculator retirement planning finance' },
  { slug: 'segurado-especial-rural',           titulo: 'Segurado Especial: Regras para Trabalhadores Rurais',                     tag: 'Rural',          q: 'rural smallholder farm agriculture' },
  { slug: 'jef-processo-gratuito',             titulo: 'JEF: Como Processar seu Direito Previdenciário Gratuitamente',            tag: 'Processo',       q: 'courtroom justice legal proceedings' },
  { slug: 'contribuicao-autonomo-inss',        titulo: 'Como Contribuir para o INSS como Autônomo e Garantir Benefícios',         tag: 'Contribuição',   q: 'self employed freelancer working home' },
  { slug: 'bpc-suspenso',                      titulo: 'BPC Suspenso ou Revogado: O Que Fazer Imediatamente',                     tag: 'BPC/LOAS',       q: 'elderly senior citizen concern stress' },
  { slug: 'regras-transicao-aposentadoria',    titulo: 'Regras de Transição para Aposentadoria: Qual Vale para Você?',            tag: 'Aposentadoria',  q: 'retirement planning future decision' },
  { slug: 'doenca-preexistente-inss',          titulo: 'Doença Preexistente e o INSS: Quando Você Tem Direito Mesmo Assim',       tag: 'Auxílio',        q: 'chronic illness medical records hospital' },
  { slug: 'ppp-laudo-insalubridade',           titulo: 'PPP e Laudo de Insalubridade: Documentos que Valem Ouro',                 tag: 'Documentos',     q: 'industrial hazard work equipment documents' },
  { slug: 'dependente-inss-regras',            titulo: 'Quem Pode Ser Dependente no INSS? Regras Atualizadas',                    tag: 'Benefícios',     q: 'family legal documentation together' },
  { slug: 'revisao-beneficio-valor',           titulo: 'Como Pedir a Revisão do Valor do seu Benefício INSS',                     tag: 'Revisão',        q: 'review audit financial documents calculator' },
  { slug: 'incapacidade-parcial',              titulo: 'Incapacidade Parcial: Quando o INSS Deve Conceder Auxílio Assim Mesmo',   tag: 'Auxílio',        q: 'partial disability rehabilitation work' },
  { slug: 'aposentadoria-especial',            titulo: 'Aposentadoria Especial: Quem Tem Direito e Como Comprovar',               tag: 'Aposentadoria',  q: 'chemical laboratory worker protection' },
  { slug: 'acidente-trabalho-inss',            titulo: 'Acidente de Trabalho: Seus Direitos no INSS',                             tag: 'Auxílio',        q: 'workplace injury accident emergency' },
  { slug: 'reabilitacao-profissional',         titulo: 'Reabilitação Profissional pelo INSS: Como Funciona',                      tag: 'INSS',           q: 'professional rehabilitation training career' },
  { slug: 'inss-mei-contribuicao',             titulo: 'MEI e o INSS: Quanto Pagar e Quais Benefícios Tem Direito',               tag: 'Contribuição',   q: 'microentrepreneur small business brazil' },
  { slug: 'aposentadoria-programada-2025',     titulo: 'Aposentadoria Programada em 2025: Tudo Atualizado',                       tag: 'Aposentadoria',  q: 'retirement senior couple happy planning' },
  { slug: 'cid-auxilio-doenca',                titulo: 'CID e Auxílio-Doença: Quais Doenças Garantem o Benefício',                tag: 'Auxílio',        q: 'medical diagnosis disease healthcare' },
  { slug: 'auxilio-inclusao-bpc',              titulo: 'Auxílio-Inclusão: O Que É e Quem Pode Receber com BPC',                   tag: 'BPC/LOAS',       q: 'disability inclusion social support' },
  { slug: 'cumprimento-carencia-rural',        titulo: 'Carência para Trabalhador Rural: Regras Diferentes que Você Precisa Saber', tag: 'Rural',         q: 'rural farm worker harvest seasonal' },
  { slug: 'habilitacao-beneficio-inss',        titulo: 'Como Habilitar seu Benefício no INSS Sem Erro',                           tag: 'INSS',           q: 'government office service registration' },
  { slug: 'julgamento-tese-previdenciaria',    titulo: 'Teses Previdenciárias no STJ: O Que Mudou Recentemente',                  tag: 'Jurisprudência', q: 'supreme court justice legal decision' },
  { slug: 'inss-positivo-negativo',            titulo: 'O Que o INSS Pode e Não Pode Fazer na sua Análise',                       tag: 'INSS',           q: 'insurance agency government worker desk' },
  { slug: 'beneficio-por-incapacidade',        titulo: 'Benefício por Incapacidade Temporária: As Mudanças da Reforma',           tag: 'Auxílio',        q: 'medical certificate disability temporary' },
  { slug: 'salario-contribuicao-calculo',      titulo: 'Salário de Contribuição: Como é Calculado e o Que Inclui',                tag: 'Contribuição',   q: 'salary calculation payroll documents' },
  { slug: 'simulacao-aposentadoria-online',    titulo: 'Como Simular sua Aposentadoria no Meu INSS',                              tag: 'INSS',           q: 'online government portal digital service' },
  { slug: 'direito-aposentado-trabalhar',      titulo: 'Aposentado Pode Trabalhar? Regras e Impactos no Benefício',               tag: 'Aposentadoria',  q: 'retired senior working job office' },
  { slug: 'mandado-seguranca-inss',            titulo: 'Mandado de Segurança contra o INSS: Quando Usar',                         tag: 'Processo',       q: 'legal mandate court order justice' },
  { slug: 'tutela-antecipada-inss',            titulo: 'Tutela Antecipada contra o INSS: Como Receber Antes da Sentença',         tag: 'Processo',       q: 'urgent legal court hearing decision' },
  { slug: 'concessao-administrativa-inss',     titulo: 'Concessão Administrativa: Resolver sem Processo Judicial É Possível',     tag: 'INSS',           q: 'administrative office meeting negotiation' },
  { slug: 'beneficio-indeferido-prazo',        titulo: 'Benefício Indeferido: Quais os Prazos para Recorrer',                     tag: 'Recursos',       q: 'deadline calendar urgency time' },
  { slug: 'horas-extras-contagem-tempo',       titulo: 'Horas Extras e Adicional de Insalubridade Contam no INSS?',              tag: 'Contribuição',   q: 'overtime work extra hours payment' },
  { slug: 'empregada-domestica-inss',          titulo: 'Empregada Doméstica e o INSS: Direitos e Como Requerer',                  tag: 'Benefícios',     q: 'domestic worker home cleaning housework' },
  { slug: 'fgts-previdencia-diferenca',        titulo: 'FGTS e Previdência Social: Entenda a Diferença',                          tag: 'Contribuição',   q: 'savings fund financial planning documents' },
  { slug: 'inss-construtora-obra',             titulo: 'Trabalhei em Obra Sem Registro: Como Comprovar no INSS',                  tag: 'Documentos',     q: 'construction worker building site labor' },
  { slug: 'estabilidade-acidente-trabalho',    titulo: 'Estabilidade Após Acidente de Trabalho: Prazo e Regras',                  tag: 'Auxílio',        q: 'work accident recovery stable employment' },
  { slug: 'aposentadoria-deficiencia',         titulo: 'Aposentadoria da Pessoa com Deficiência: Regras e Vantagens',             tag: 'Aposentadoria',  q: 'disability inclusion accessible rights' },
  { slug: 'beneficio-assistencial-bpc-autismo',titulo: 'BPC para Autismo: Como Comprovar e Requerer',                             tag: 'BPC/LOAS',       q: 'autism support disability child family' },
];

// ── Log com arquivo ──────────────────────────────────────────────────────────
function log(msg) {
  const linha = '[' + new Date().toLocaleString('pt-BR') + '] ' + msg;
  console.log(linha);
  fs.appendFileSync(LOG_FILE, linha + '\n');
}

// ── Notificação Windows (balloon popup) ──────────────────────────────────────
function notificarWindows(titulo, corpo) {
  try {
    const t = titulo.replace(/'/g, '').replace(/"/g, '');
    const c = corpo.replace(/'/g, '').replace(/"/g, '');
    const script = path.join(__dirname, '_notify.ps1');
    fs.writeFileSync(script,
      `Add-Type -AssemblyName System.Windows.Forms\n` +
      `$n = New-Object System.Windows.Forms.NotifyIcon\n` +
      `$n.Icon = [System.Drawing.SystemIcons]::Information\n` +
      `$n.BalloonTipIcon = 'Info'\n` +
      `$n.BalloonTipTitle = '${t}'\n` +
      `$n.BalloonTipText = '${c}'\n` +
      `$n.Visible = $true\n` +
      `$n.ShowBalloonTip(8000)\n` +
      `Start-Sleep -Seconds 9\n` +
      `$n.Dispose()\n`
    );
    execSync(`powershell -NoProfile -WindowStyle Hidden -File "${script}"`, { timeout: 12000 });
    fs.unlinkSync(script);
  } catch(e) { /* silencioso */ }
}

// ── Aviso via WhatsApp (usa backend SistemaPrev se estiver rodando) ──────────
function notificarWhatsApp(titulo, slug) {
  return new Promise(resolve => {
    const url = 'https://carloscostaprev.pages.dev/blog/' + slug + '.html';
    const msg = '🟢 *Novo post publicado no blog!*\n\n📄 *' + titulo + '*\n\n🔗 ' + url;
    const body = JSON.stringify({ toNumber: WA_AVISO_NUMERO, content: msg });

    const opts = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/whatsapp/send-direct',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };

    const req = http.request(opts, res => {
      res.resume();
      if (res.statusCode === 200 || res.statusCode === 201) {
        log('Aviso WhatsApp enviado para ' + WA_AVISO_NUMERO);
      } else {
        log('WhatsApp: backend retornou ' + res.statusCode + ' (backend pode estar offline)');
      }
      resolve();
    });
    req.on('error', () => {
      log('WhatsApp: backend offline — aviso não enviado (normal se o sistema estiver fechado)');
      resolve();
    });
    req.setTimeout(4000, () => { req.destroy(); resolve(); });
    req.write(body);
    req.end();
  });
}

// ── Entrada no log de publicações ────────────────────────────────────────────
function registrarPublicacao(tema, url) {
  const entrada = [
    '',
    '═══════════════════════════════════════════',
    '  POST PUBLICADO — ' + new Date().toLocaleString('pt-BR'),
    '  Título : ' + tema.titulo,
    '  Tag    : ' + tema.tag,
    '  URL    : https://carloscostaprev.pages.dev/blog/' + tema.slug + '.html',
    '═══════════════════════════════════════════',
    '',
  ].join('\n');
  fs.appendFileSync(LOG_FILE, entrada);
}

function lerEstado() {
  if (!fs.existsSync(ESTADO)) return { usados: [], total: 0 };
  return JSON.parse(fs.readFileSync(ESTADO, 'utf8'));
}

function salvarEstado(estado) {
  fs.writeFileSync(ESTADO, JSON.stringify(estado, null, 2));
}

function proximoTema(estado) {
  const disponiveis = TEMAS.filter(t => !estado.usados.includes(t.slug));
  if (disponiveis.length === 0) {
    log('Todos os temas foram usados. Reiniciando ciclo.');
    estado.usados = [];
    return TEMAS[0];
  }
  return disponiveis[0];
}

function slugParaData() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function slugParaDatetime() {
  return new Date().toISOString().split('T')[0];
}

// ── Pexels: buscar e baixar foto ─────────────────────────────────────────────
function buscarFotoPexels(query, slug) {
  return new Promise((resolve) => {
    if (!PEXELS_KEY) {
      log('AVISO: PEXELS_API_KEY não configurada — usando imagem padrão.');
      resolve(null);
      return;
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`;
    const opts = { headers: { Authorization: PEXELS_KEY } };

    https.get(url, opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.photos || json.photos.length === 0) { resolve(null); return; }
          // Pega a 2ª foto (evitar sempre a mesma)
          const foto = json.photos[Math.min(1, json.photos.length - 1)];
          const imgUrl = foto.src.large;
          const imgPath = path.join(IMGS_DIR, slug + '.jpg');

          baixarArquivo(imgUrl, imgPath).then(() => {
            log('Foto baixada: ' + imgPath);
            resolve('/assets/images/blog/' + slug + '.jpg');
          }).catch(() => resolve(null));
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function baixarArquivo(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    lib.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        baixarArquivo(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

// ── Claude API: gerar artigo ─────────────────────────────────────────────────
function gerarArtigo(tema) {
  return new Promise((resolve, reject) => {
    if (!ANTHROPIC_KEY) {
      log('AVISO: ANTHROPIC_API_KEY não configurada — usando conteúdo de exemplo.');
      resolve(conteudoExemplo(tema));
      return;
    }

    const prompt = `Você é Carlos Costa, advogado especialista em Direito Previdenciário com mais de 10 anos de experiência em Irajá, Rio de Janeiro.

Escreva um artigo de blog completo sobre: "${tema.titulo}"

Regras:
- Tom: profissional mas acessível, como se explicasse para um cliente
- Estrutura: 4 a 6 seções com subtítulos (H2)
- Cada seção: 2 a 3 parágrafos
- Sem jargão excessivo — explique termos técnicos quando usar
- Foco prático: o leitor deve saber o que fazer após ler
- Não mencione concorrentes ou outros escritórios
- NÃO inclua HTML — só o texto puro com marcações simples:
  ## Subtítulo
  Parágrafo normal.

Responda APENAS com o conteúdo do artigo (sem título, sem introdução do tipo "Aqui está o artigo").`;

    const body = JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const opts = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const texto = json.content[0].text;
          resolve(texto);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function conteudoExemplo(tema) {
  return `## Entendendo o Tema

Este artigo aborda ${tema.titulo}. O Direito Previdenciário brasileiro oferece uma série de garantias para os trabalhadores que nem sempre são conhecidas pelo grande público.

É fundamental entender seus direitos antes de precisar deles. Muitas pessoas perdem benefícios por não saberem como agir no momento certo.

## Quem Tem Direito

Para ter direito a este benefício, é necessário cumprir alguns requisitos estabelecidos pela legislação previdenciária. O INSS analisa cada caso de forma individual, por isso é importante ter todos os documentos corretos.

A análise pode variar conforme o tipo de vínculo empregatício e o histórico de contribuições do segurado.

## Como Requerer

O requerimento pode ser feito pelo aplicativo Meu INSS, pelo site oficial ou pessoalmente em uma agência. Reúna seus documentos antes de iniciar o processo para evitar atrasos.

Em caso de dúvida ou indeferimento, um advogado especialista em Direito Previdenciário pode orientar o melhor caminho.

## O Que Fazer em Caso de Negativa

Se o INSS negar seu benefício, não desanime. Existe o direito ao recurso administrativo e, se necessário, a via judicial. Os prazos são importantes — não deixe para depois.

## Conclusão

Conhecer seus direitos previdenciários é o primeiro passo para garanti-los. Se você tiver dúvidas sobre este tema, entre em contato — ofereço análise gratuita do seu caso.`;
}

// ── Escape de HTML para prevenir XSS em conteúdo gerado ─────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Gerar HTML do artigo ─────────────────────────────────────────────────────
function gerarHtmlArtigo(tema, conteudo, imgPath) {
  const data = slugParaData();
  const datetime = slugParaDatetime();
  const imgTag = imgPath
    ? `<img src="${imgPath}" alt="${tema.titulo}" style="width:100%;height:100%;object-fit:cover;">`
    : tema.tag;

  // Converter markdown simples para HTML
  const sections = conteudo.split('\n## ').filter(s => s.trim());
  let htmlSections = '';
  sections.forEach(section => {
    const lines = section.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;
    const titulo = escapeHtml(lines[0].replace(/^##\s*/, '').trim());
    const paras  = lines.slice(1).filter(l => l.trim()).map(l => `<p>${escapeHtml(l.trim())}</p>`).join('\n          ');
    htmlSections += `
        <h2>${titulo}</h2>
        ${paras}`;
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tema.titulo} — CarlosCostaPrev</title>
  <meta name="description" content="${tema.titulo}. Orientação especializada em Direito Previdenciário por CarlosCostaPrev, Irajá/RJ.">
  <link rel="canonical" href="https://carloscostaprev.com.br/blog/${tema.slug}.html">
  <meta name="theme-color" content="#c4673a">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Carlos Costa — CarlosCostaPrev">
  <meta name="geo.region" content="BR-RJ">
  <meta name="geo.placename" content="Irajá, Rio de Janeiro, Brasil">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="CarlosCostaPrev">
  <meta property="og:title" content="${tema.titulo} — CarlosCostaPrev">
  <meta property="og:description" content="${tema.titulo}. Orientação especializada em Direito Previdenciário.">
  <meta property="og:url" content="https://carloscostaprev.com.br/blog/${tema.slug}.html">
  <meta property="og:image" content="${imgPath ? 'https://carloscostaprev.com.br' + imgPath : 'https://carloscostaprev.com.br/assets/images/og-cover.jpg'}">
  <meta property="article:published_time" content="${datetime}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/variables.css">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <style>
    .site-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 14px 0; background: rgba(14,8,6,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glass-border); }
    .site-nav__inner { display: flex; align-items: center; gap: var(--gap-xl); }
    .site-nav__logo { font-size: var(--text-lg); font-weight: 900; text-decoration: none; color: var(--text-primary); }
    .site-nav__logo span { color: var(--accent); }
    .site-nav__links { display: flex; align-items: center; gap: var(--gap-lg); margin-left: auto; }
    .site-nav__links a { font-size: var(--text-sm); color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
    .site-nav__links a:hover { color: var(--accent); }
    .article-hero { padding: 100px 0 0; background: var(--bg-deep); }
    .article-hero__img { width: 100%; max-height: 400px; object-fit: cover; display: block; }
    .article-hero__inner { padding: 40px 0 30px; }
    .article-body { max-width: 720px; margin: 0 auto; padding: 0 clamp(16px,4vw,40px) var(--section-py); background: var(--bg-deep); }
    .article-body h2 { font-size: var(--text-xl); margin: var(--gap-xl) 0 var(--gap-md); color: var(--text-primary); }
    .article-body p { margin-bottom: var(--gap-md); color: var(--text-muted); line-height: 1.8; }
    .article-meta { display: flex; align-items: center; gap: var(--gap-md); margin-top: 14px; flex-wrap: wrap; }
    .article-tag { display: inline-block; padding: 3px 10px; background: var(--accent-glass); border: 1px solid var(--accent-border); border-radius: 99px; font-size: var(--text-xs); font-weight: 700; color: var(--accent); letter-spacing: 1px; text-transform: uppercase; }
    .article-date { font-size: var(--text-xs); color: var(--text-faint); }
    .article-cta { background: var(--accent-glass); border: 1px solid var(--accent-border); border-radius: var(--radius-lg); padding: var(--gap-xl); text-align: center; margin-top: var(--gap-xl); }
    .article-cta h3 { font-size: var(--text-xl); margin-bottom: 8px; }
    .article-cta p { color: var(--text-muted); margin-bottom: var(--gap-lg); }
    footer { text-align: center; padding: var(--gap-xl) 0; background: var(--bg-deep); border-top: 1px solid var(--glass-border); }
    footer p { font-size: var(--text-xs); color: var(--text-faint); }
  </style>
</head>
<body>
<nav class="site-nav" aria-label="Navegação">
  <div class="container site-nav__inner">
    <a href="../" class="site-nav__logo">Carlos<span>Costa</span>Prev</a>
    <div class="site-nav__links">
      <a href="../">Início</a>
      <a href="../beneficios.html">Benefícios</a>
      <a href="../servicos.html">Serviços</a>
      <a href="index.html">← Blog</a>
    </div>
  </div>
</nav>

<article>
  <div class="article-hero">
    ${imgPath ? `<img src="${imgPath}" alt="${tema.titulo}" class="article-hero__img">` : ''}
    <div class="container article-hero__inner">
      <div class="article-meta">
        <span class="article-tag">${tema.tag}</span>
        <time class="article-date" datetime="${datetime}">Publicado em ${data} · por Carlos Costa</time>
      </div>
      <h1 style="font-size: var(--text-h2); margin-top: 16px;">${tema.titulo}</h1>
    </div>
  </div>

  <div class="container">
    <div class="article-body">
      ${htmlSections}

      <div class="article-cta">
        <h3>Análise Gratuita do Seu Caso</h3>
        <p>Cada situação é única. Fale com Carlos Costa e descubra se você tem direito a este ou outros benefícios.</p>
        <a href="https://wa.me/5521964238080?text=Ol%C3%A1%2C+li+o+artigo+sobre+${encodeURIComponent(tema.titulo)}+e+gostaria+de+uma+an%C3%A1lise+gratuita." class="btn btn--primary" target="_blank" rel="noopener">
          Falar com o especialista no WhatsApp
        </a>
      </div>
    </div>
  </div>
</article>

<footer>
  <div class="container">
    <p>© 2026 CarlosCostaPrev — <a href="../" style="color: var(--accent);">Voltar ao site</a> · <a href="index.html" style="color: var(--accent);">Blog</a></p>
  </div>
</footer>
</body>
</html>`;
}

// ── Atualizar index.html do blog ─────────────────────────────────────────────
function atualizarIndexBlog(tema, imgPath) {
  const indexPath = path.join(BLOG_DIR, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const thumb = imgPath
    ? `<img src="${imgPath}" alt="${tema.titulo}" style="width:100%;height:100%;object-fit:cover;display:block;">`
    : tema.tag;

  const novoCard = `
      <article class="blog-card">
        <div class="blog-card__thumb" style="${imgPath ? 'padding:0;' : ''}">${thumb}</div>
        <div class="blog-card__body">
          <p class="blog-card__tag">${tema.tag}</p>
          <h2><a href="${tema.slug}.html">${tema.titulo}</a></h2>
          <p>Artigo publicado em ${slugParaData()}. Leia e entenda seus direitos previdenciários.</p>
          <a href="${tema.slug}.html" class="btn btn-secondary" style="align-self: flex-start; margin-top: var(--gap-sm);">Ler artigo →</a>
        </div>
      </article>`;

  // Só injeta se o artigo ainda não estiver no index (evita duplicatas)
  if (html.includes(`href="${tema.slug}.html"`)) {
    log('index.html: card já existe, pulando inserção.');
    return;
  }

  // Injeta após a abertura do grid
  html = html.replace(
    '<div class="blog-list__grid">',
    '<div class="blog-list__grid">' + novoCard
  );

  fs.writeFileSync(indexPath, html);
  log('index.html atualizado com novo card.');
}

// ── Deploy Cloudflare Pages ──────────────────────────────────────────────────
function deploy() {
  log('Iniciando deploy no Cloudflare Pages...');
  try {
    execSync(
      `npx wrangler pages deploy "${ROOT}" --project-name=carloscostaprev --branch=main --commit-dirty=true`,
      {
        env: {
          ...process.env,
          CLOUDFLARE_API_TOKEN: CF_TOKEN,
          CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT,
        },
        cwd: ROOT,
        stdio: 'inherit'
      }
    );
    log('Deploy concluído com sucesso!');
  } catch(e) {
    log('Erro no deploy: ' + e.message);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  log('=== Iniciando gerador de post ===');

  const estado = lerEstado();
  const tema   = proximoTema(estado);
  log('Tema: ' + tema.titulo);

  // 1. Foto
  const imgPath = await buscarFotoPexels(tema.q, tema.slug);

  // 2. Conteúdo via Claude
  log('Gerando conteúdo com IA...');
  const conteudo = await gerarArtigo(tema);

  // 3. Criar HTML do artigo
  const htmlArtigo = gerarHtmlArtigo(tema, conteudo, imgPath);
  const artigoPath = path.join(BLOG_DIR, tema.slug + '.html');
  fs.writeFileSync(artigoPath, htmlArtigo);
  log('Artigo criado: ' + artigoPath);

  // 4. Atualizar index.html
  atualizarIndexBlog(tema, imgPath);

  // 5. Marcar tema como usado
  estado.usados.push(tema.slug);
  estado.total++;
  estado.ultimoPost = { slug: tema.slug, titulo: tema.titulo, data: new Date().toISOString() };
  salvarEstado(estado);

  // 6. Deploy
  deploy();

  // 7. Registrar no log de publicações
  registrarPublicacao(tema);

  // 8. Notificações
  const avisoCorpo = 'Post #' + estado.total + ' publicado: ' + tema.titulo;
  notificarWindows('✅ CarlosCostaPrev Blog', avisoCorpo);
  await notificarWhatsApp(tema.titulo, tema.slug);

  log('=== Post #' + estado.total + ' publicado: ' + tema.titulo + ' ===');
}

main().catch(err => {
  console.error('ERRO FATAL:', err);
  process.exit(1);
});
