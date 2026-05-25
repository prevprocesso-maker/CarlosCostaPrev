document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.faq__item');

  items.forEach(item => {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // close all
      items.forEach(i => {
        i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq__answer').hidden = true;
      });

      // toggle clicked
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });
});
