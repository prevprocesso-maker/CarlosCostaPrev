// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── Mobile hamburger ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    })
  );
}

// ── Dropdown Ferramentas ──
(function ferramentasDropdown() {
  const btn = document.getElementById('btn-ferramentas');
  const dropdown = document.getElementById('dropdown-ferramentas');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = !dropdown.hidden;
    dropdown.hidden = isOpen;
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  document.addEventListener('click', function() {
    if (!dropdown.hidden) {
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !dropdown.hidden) {
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
})();

// ── Cursor glow interativo na hero ──
(function cursorGlow() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const glow = hero.querySelector('.hero__glow');
  if (!glow) return;
  let raf;
  hero.addEventListener('mousemove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      glow.style.left = `${e.clientX - rect.left - 350}px`;
      glow.style.top  = `${e.clientY - rect.top  - 350}px`;
      raf = null;
    });
  }, { passive: true });
})();

// Marcador ativo definido diretamente no HTML via aria-current="page" — sem JS dinâmico
