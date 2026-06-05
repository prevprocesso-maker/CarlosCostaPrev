# 📸 Integração Unsplash API — Setup Completo

## 🚀 Início Rápido (5 minutos)

### 1. Criar conta Unsplash Developer
```
https://unsplash.com/oauth/applications
```

1. Login (ou crie uma conta)
2. Clique em **"Create a new application"**
3. Preencha:
   - **Name:** `CarlosCostaPrev`
   - **Description:** `Busca de fotos para website`
   - **Intended use:** `Website`
4. Aceite os termos
5. Copie a **Access Key** (chave pública)

### 2. Adicionar a chave ao projeto
```bash
# Abra este arquivo:
assets/js/unsplash-gallery.js

# Encontre a linha 11:
const UNSPLASH_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';

# Substitua por sua chave:
const UNSPLASH_ACCESS_KEY = 'abc123def456...'; // ← sua chave aqui
```

### 3. Acessar a galeria
```
Abra no navegador: http://localhost:3000/fotos-unsplash.html
```

---

## 📖 Como Usar

### Busca via Página HTML
```
/fotos-unsplash.html → Digite na caixa de busca
```

### Busca via JavaScript (em qualquer página)
```javascript
// Buscar fotos
await gallery.searchPhotos('advocacia');

// Renderizar em um elemento
gallery.renderGallery('my-container');
```

### Integrar em outra página
```html
<!-- 1. Adicione o CSS -->
<link rel="stylesheet" href="assets/css/unsplash-gallery.css">

<!-- 2. Crie um container -->
<div id="minha-galeria" class="unsplash-container"></div>

<!-- 3. Adicione o script -->
<script src="assets/js/unsplash-gallery.js"></script>

<!-- 4. Busque -->
<script>
  searchUnsplash('sua-busca-aqui');
</script>
```

---

## 🔍 Exemplos de Busca

Para o site CarlosCostaPrev, estes termos funcionam bem:

| Tema | Busca Recomendada |
|------|------------------|
| **Advocacia** | `lawyer`, `attorney`, `legal`, `office` |
| **Documentos** | `documents`, `papers`, `files`, `desk` |
| **Escritório** | `professional office`, `workspace`, `business` |
| **Pessoas** | `professional people`, `business meeting` |
| **Irajá** | `rio de janeiro`, `city`, `office rio` |
| **Assinatura** | `signing documents`, `contract`, `pen` |

---

## ⚙️ Configuração Avançada

### Cache Local

O script cacheia fotos por 24 horas para economizar requisições:

```javascript
// Limpar cache manualmente
gallery.clearCache();

// Verificar o quê está cacheado
// Abra DevTools > Application > Local Storage
```

### Limite de Requisições

- **Plano grátis Unsplash:** 50 requisições/hora
- **Cada busca:** 1 requisição
- **Caching:** Economiza 95% das requisições após a primeira busca

### Customizar Quantidade de Fotos

```javascript
// Em unsplash-gallery.js, linha 55, mude:
per_page=12  // ← mude para 20, 30, etc.
```

---

## 🎨 Customizar Visual

### Alterar cores
```css
/* Em unsplash-gallery.css */

.unsplash-download-btn {
  background: var(--accent); /* ← mude a cor aqui */
}
```

### Alterar grid
```css
/* Em unsplash-gallery.css, linha ~85 */

.unsplash-container {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); /* ← mude 240px */
}
```

---

## 🐛 Troubleshooting

### "⚠️ Unsplash Access Key não configurada"
✅ **Solução:** Coloque sua chave em `assets/js/unsplash-gallery.js` linha 11

### "Nenhuma foto encontrada"
✅ **Solução:** Tente outra palavra-chave (em inglês funciona melhor)

### "Erro 403: Unauthorized"
✅ **Solução:** Verifique se a Access Key está correta

### Fotos carregam lentamente
✅ **Solução:** Normal na primeira busca. Próximas buscas vêm do cache (instantâneo)

### Cache não está funcionando
✅ **Solução:** 
```javascript
// Limpe o cache
gallery.clearCache();

// Ou abra DevTools > Application > Local Storage > Delete "unsplash_cache_*"
```

---

## 📋 Funções Disponíveis

```javascript
// Buscar fotos (Promise)
await gallery.searchPhotos('query', page = 1);

// Renderizar galeria
gallery.renderGallery('container-id', photos = this.photos);

// Função de conveniência (usa diretamente no HTML)
searchUnsplash('query');

// Limpar cache local
gallery.clearCache();

// Acessar fotos atuais
gallery.photos; // Array de fotos

// Verificar status
gallery.isLoading; // true/false
```

---

## 🔗 URLs Úteis

| Página | URL |
|--------|-----|
| **Galeria** | `/fotos-unsplash.html` |
| **Unsplash Apps** | https://unsplash.com/oauth/applications |
| **Unsplash API Docs** | https://unsplash.com/documentation |
| **Política Unsplash** | https://unsplash.com/license |

---

## 📝 Notas

- ✅ A Access Key é **pública**, ok deixar no código
- 🔐 A Secret Key é **privada**, NUNCA commitar
- 📦 Cache economiza 50+ requisições/dia
- 🌍 Todos autores da Unsplash permitem uso comercial
- ✨ Sempre creditar o fotógrafo (links já inclusso)

---

## Próximos passos

1. ✅ Integrar em outras páginas (beneficios, servicos, etc.)
2. ✅ Usar imagens na seção "Carros-chefe" (servicos.html)
3. ✅ Criar galeria dinâmica no blog
4. ✅ Adicionar filtros de cor/tema

**Dúvidas?** Ver console do navegador: `F12` → **Console** (mensagens de debug)
