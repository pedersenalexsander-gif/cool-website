(() => {
  const body = document.body;
  const toggle = document.querySelector('.menu-toggle');
  const mobile = document.querySelector('.mobile-menu');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = body.classList.toggle('menu-open');
      mobile.style.display = open ? 'block' : '';
      toggle.setAttribute('aria-expanded', String(open));
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      body.classList.remove('menu-open');
      mobile.style.display = '';
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  document.querySelectorAll('.site-logo img,.footer-logo img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const fallback = img.parentElement?.querySelector('.site-logo-fallback');
      if (fallback) fallback.style.display = 'block';
    });
  });

  const reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
    }), {threshold: .08});
    reveal.forEach(el => io.observe(el));
  } else reveal.forEach(el => el.classList.add('visible'));

  document.querySelectorAll('[data-filter-target]').forEach(filterBar => {
    const target = document.getElementById(filterBar.dataset.filterTarget);
    if (!target) return;
    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      filterBar.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const value = btn.dataset.filter;
      [...target.children].forEach(item => item.hidden = value !== 'all' && item.dataset.category !== value);
    });
  });

  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const image = lightbox.querySelector('img');
    const caption = lightbox.querySelector('p');
    const close = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); };
    document.querySelectorAll('[data-lightbox]').forEach(btn => btn.addEventListener('click', () => {
      image.src = btn.dataset.src;
      image.alt = btn.dataset.caption || 'Baderomsbilde';
      caption.textContent = btn.dataset.caption || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
    }));
    lightbox.querySelector('.lightbox-close')?.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');
    const saved = localStorage.getItem('ofotenPlanner');
    if (saved) {
      try {
        const plan = JSON.parse(saved);
        const message = document.getElementById('message');
        if (message && !message.value) message.value = `Badplan: ${plan.project || ''}, ${plan.width || ''} × ${plan.depth || ''} cm, ${plan.style || ''}. Funksjoner: ${(plan.features || []).join(', ')}.`;
      } catch (_) {}
    }
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      localStorage.setItem('ofotenContactDraft', JSON.stringify(data));
      status.innerHTML = '<div style="margin-top:14px;padding:13px;border-radius:9px;background:#e9f8fc;color:#075b73;font-size:11px;font-weight:700">Forespørselen er klargjort i demoen. Produksjonsversjonen kobles til Ofoten Rørs e-post eller CRM.</div>';
    });
  }
})();
