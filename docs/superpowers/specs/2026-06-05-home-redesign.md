# Home Redesign — carloscostaprev.com.br

> **Status:** Design validado — aguardando implementation plan

**Goal:** Redesign completo da home (Hero + Credenciais + Serviços) com visual premium + minimalista + animado. Foco em conversão (WhatsApp) e primeira impressão.

**Visual Direction:** Dark glass + terracota #c4673a + vídeo background + shapes animados. Elegante, clean, com movimento suave.

**Tech Stack:** HTML/CSS/JS puro (sem frameworks). Cloudflare Pages (hospedagem).

---

## **Arquitetura Visual**

### **Paleta de Cores**
- **Primária:** Terracota #c4673a (headlines, CTAs, accents)
- **Secundária:** Branco #ffffff (texto principal)
- **Terciária:** Cinza claro #d4d4d8 (texto secundário)
- **Background:** Dark glass (oklch + backdrop-filter para glassmorphism)
- **Accent:** Shapes animados (terracota opacity 15%)

### **Tipografia**
- **Headlines (H1, H2):** Geist Sans Bold, 72px/48px
- **Body text:** Geist Sans Regular, 16px
- **Descrições:** Geist Sans Regular, 14px
- **Sistema de escala:** clamp() responsivo (mobile-first)

### **Espaciamento & Layout**
- **Grid:** 12 colunas (desktop), 6 (tablet), 4 (mobile)
- **Gap padrão:** clamp(16px, 3vw, 32px)
- **Padding container:** clamp(20px, 5vw, 80px)
- **Breakpoints:** 640px (mobile), 1024px (tablet), 1280px+ (desktop)

---

## **SEÇÃO 1: HERO**

**Viewport Height:** 100vh (full screen)
**Composição:**

| Elemento | Especificação |
|----------|---------------|
| **Background** | Vídeo premium (escritório/movimento sutil) — MP4 otimizado |
| **Overlay** | Gradiente escuro (linear, 0deg, rgba(0,0,0,0.4) → rgba(0,0,0,0.6)) |
| **Headline** | "O INSS não é a última palavra" |
| | 72px bold, terracota #c4673a, centered |
| | Responsive: 48px mobile, 64px tablet |
| **Subheadline** | "10+ anos de especialidade em previdência social" |
| | 24px regular, branco, centered, margin-top 16px |
| | Responsive: 18px mobile, 20px tablet |
| **CTA Button** | "Análise gratuita agora" |
| | Background: linear-gradient(135deg, #c4673a, #a84d2f) |
| | Padding: 16px 40px, border-radius 8px |
| | Font: 16px bold, branco |
| | Hover: scale(1.05), box-shadow terracota 0 8px 24px |
| | Icon: WhatsApp 20px antes do texto |
| **Decorative Shapes** | 3-5 animated blobs (circles) |
| | Color: terracota #c4673a, opacity 15% |
| | Position: scattered around text |
| | Animation: rotate 360deg over 20s, infinite |

**Animations:**
```
- Headline: fade-in + slideUp (0.8s ease-out)
- Subheadline: fade-in + slideUp (1s ease-out, delay 0.2s)
- CTA: fade-in + slideUp (1.2s ease-out, delay 0.4s)
- Shapes: continuous rotation (20s linear infinite)
```

**Responsividade:**
- Desktop: Headline 72px, centered, full width
- Tablet: Headline 64px, padding horizontal 20px
- Mobile: Headline 48px, padding horizontal 16px, stack vertical

---

## **SEÇÃO 2: CREDENCIAIS**

**Background:** Off-white escuro (oklch(0.15, 0.02, 0))
**Padding:** clamp(60px, 10vw, 120px) vertical, clamp(20px, 5vw, 80px) horizontal
**Grid:** 3 colunas (desktop) / 1 coluna (mobile)
**Gap:** clamp(20px, 3vw, 40px)

**Cada Card:**

| Elemento | Especificação |
|----------|---------------|
| **Layout** | Flex column, align center |
| **Background** | Glass card: rgba(255,255,255,0.05) + backdrop-filter blur(10px) |
| **Border-top** | 3px solid terracota #c4673a |
| **Border-radius** | 12px |
| **Padding** | 32px 24px |
| **Número** | 48px bold, terracota #c4673a |
| **Ícone** | SVG 32px, terracota, margin-bottom 16px |
| **Título** | 18px bold, branco, margin-top 12px |
| **Descrição** | 14px regular, cinza claro #d4d4d8 |
| **Hover** | Transform: translateY(-4px), box-shadow 0 12px 32px rgba(0,0,0,0.2) |
| **Transition** | all 0.3s ease |

**3 Cards:**
1. **"10+"** Ícone: briefcase | "Anos de especialidade" | "Atuação focada em previdência"
2. **"500+"** Ícone: people | "Clientes conquistados" | "Satisfação comprovada"
3. **"98%"** Ícone: checkmark | "Taxa de sucesso" | "Resultados que falam"

**Animação:** Fade-in + slideUp ao scroll, staggered 100ms cada card

**Responsividade:**
- Desktop: 3 colunas, gap 32px
- Tablet: 2 colunas, gap 24px
- Mobile: 1 coluna, gap 20px

---

## **SEÇÃO 3: SERVIÇOS**

**Background:** Dark glass (oklch(0.18, 0.04, 260))
**Padding:** clamp(60px, 10vw, 120px) vertical, clamp(20px, 5vw, 80px) horizontal
**Título Seção:** "Especialidades" — 48px bold, branco, margin-bottom 48px

**Grid:** 3 colunas (desktop) / 2 (tablet) / 1 (mobile)
**Gap:** clamp(20px, 3vw, 32px)

**Cada Card de Serviço:**

| Elemento | Especificação |
|----------|---------------|
| **Background** | Glass card: rgba(255,255,255,0.08) + backdrop-filter blur(12px) |
| **Border** | 1px solid rgba(255,255,255,0.1) |
| **Border-radius** | 12px |
| **Padding** | 28px 24px |
| **Ícone** | SVG 48px, terracota #c4673a, margin-bottom 16px |
| **Título** | 18px bold, branco |
| **Descrição** | 14px regular, cinza claro #d4d4d8, margin-top 8px, max 60 chars |
| **Hover** | Transform: scale(1.03), box-shadow 0 16px 40px rgba(198,103,58,0.2) |
| **Transition** | all 0.3s ease |

**6 Serviços (destaque):**
1. 🏥 Auxílio-Doença / Incapacidade Temporária
2. ♿ Aposentadoria por Invalidez
3. 🧑‍🦽 Aposentadoria da Pessoa com Deficiência
4. 🔄 Benefício Negado (Revisão)
5. 📋 Análise de CNIS
6. 📊 Planejamento Previdenciário 360°

**Rodapé Seção:** 
- Link "Ver todos os 13 serviços →" 
- 16px, terracota, hover: underline

**Animação:** Fade-in + slideUp ao scroll, staggered 80ms cada card

**Responsividade:**
- Desktop: 3 colunas, gap 28px
- Tablet: 2 colunas, gap 24px
- Mobile: 1 coluna, gap 20px

---

## **Componentes Reutilizáveis**

### **Button (CTA)**
- Cor: terracota background + gradiente hover
- Padding: 14px 32px (ajustável)
- Border-radius: 8px
- Transition: all 0.3s ease

### **Glass Card**
- Background: rgba(255,255,255,opacity) + backdrop-filter blur(10-12px)
- Border: 1px solid rgba(255,255,255,0.1) ou border-top terracota
- Border-radius: 12px

### **Shape Animado**
- SVG circle/blob, terracota, opacity 15%
- Animation: rotate ou float
- Duration: 15-20s

---

## **Assets Necessários**

| Asset | Tipo | Origem |
|-------|------|--------|
| Vídeo hero | MP4 otimizado | A gerar (Higgsfield) |
| Ícones SVG | SVG x8 (briefcase, people, check, health, wheelchair, refresh, cnis, chart) | Criar (design) |
| Shapes animados | SVG blobs x3-5 | Criar (design) |

---

## **Requisitos Técnicos**

### **Performance**
- Vídeo hero: max 5MB (compressed), formatos: MP4 + WebM fallback
- Lazy loading para images/videos
- CSS animations: GPU-accelerated (transform, opacity)
- Lighthouse score target: >90

### **Acessibilidade**
- Alt text em todos os ícones
- ARIA labels em buttons
- Contrast ratio ≥ 4.5:1 (WCAG AA)
- Keyboard navigation ✅

### **SEO**
- Semantic HTML (section, article, etc)
- Heading hierarchy (H1 → H2 → H3)
- Meta tags já existentes mantidas
- Schema.org para LocalBusiness

### **Browser Support**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 10+)

---

## **Próximos Passos**

1. ✅ Design aprovado
2. ⏳ Gerar assets (vídeo + ícones)
3. ⏳ Implementation plan (writing-plans skill)
4. ⏳ Frontend code (HTML/CSS/JS)
5. ⏳ Testing & optimization
6. ⏳ Deploy Cloudflare Pages

---

**Versão:** 1.0  
**Data:** 2026-06-05  
**Status:** Design validado — pronto para plano de implementação
