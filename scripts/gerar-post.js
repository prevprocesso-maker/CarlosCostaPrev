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
  // REMOVIDO: Revisão da Vida Toda — encerrada pelo STF (mai/2026), não tem mais aplicação prática
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

    const internalKey = process.env.INTERNAL_API_KEY || 'blog-notify-carloscostaprev-2026';
    const opts = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/whatsapp/internal/blog-notify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-internal-key': internalKey,
      },
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
  <link rel="icon" type="image/png" href="../assets/favicon.png">
  <link rel="apple-touch-icon" href="../assets/favicon.png">
  <!-- ===== Analytics (Google Analytics 4) ===== -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-T7ZNB2FXZY"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('consent', 'default', { 'analytics_storage': 'denied', 'ad_storage': 'denied' });
    gtag('config', 'G-T7ZNB2FXZY', { 'anonymize_ip': true });
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tema.titulo} — CarlosCostaPrev</title>
  <meta name="description" content="${tema.titulo}. Orientação especializada em Direito Previdenciário por CarlosCostaPrev, Irajá/RJ.">
  <link rel="canonical" href="https://carloscostaprev.com.br/blog/${tema.slug}.html">
  <meta name="theme-color" content="#c4673a">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Carlos Costa — CarlosCostaPrev">
  <meta name="geo.region" content="BR-RJ">
  <meta name="geo.placename" content="Irajá, Rio de Janeiro, Brasil">
  <meta name="geo.position" content="-22.8383;-43.3202">
  <meta name="ICBM" content="-22.8383, -43.3202">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="CarlosCostaPrev">
  <meta property="og:title" content="${tema.titulo} — CarlosCostaPrev">
  <meta property="og:description" content="${tema.titulo}. Orientação especializada em Direito Previdenciário.">
  <meta property="og:url" content="https://carloscostaprev.com.br/blog/${tema.slug}.html">
  <meta property="og:image" content="${imgPath ? 'https://carloscostaprev.com.br' + imgPath : 'https://carloscostaprev.com.br/assets/images/og-cover.jpg'}">
  <meta property="og:locale" content="pt_BR">
  <meta property="article:published_time" content="${datetime}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${tema.titulo} — CarlosCostaPrev">
  <meta name="twitter:description" content="${tema.titulo}. Orientação especializada em Direito Previdenciário.">
  <meta name="twitter:image" content="https://carloscostaprev.com.br/assets/images/og-cover.jpg">
  <link rel="me" href="https://www.instagram.com/carloscostaprev">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"></noscript>
  <link rel="stylesheet" href="../assets/css/variables.css">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <link rel="stylesheet" href="../assets/css/sections.css">
  <style>
    .article-hero { padding: 100px 0 0; background: var(--bg-deep); }
    .article-hero__img { width: 100%; max-height: 400px; object-fit: cover; display: block; }
    .article-hero__inner { padding: 40px 0 30px; }
    .article-body { max-width: 720px; margin: 0 auto; padding: 0 clamp(16px,4vw,40px) var(--section-py); background: var(--bg-deep); }
    .article-body h2 { font-size: var(--text-xl); margin: var(--gap-xl) 0 var(--gap-md); color: var(--text-primary); }
    .article-body p { margin-bottom: var(--gap-md); color: var(--text-muted); line-height: 1.8; }
    .article-body ul { margin: var(--gap-md) 0 var(--gap-md) var(--gap-lg); display: flex; flex-direction: column; gap: var(--gap-sm); list-style: disc; }
    .article-body ul li { color: var(--text-muted); font-size: var(--text-base); }
    .article-meta { display: flex; align-items: center; gap: var(--gap-md); margin-top: 14px; flex-wrap: wrap; }
    .article-tag { display: inline-block; padding: 3px 10px; background: var(--accent-glass); border: 1px solid var(--accent-border); border-radius: 99px; font-size: var(--text-xs); font-weight: 700; color: var(--accent); letter-spacing: 1px; text-transform: uppercase; }
    .article-date { font-size: var(--text-xs); color: var(--text-faint); }
    .article-cta { background: var(--accent-glass); border: 1px solid var(--accent-border); border-radius: var(--radius-lg); padding: var(--gap-xl); text-align: center; margin-top: var(--gap-xl); }
    .article-cta h3 { font-size: var(--text-xl); margin-bottom: 8px; }
    .article-cta p { color: var(--text-muted); margin-bottom: var(--gap-lg); }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${tema.titulo}",
    "description": "${tema.titulo}. Orientação especializada em Direito Previdenciário.",
    "author": { "@type": "Person", "name": "Carlos Costa", "worksFor": { "@type": "Organization", "name": "CarlosCostaPrev" } },
    "publisher": { "@type": "Organization", "name": "CarlosCostaPrev", "url": "https://carloscostaprev.com.br" },
    "datePublished": "${datetime}",
    "url": "https://carloscostaprev.com.br/blog/${tema.slug}.html"
  }
  </script>
</head>
<body>
<nav class="navbar" id="navbar" role="navigation" aria-label="Menu principal">
  <div class="container navbar__inner">
    <a href="/" class="navbar__logo" aria-label="CarlosCostaPrev - Início">
      <img src="../assets/logo-monograma-cc.png" alt="CarlosCostaPrev" class="header-logo-mark">
      <span class="header-logo-text">
        <span class="header-logo-text-1">CarlosCosta</span>
        <span class="header-logo-text-2">Prev<span class="header-logo-dot">.</span></span>
        <span class="header-logo-tagline">PREVIDÊNCIA · INSS · ACOLHIMENTO</span>
      </span>
    </a>
    <ul class="navbar__links" id="nav-links" role="list">
      <li><a href="../beneficios.html">Benefícios</a></li>
      <li><a href="../servicos.html">Serviços</a></li>
      <li><a href="index.html">Blog</a></li>
    </ul>
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
        <a href="https://wa.me/5521964238080?text=Ol%C3%A1%2C+li+o+artigo+sobre+${encodeURIComponent(tema.titulo)}+e+gostaria+de+uma+an%C3%A1lise+gratuita." class="btn btn-whatsapp" target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          Falar com Carlos Costa
        </a>
      </div>
    </div>
  </div>
</article>

<footer class="rodape" role="contentinfo">
  <div class="container">
    <div class="rodape__grid rodape__grid--5col">
      <div class="rodape__col">
        <div class="rodape__logo">
          <img src="../assets/logo-monograma-cc.png" alt="CarlosCostaPrev" class="rodape__logo-mark">
          <div class="rodape__logo-text">
            <span class="rodape__logo-name1">CarlosCosta</span>
            <span class="rodape__logo-name2">Prev<span>.</span></span>
          </div>
        </div>
        <p>Especialista em Previdência Social.<br>Irajá, Rio de Janeiro.<br>Atendimento online para todo o Brasil.</p>
        <div class="social-links" aria-label="Redes sociais">
          <a href="https://www.instagram.com/carloscostaprev" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
          <a href="https://www.facebook.com/carloscostaprev" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a href="https://g.page/r/CcJNe260Go7AEBM/review" target="_blank" rel="noopener noreferrer" aria-label="Google"><svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg></a>
        </div>
      </div>
      <div class="rodape__map-col">
        <iframe src="https://maps.google.com/maps?q=Pra%C3%A7a+Nossa+Senhora+da+Apresenta%C3%A7%C3%A3o%2C+Iraj%C3%A1%2C+Rio+de+Janeiro&hl=pt-BR&z=16&output=embed" width="100%" height="100%" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa — CarlosCostaPrev, Irajá/RJ"></iframe>
      </div>
      <a href="https://g.page/r/CcJNe260Go7AEBM/review" target="_blank" rel="noopener noreferrer" class="rodape__review-col" aria-label="Avaliar Carlos Costa no Google">
        <div class="review-card-text">
          <div class="review-card-stars" aria-hidden="true"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <div class="review-card-kicker">UMA AVALIAÇÃO SUA SALVA OUTRA FAMÍLIA</div>
          <h3 class="review-card-title">Conseguiu seu benefício?<em> Conta pra quem ainda está perdido.</em></h3>
        </div>
        <span class="review-card-btn">Avaliar no Google <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></span>
      </a>
      <nav class="rodape__col" aria-label="Links do rodapé">
        <h4>Navegação</h4>
        <ul>
          <li><a href="/">Início</a></li>
          <li><a href="../beneficios.html">Benefícios</a></li>
          <li><a href="../servicos.html">Serviços</a></li>
          <li><a href="index.html">Blog</a></li>
        </ul>
      </nav>
      <address class="rodape__col" aria-label="Contato e endereço">
        <h4>Contato</h4>
        <ul>
          <li><a href="https://wa.me/5521964238080" target="_blank" rel="noopener noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> WhatsApp: (21) 96423-8080</a></li>
        </ul>
        <h4 style="margin-top: 1rem;">Endereço</h4>
        <p>Praça Nossa Sra. da Apresentação, 223 — Sala 206<br>Irajá · Rio de Janeiro · RJ<br>CEP 21231-230<br><em style="color: var(--accent); font-style: normal; font-size: var(--text-xs);">+ Atendimento online para todo o Brasil</em></p>
      </address>
    </div>
    <div class="rodape__bottom">
      <p>© 2026 CarlosCostaPrev — Especialista em Previdência Social. Todos os direitos reservados.</p>
      <p style="margin-top: 0.5rem; font-size: 13px;"><a href="../privacidade.html" style="color: var(--text-muted);">Política de Privacidade</a>&nbsp;·&nbsp;<a href="../termos.html" style="color: var(--text-muted);">Termos de Uso</a></p>
    </div>
  </div>
</footer>

<!-- Scripts -->
<script src="../assets/js/main.js"></script>
<script src="../assets/js/animations.js"></script>

<div class="mobile-cta-bar">
  <a href="https://wa.me/5521964238080?text=Ol%C3%A1%2C+li+o+artigo+e+quero+uma+an%C3%A1lise+gratuita." class="mcta-wpp" target="_blank" rel="noopener">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    Análise Gratuita
  </a>
</div>

<!-- ===== LGPD Cookie Banner ===== -->
<div id="cookie-banner" style="display:none;position:fixed;bottom:20px;left:20px;right:20px;max-width:560px;margin:0 auto;background:#1f1812;border:1px solid #382a20;border-radius:16px;padding:20px 24px;z-index:9999;color:#f5ede0;font-family:system-ui,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
  <p style="margin:0 0 14px 0;font-size:15px;line-height:1.5;">Usamos cookies para entender como o site é usado e melhorar sua experiência. <a href="/privacidade" style="color:#d68559;">Saiba mais</a>.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    <button id="cookie-accept" style="flex:1;min-width:120px;padding:10px 16px;border-radius:999px;border:none;background:#c4673a;color:#fff;font-weight:600;font-size:14px;cursor:pointer;">Aceitar</button>
    <button id="cookie-reject" style="flex:1;min-width:120px;padding:10px 16px;border-radius:999px;border:1px solid #382a20;background:transparent;color:#f5ede0;font-weight:600;font-size:14px;cursor:pointer;">Rejeitar</button>
  </div>
</div>
<script>
  (function() {
    var key = 'ccp_cookie_consent_v1';
    var saved = localStorage.getItem(key);
    var banner = document.getElementById('cookie-banner');
    function grant() { localStorage.setItem(key, 'granted'); banner.style.display = 'none'; if (window.gtag) gtag('consent', 'update', { 'analytics_storage': 'granted' }); }
    function deny() { localStorage.setItem(key, 'denied'); banner.style.display = 'none'; }
    if (!saved) banner.style.display = 'block';
    else if (saved === 'granted' && window.gtag) gtag('consent', 'update', { 'analytics_storage': 'granted' });
    document.getElementById('cookie-accept').onclick = grant;
    document.getElementById('cookie-reject').onclick = deny;
  })();
</script>
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
