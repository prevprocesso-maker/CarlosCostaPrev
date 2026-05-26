// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── Formulário → WhatsApp ──
const formContato = document.getElementById('formContato');
if (formContato) {
  formContato.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome      = document.getElementById('f-nome').value.trim();
    const whatsapp  = document.getElementById('f-whatsapp').value.trim();
    const beneficio = document.getElementById('f-beneficio').value;
    const mensagem  = document.getElementById('f-mensagem').value.trim();

    if (!nome || !whatsapp || !beneficio) {
      alert('Por favor, preencha nome, WhatsApp e o benefício desejado.');
      return;
    }

    let texto = `Olá, Carlos! Me chamo *${nome}* e preciso de ajuda com: *${beneficio}*.`;
    texto += `\n📱 Meu WhatsApp: ${whatsapp}`;
    if (mensagem) texto += `\n\n📝 Situação: ${mensagem}`;
    texto += '\n\nGostaria de uma análise gratuita do meu caso.';

    const url = `https://wa.me/5521964238080?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank', 'noopener');
  });
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
