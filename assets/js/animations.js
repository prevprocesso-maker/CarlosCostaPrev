document.addEventListener('DOMContentLoaded', () => {

  // ── Fade-up com IntersectionObserver (scroll-triggered animation) ──
  const animationConfig = {
    threshold: 0.08,
    rootMargin: '0px 0px -50px 0px' // Trigger 50px antes do elemento sair da tela inferior
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, animationConfig);

  // Observar todos os elementos com .fade-up
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // Marca visível imediatamente se já está no viewport (ex: hero, seção acima da dobra)
  // Isto garante que elementos já visíveis no carregamento animem corretamente
  setTimeout(() => {
    document.querySelectorAll('.fade-up:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      // Se elemento está visível, marca como visible e dispara animação
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, 50);

  // ── Stagger automático para itens em grids e seções ──
  // Cada grid/container tem delay progressivo para efeito cascata
  const containerSelectors = [
    // Grids normais
    '.servicos__grid',
    '.carros-chefe__grid', // Cards dos 4 pilares
    '.especialidades__grid',
    '.consultivos__grid',
    '.depoimentos__grid',
    '.blog__grid',
    '.credenciais__grid',
    '.numeros__grid',
    // Outros containers com múltiplos itens
    '.faq__list',
    '.historia__valores .valores__grid', // MVV chips
  ];

  containerSelectors.forEach(selector => {
    const container = document.querySelector(selector);
    if (!container) return;

    // Seleciona diretos filhos animáveis
    const children = container.querySelectorAll(':scope > .fade-up, :scope > article, :scope > .glass-card, :scope > .beneficio-card, :scope > .faq__item, :scope > .chip');

    children.forEach((child, index) => {
      // Só sobrescreve se não foi customizado
      if (!child.style.transitionDelay) {
        // Delay progressivo: 70-100ms entre cada item
        // Mais rápido em mobile, mais lento em desktop
        const delayMs = window.innerWidth < 768 ? 50 : 70;
        child.style.transitionDelay = `${index * delayMs}ms`;
      }
    });
  });

  // ── Stagger especial para seções de texto (section-label, section-title, section-subtitle) ──
  // Cria cascata suave do label → título → subtítulo
  document.querySelectorAll('.text-center').forEach((textCenter) => {
    if (!textCenter.classList.contains('fade-up')) return; // Só se o container tem fade-up

    const label = textCenter.querySelector('.section-label');
    const title = textCenter.querySelector('.section-title');
    const subtitle = textCenter.querySelector('.section-subtitle');

    if (label) {
      label.style.transitionDelay = '0ms';
      label.classList.add('fade-up-child');
    }
    if (title) {
      title.style.transitionDelay = '80ms';
      title.classList.add('fade-up-child');
    }
    if (subtitle) {
      subtitle.style.transitionDelay = '160ms';
      subtitle.classList.add('fade-up-child');
    }
  });

  // ── Marca link ativo na navbar — apenas UM por vez ──
  const path = window.location.pathname;
  const normPath = path.replace(/\.html$/, '').replace(/\/$/, '') || '/';

  document.querySelectorAll('.navbar__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const normHref = href.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    let isActive = false;

    if (normHref === '/' || normHref === '') {
      // Início: só ativo na home exata
      isActive = path === '/' || path === '/index.html' || normPath === '';
    } else {
      // Outras páginas: match exato
      isActive = normPath === normHref || normPath.endsWith(normHref);
    }

    if (isActive) link.setAttribute('aria-current', 'page');
  });

  // ── Performance: Cleanup listeners ao descarregar ──
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });

});
