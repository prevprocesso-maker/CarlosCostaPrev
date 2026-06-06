document.addEventListener('DOMContentLoaded', () => {

  // ── Fade-up com IntersectionObserver ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // Marca visível imediatamente se já está no viewport (ex: após anchor jump)
  setTimeout(() => {
    document.querySelectorAll('.fade-up:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, 100);

  // ── Stagger automático para itens dentro de grids ──
  const gridSelectors = [
    '.servicos__grid',
    '.consultivos__grid',
    '.depoimentos__grid',
    '.blog__grid',
    '.credenciais__grid',
    '.especialidades__grid',
  ];

  gridSelectors.forEach(sel => {
    const grid = document.querySelector(sel);
    if (!grid) return;
    const children = grid.querySelectorAll('.fade-up, article, .glass-card');
    children.forEach((child, i) => {
      if (!child.style.transitionDelay) {
        child.style.transitionDelay = `${i * 0.07}s`;
      }
    });
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

});
