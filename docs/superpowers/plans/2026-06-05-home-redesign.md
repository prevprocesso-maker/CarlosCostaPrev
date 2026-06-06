# Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar redesign da home (Hero + Credenciais + Serviços) com visual premium + minimalista + animado, responsividade completa e performance otimizada.

**Architecture:** 3 seções principais: Hero (vídeo + headline), Credenciais (3 cards com números), Serviços (grid 6 principais). Cada seção tem HTML estruturado, CSS modular e animações via JavaScript. Assets gerados (vídeo, ícones SVG).

**Tech Stack:** HTML/CSS/JS puro. Cloudflare Pages (hospedagem). Sem dependências externas.

---

## **File Structure**

**Arquivos a MODIFICAR:**
- `index.html` — adicionar seções hero, credenciais, serviços (antes de "Minha História")
- `assets/css/sections.css` — novos estilos para as 3 seções
- `assets/js/animations.js` — adicionar animações scroll (fade-in, stagger)

**Arquivos a CRIAR:**
- `assets/video/hero.mp4` — vídeo background hero (gerado via Higgsfield)
- `assets/video/hero.webm` — fallback WebM (gerado)
- `assets/icons/home-redesign.svg` — sprite SVG com 8 ícones
- `assets/shapes/blobs.svg` — shapes animados para hero

**Teste responsividade:**
- Chrome DevTools: 375px (mobile), 768px (tablet), 1920px (desktop)
- Real device testing (opcional)

---

### **Task 1: Gerar Assets — Vídeo Hero**

**Files:**
- Create: `assets/video/hero.mp4` (gerado)
- Create: `assets/video/hero.webm` (gerado)

- [ ] **Step 1: Usar Higgsfield para gerar vídeo hero**

Invoke skill `higgsfield-generate`:
```bash
higgsfield generate create seedance_2_0 \
  --prompt "premium office video — people working, movement subtle, professional vibes, 5-10 seconds" \
  --duration 8 \
  --aspect_ratio 16:9 \
  --resolution 2k \
  --wait
```

Expected: URL do vídeo MP4 gerado (~3-5MB)

- [ ] **Step 2: Download e comprimir vídeo**

```bash
# Converter para WebM (formato moderno)
ffmpeg -i hero.mp4 -c:v libvpx-vp9 -b:v 1500k -c:a libopus hero.webm
```

Expected: 2 arquivos: `hero.mp4` (~4MB), `hero.webm` (~2MB)

- [ ] **Step 3: Mover para pasta assets**

```bash
mv hero.mp4 C:\Users\NIKE\carloscostaprev-site\assets\video\
mv hero.webm C:\Users\NIKE\carloscostaprev-site\assets\video\
```

---

### **Task 2: Gerar Assets — Ícones SVG**

**Files:**
- Create: `assets/icons/home-redesign.svg`

- [ ] **Step 1: Criar sprite SVG com 8 ícones**

`assets/icons/home-redesign.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <!-- Ícone 1: Briefcase (Anos) -->
  <symbol id="briefcase" viewBox="0 0 24 24">
    <path d="M20 6h-8V4c0-1.1-.9-2-2-2s-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10-2c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm10 16H4V8h16v12z"/>
  </symbol>

  <!-- Ícone 2: People (Clientes) -->
  <symbol id="people" viewBox="0 0 24 24">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </symbol>

  <!-- Ícone 3: Checkmark (Taxa Sucesso) -->
  <symbol id="checkmark" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </symbol>

  <!-- Ícone 4: Health (Auxílio-Doença) -->
  <symbol id="health" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 11h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2z"/>
  </symbol>

  <!-- Ícone 5: Wheelchair (Pessoa com Deficiência) -->
  <symbol id="wheelchair" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14l4 4v-4h2V4c0-1.1-.9-2-2-2zm-7 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
  </symbol>

  <!-- Ícone 6: Refresh (Benefício Negado) -->
  <symbol id="refresh" viewBox="0 0 24 24">
    <path d="M1 4v6h6M23 20v-6h-6M20.3 5.51C18.55 3.7 16.1 2.5 13.5 2.5c-4.13 0-7.65 2.49-8.9 6H3.9c1.4-4.44 5.96-7.5 11.1-7.5 2.85 0 5.46 1.1 7.44 2.9l2.85-2.9V5.5zm-17.6 13c1.76 1.81 4.2 2.99 6.8 2.99 4.13 0 7.65-2.49 8.9-6h1.7c-1.4 4.44-5.96 7.5-11.1 7.5-2.85 0-5.46-1.1-7.44-2.9l-2.85 2.9V18.5h6z"/>
  </symbol>

  <!-- Ícone 7: Document (CNIS) -->
  <symbol id="document" viewBox="0 0 24 24">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm0 18H6V4h7v5h1v11z"/>
  </symbol>

  <!-- Ícone 8: Chart (Planejamento) -->
  <symbol id="chart" viewBox="0 0 24 24">
    <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
  </symbol>
</svg>
```

- [ ] **Step 2: Verificar SVG no browser**

Abra `index.html` (temporário) com:
```html
<svg class="icon"><use href="assets/icons/home-redesign.svg#briefcase"></use></svg>
```

Expected: Ícone renderiza corretamente (preto, 24×24)

---

### **Task 3: Gerar Assets — Shapes Animados**

**Files:**
- Create: `assets/shapes/blobs.svg`

- [ ] **Step 1: Criar 3 blobs SVG para hero**

`assets/shapes/blobs.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <!-- Blob 1 -->
  <path d="M100,50 Q150,30 180,80 T150,180 Q100,200 80,150 T100,50" 
    fill="none" stroke="#c4673a" stroke-width="2" opacity="0.15"/>
  
  <!-- Blob 2 -->
  <path d="M200,100 Q250,80 270,140 T220,240 Q150,260 170,180 T200,100" 
    fill="none" stroke="#c4673a" stroke-width="2" opacity="0.15"/>
  
  <!-- Blob 3 -->
  <path d="M50,150 Q30,200 80,220 T150,200 T160,100 T50,150" 
    fill="none" stroke="#c4673a" stroke-width="2" opacity="0.15"/>
</svg>
```

- [ ] **Step 2: Testar no browser**

Expected: 3 formas circulares semi-transparentes em terracota

---

### **Task 4: Criar HTML Hero**

**Files:**
- Modify: `index.html` (antes de seção "Minha História")

- [ ] **Step 1: Adicionar seção hero ao HTML**

[HTML completo na spec — inserir antes de "Minha História"]

---

### **Task 5: Criar HTML Credenciais + Serviços**

**Files:**
- Modify: `index.html` (adicionar 2 seções)

- [ ] **Step 1: Adicionar seção credenciais**

[HTML credenciais na spec]

- [ ] **Step 2: Adicionar seção serviços**

[HTML serviços na spec]

---

### **Task 6: Criar CSS Hero**

**Files:**
- Modify: `assets/css/sections.css`

- [ ] **Step 1: Adicionar estilos hero completos**

[CSS hero na spec — adicionar ao final do arquivo]

---

### **Task 7: Criar CSS Credenciais**

**Files:**
- Modify: `assets/css/sections.css`

- [ ] **Step 1: Adicionar estilos credenciais completos**

[CSS credenciais na spec]

---

### **Task 8: Criar CSS Serviços**

**Files:**
- Modify: `assets/css/sections.css`

- [ ] **Step 1: Adicionar estilos serviços completos**

[CSS serviços na spec]

---

### **Task 9: Criar JS Animações**

**Files:**
- Modify: `assets/js/animations.js`

- [ ] **Step 1: Adicionar fade-in scroll + stagger**

[JS animações na spec]

---

### **Task 10: Testar Responsividade**

**Files:**
- Nenhum (testes)

- [ ] **Step 1: Desktop (1920px)**
- [ ] **Step 2: Tablet (768px)**
- [ ] **Step 3: Mobile (375px)**

---

### **Task 11: Commit Final**

**Files:**
- Todos os arquivos modificados/criados

- [ ] **Step 1: Add + Commit**
- [ ] **Step 2: Verificar status**

---

**Status:** Plan ready for execution
