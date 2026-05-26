# CarlosCostaPrev — Design Handoff para Claude Design

## O projeto
Site estático de advocacia previdenciária. Carlos Costa, especialista em INSS há 10+ anos, Irajá/RJ.
URL: **carloscostaprev.com.br** — hospedado no Cloudflare Pages.
Stack: **HTML + CSS + JS puro**. Sem framework, sem build step.
Repositório: `C:\Users\NIKE\carloscostaprev-site\`

---

## Design atual
Tema: **Dark Glass Premium** — fundo quase preto marrom, glassmorphism, terracota como accent.

### Tokens CSS (`assets/css/variables.css`)
```css
:root {
  --bg-deep: #0e0806; --bg-mid: #1e1008; --bg-warm: #251208;
  --accent: #c4673a; --accent-dark: #a04e28;
  --accent-glass: rgba(196,103,58,0.12);
  --accent-border: rgba(196,103,58,0.25);
  --accent-border-strong: rgba(196,103,58,0.45);
  --accent-glow: rgba(196,103,58,0.18);
  --text-primary: #ffffff;
  --text-muted: rgba(255,255,255,0.55);
  --text-faint: rgba(255,255,255,0.3);
  --glass-bg: rgba(255,255,255,0.04);
  --glass-border: rgba(255,255,255,0.08);
  --glass-blur: blur(12px);
  --whatsapp: #25d366; --whatsapp-dark: #1da851;
  --font-base: 'Inter', system-ui, sans-serif;
  --text-xs: 0.7rem; --text-sm: 0.85rem; --text-base: 0.95rem;
  --text-lg: 1.1rem; --text-xl: 1.35rem; --text-2xl: 1.7rem;
  --text-hero: clamp(2rem,5vw,3.5rem); --text-h2: clamp(1.5rem,3vw,2.5rem);
  --section-py: clamp(60px,8vw,100px); --container: 1200px;
  --gap-sm: 0.5rem; --gap-md: 1rem; --gap-lg: 1.5rem; --gap-xl: 2rem;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-pill: 50px;
  --shadow-accent: 0 4px 24px rgba(196,103,58,0.15);
  --shadow-card: 0 2px 16px rgba(0,0,0,0.4);
}
```

### Arquivos CSS
- `assets/css/variables.css` — tokens de design
- `assets/css/base.css` — reset, tipografia, layout base
- `assets/css/components.css` — glass-card, btn, badge, chip, social-btn
- `assets/css/sections.css` — navbar, hero, credenciais, serviços, história, números, depoimentos, blog, FAQ, CTA, rodapé

### Componentes principais já existentes
- `.glass-card` — card com fundo glass e borda sutil, hover translateY
- `.btn-primary` — gradiente terracota
- `.btn-whatsapp` — gradiente verde WA com pulsação
- `.btn-secondary` — vidro com borda terracota
- `.badge` — pill terracota sólido
- `.tag` — pill glass terracota
- `.chip` — element com ícone SVG + texto, para chips de valores
- `.card-accent-line::before` — linha terracota no topo do card
- `.social-btn` / `.social-btn--ig/fb/gg` — botões 44×44px expand-on-hover com gradiente de marca
- `.whatsapp-float` — botão WA flutuante fixo (esconde no mobile)
- `.mobile-cta-bar` — barra fixa no fundo mobile

---

## Estrutura de páginas
```
index.html          ← home principal (já com copy humanizada)
beneficios.html     ← detalhe de cada benefício (BPC, auxílio-doença, invalidez, PcD, acidente)
servicos.html       ← serviços consultivos
bpc-loas.html       ← página dedicada BPC/LOAS com portal irmão
blog/index.html     ← listagem de artigos
blog/*.html         ← artigos individuais (5 publicados)
ferramentas/calculadora.html       ← calculadora de aposentadoria com períodos dinâmicos
ferramentas/indicadores-do-cnis.html
ferramentas/louco-para-aposentar.html
ferramentas/pdf.html
privacidade.html    ← LGPD
termos.html         ← Termos de uso
```

---

## O que precisamos melhorar (missão para esta sessão de design)

### 1. Inconsistências entre páginas
- **`beneficios.html` e `servicos.html`** usam o footer antigo com `.social-links` (ícones simples). Precisa ser substituído pelo padrão novo `.footer-social` / `.social-btn` que já está em `index.html`.
- **`beneficios.html`** tem o botão da navbar com emoji `📱 WhatsApp` em vez do SVG correto. Precisa usar o mesmo SVG do `index.html`.
- **Navbar**: o botão CTA da navbar varia entre páginas. Padronizar para o SVG do WhatsApp em todas.

### 2. Seção "Avaliação Google" — melhorar visual
Está em `index.html`. O layout atual é correto (mapa + card lado a lado) mas o card está básico. Poderia ser mais premium.

### 3. Hero das páginas internas (beneficios.html, servicos.html, bpc-loas.html)
Hero simples com `<header>` e gradiente básico. Poderia ter:
- Grid sutil com efeito terracota (igual ao hero da home)
- Glow radial decorativo

### 4. Seção Números (`index.html`) — falta impacto visual
Os números estão em linha simples. Poderia ter mais impacto com destaque maior nos valores.

### 5. FAQ — seta de expansão
O `+` simples do FAQ poderia ser um chevron SVG com animação de rotação.

### 6. Blog cards — imagem placeholder
Cards do blog na home (`index.html`) usam ícone SVG como thumb. Poderia ser um `div` com gradiente terracota suave em vez do ícone solto.

### 7. Página blog/index.html — verificar consistência visual
Provavelmente usa um template diferente, conferir se está alinhado com o visual atual.

---

## Regras absolutas (não quebrar)
- **Nenhuma dependência nova** — sem npm, sem frameworks, sem CDN de JS
- **Manter todas as classes/IDs existentes** — o JS (main.js, faq.js, etc.) depende deles
- **Manter todas as URLs** — links WA, ancoras, hrefs
- **Manter todo schema markup** (JSON-LD no final de cada página)
- **SVGs inline** — sem emoji, sem font-icons
- **Não instalar nada** — site estático puro

---

## Como fazer commit ao terminar cada mudança

```powershell
# Após editar um arquivo:
git -C "C:\Users\NIKE\carloscostaprev-site" add <arquivo.html ou assets/css/arquivo.css>
git -C "C:\Users\NIKE\carloscostaprev-site" commit -m "design: <descrição curta>"

# Após todas as mudanças:
git -C "C:\Users\NIKE\carloscostaprev-site" push origin main
```

---

## Contexto de negócio
- Público-alvo: idosos, pessoas com deficiência, trabalhadores negados pelo INSS — muitas vezes sem familiaridade digital
- WhatsApp é o canal principal de conversão
- Carlos atende presencialmente em Irajá e também por WA
- Benefício principal: BPC/LOAS (1 salário mínimo — R$ 1.518 — para quem não pode se sustentar)
- Urgência real: prazo de 30 dias para recurso administrativo após indeferimento
- Portal irmão: portaldobpc.com.br
- Google Review link: https://g.page/r/CcJNe240Go7AEBM/review
- WhatsApp: +55 21 96423-8080

---

## Estado atual (2026-05-25)
- ✅ index.html — copy humanizada, social icons expand-on-hover, LGPD links
- ✅ beneficios.html — sendo humanizado (agente em background)
- ✅ servicos.html — sendo humanizado (agente em background)
- ✅ bpc-loas.html — sendo humanizado (agente em background)
- ✅ privacidade.html + termos.html — criados
- ✅ sitemap.xml — atualizado
- ✅ _headers — segurança HTTP
- ✅ robots.txt — atualizado
- ✅ Deploy automático: push → GitHub Actions → Cloudflare Pages
