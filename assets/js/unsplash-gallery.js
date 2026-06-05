/**
 * Unsplash API Gallery
 * Integração com API Unsplash para busca dinâmica de fotos
 *
 * Configuração:
 * 1. Crie conta em: https://unsplash.com/oauth/applications
 * 2. Copie sua Access Key
 * 3. Coloque na linha 11 abaixo
 */

const UNSPLASH_ACCESS_KEY = '3LZ9hY9UBR3qyQFgs_wWfVXCRu69KWDOpHmlH_qNoXg';
const CACHE_KEY = 'unsplash_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

class UnsplashGallery {
  constructor() {
    this.photos = [];
    this.currentQuery = '';
    this.isLoading = false;
  }

  /**
   * Buscar fotos na API Unsplash
   */
  async searchPhotos(query, page = 1) {
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
      console.error('⚠️ Unsplash Access Key não configurada. Configure em unsplash-gallery.js linha 11');
      return [];
    }

    this.isLoading = true;
    const cacheKey = `${CACHE_KEY}_${query}_${page}`;

    try {
      // Verificar cache local
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📦 Fotos carregadas do cache');
        this.photos = cached;
        this.isLoading = false;
        return cached;
      }

      // Buscar da API
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const photos = data.results || [];

      // Cachear resultado
      this.setCache(cacheKey, photos);

      this.photos = photos;
      this.currentQuery = query;
      this.isLoading = false;

      console.log(`✅ ${photos.length} fotos encontradas para "${query}"`);
      return photos;
    } catch (error) {
      console.error('❌ Erro ao buscar fotos:', error);
      this.isLoading = false;
      return [];
    }
  }

  /**
   * Renderizar galeria no DOM
   */
  renderGallery(containerId, photos = this.photos) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} não encontrado`);
      return;
    }

    if (photos.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhuma foto encontrada. Tente outra busca.</p>';
      return;
    }

    container.innerHTML = photos.map(photo => `
      <div class="unsplash-item" data-id="${photo.id}">
        <div class="unsplash-image-wrapper">
          <img
            src="${photo.urls.small}"
            alt="${photo.alt_description || photo.user.name}"
            loading="lazy"
            title="${photo.description || photo.alt_description || ''}"
          >
          <div class="unsplash-overlay">
            <a
              href="${photo.urls.full}"
              target="_blank"
              rel="noopener noreferrer"
              class="unsplash-download-btn"
              title="Baixar em alta qualidade"
            >
              ⬇️ Baixar
            </a>
          </div>
        </div>
        <div class="unsplash-credit">
          <a href="${photo.user.links.html}" target="_blank" rel="noopener noreferrer">
            ${photo.user.name}
          </a>
          <small>${photo.user.username}</small>
        </div>
      </div>
    `).join('');
  }

  /**
   * Cache Local Storage
   */
  setCache(key, data) {
    try {
      const cacheData = {
        data,
        expiry: Date.now() + CACHE_EXPIRY
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('❌ Não foi possível cachear dados:', error);
    }
  }

  getFromCache(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, expiry } = JSON.parse(cached);
      if (Date.now() > expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('❌ Erro ao ler cache:', error);
      return null;
    }
  }

  /**
   * Limpar cache
   */
  clearCache() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY));
    keys.forEach(k => localStorage.removeItem(k));
    console.log(`✅ Cache limpo (${keys.length} itens removidos)`);
  }
}

// Inicializar instância global
const gallery = new UnsplashGallery();

/**
 * Função de conveniência para usar em HTML
 * Exemplo: <button onclick="searchUnsplash('advocacia')">Buscar</button>
 */
async function searchUnsplash(query) {
  if (!query.trim()) {
    console.warn('⚠️ Digite uma busca válida');
    return;
  }

  console.log(`🔍 Buscando: "${query}"...`);
  await gallery.searchPhotos(query);
  gallery.renderGallery('unsplash-container');
}

// Exportar para uso em módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnsplashGallery;
}
