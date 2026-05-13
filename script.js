// ─── Global functions — defined before any partial loads ───

window.sendaImgFallback = function(img, seed) {
  if (img.dataset.fallbackTried) return;
  img.dataset.fallbackTried = '1';
  img.classList.remove('loaded');
  img.onload = function() { img.classList.add('loaded'); };
  img.src = 'https://picsum.photos/seed/' + seed + '/1200/1500';
};

window.handleSubmit = function(event) {
  event.preventDefault();
  const fd = new FormData(event.target);
  const name    = fd.get('name')    || '';
  const phone   = fd.get('phone')   || '';
  const email   = fd.get('email')   || '';
  const barrio  = fd.get('barrio')  || '';
  const message = fd.get('message') || '';

  const txt = encodeURIComponent(
    `Hola SENDA, me contacto desde su sitio web.\n\n` +
    `Nombre: ${name}\n` +
    `Teléfono: ${phone}\n` +
    (email   ? `Email: ${email}\n` : '') +
    (barrio  ? `Barrio: ${barrio}\n` : '') +
    (message ? `\nMensaje:\n${message}` : '')
  );

  window.open(`https://wa.me/5491151012478?text=${txt}`, '_blank');
};

// ─── Intersection Observer — created once, shared across all partials ───
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// ─── Partial loader ───
async function loadPartial(mountId, path) {
  const mount = document.getElementById(mountId);
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
    mount.innerHTML = await res.text();
  } catch (err) {
    console.error('[SENDA] Failed to load partial:', err);
    return;
  }
  mount.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ─── Navbar init ───
function initNavbar() {
  const nav       = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  });

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ─── Hero slider init ───
function initSlider() {
  const slider  = document.getElementById('heroSlider');
  if (!slider) return;

  const slides  = slider.querySelectorAll('.slide');
  const dots    = slider.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const counter = slider.querySelector('.slider-counter .current');
  const TOTAL   = slides.length;
  const INTERVAL = 6000;
  let current = 0;
  let timer   = null;
  let paused  = false;

  function go(idx) {
    idx = ((idx % TOTAL) + TOTAL) % TOTAL;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => {
      d.classList.remove('active', 'done');
      if (i < idx) d.classList.add('done');
      if (i === idx) d.classList.add('active');
    });
    counter.textContent = String(idx + 1).padStart(2, '0');
    current = idx;
  }

  function startAuto() {
    clearTimeout(timer);
    if (paused) return;
    timer = setTimeout(() => { go(current + 1); startAuto(); }, INTERVAL);
  }
  function resetAuto() {
    clearTimeout(timer);
    if (!paused) startAuto();
  }

  prevBtn.addEventListener('click', () => { go(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { go(current + 1); resetAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      go(parseInt(dot.dataset.idx, 10));
      resetAuto();
    });
  });

  slider.addEventListener('mouseenter', () => {
    paused = true;
    slider.classList.add('paused');
    clearTimeout(timer);
  });
  slider.addEventListener('mouseleave', () => {
    paused = false;
    slider.classList.remove('paused');
    startAuto();
  });

  let touchStartX = 0;
  slider.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  slider.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) go(current - 1);
      else go(current + 1);
      resetAuto();
    }
  });

  startAuto();
}

// ─── Boot ───
async function initSite() {
  await loadPartial('mount-navbar', 'partials/navbar.html');
  initNavbar();

  await loadPartial('mount-hero', 'partials/hero.html');
  initSlider();

  await loadPartial('mount-manifesto',     'partials/manifesto.html');
  await loadPartial('mount-servicios',     'partials/servicios.html');
  await loadPartial('mount-diferenciales', 'partials/diferenciales.html');
  await loadPartial('mount-barrios',       'partials/barrios.html');
  await loadPartial('mount-process',       'partials/process.html');
  await loadPartial('mount-contacto',      'partials/contacto.html');
  await loadPartial('mount-footer',        'partials/footer.html');
  await loadPartial('mount-wa-float',      'partials/wa-float.html');
}

document.addEventListener('DOMContentLoaded', initSite);
