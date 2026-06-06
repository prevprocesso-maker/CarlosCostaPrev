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

// ── Formulário de contato WhatsApp ──
const formContato = document.getElementById('formContato');
if (formContato) {
  formContato.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('f-nome')?.value?.trim() || '';
    const whatsapp = document.getElementById('f-whatsapp')?.value?.trim() || '';
    const beneficio = document.getElementById('f-beneficio')?.value?.trim() || '';
    const mensagem = document.getElementById('f-mensagem')?.value?.trim() || '';

    // Validação: campos obrigatórios
    if (!nome || !whatsapp || !beneficio) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Constrói mensagem para WhatsApp
    const corpo = `Olá, meu nome é ${nome}.\n\nTenho interesse em saber mais sobre: ${beneficio}.\n\n${mensagem ? `Observação: ${mensagem}` : ''}`;
    const urlEnc = encodeURIComponent(corpo);
    const wppUrl = `https://wa.me/5521964238080?text=${urlEnc}`;

    // Abre WhatsApp
    window.open(wppUrl, '_blank');

    // Limpa form
    formContato.reset();
  });
}

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
