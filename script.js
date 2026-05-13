// ─── Sticky navbar background on scroll ───
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// ─── Image fallback: Pexels → Picsum if Pexels fails ───
// Each slide's <img> calls this onerror. We swap the src to a Picsum URL
// (which is essentially guaranteed to load). The .loaded class triggers
// the fade-in animation when the new image finishes loading.
function sendaImgFallback(img, seed) {
  if (img.dataset.fallbackTried) return; // prevent infinite loops
  img.dataset.fallbackTried = '1';
  img.classList.remove('loaded');
  img.onload = function() { img.classList.add('loaded'); };
  img.src = 'https://picsum.photos/seed/' + seed + '/1200/1500';
}

// ─── Mobile nav toggle ───
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── Scroll-reveal with Intersection Observer ───
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ─── Form submission → opens WhatsApp with prefilled message ───
function handleSubmit(event) {
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
}

// ─── HERO SLIDER ───
(function initSlider() {
  const slider  = document.getElementById('heroSlider');
  if (!slider) return;

  const slides  = slider.querySelectorAll('.slide');
  const dots    = slider.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const counter = slider.querySelector('.slider-counter .current');
  const TOTAL   = slides.length;
  const INTERVAL = 6000; // 6 seconds per slide
  let current = 0;
  let timer   = null;
  let paused  = false;

  function go(idx) {
    idx = ((idx % TOTAL) + TOTAL) % TOTAL;
    // Update slides
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    // Update dots
    dots.forEach((d, i) => {
      d.classList.remove('active', 'done');
      if (i < idx) d.classList.add('done');
      if (i === idx) d.classList.add('active');
    });
    // Counter
    counter.textContent = String(idx + 1).padStart(2, '0');
    current = idx;
  }

  function startAuto() {
    clearTimeout(timer);
    if (paused) return;
    timer = setTimeout(() => {
      go(current + 1);
      startAuto();
    }, INTERVAL);
  }
  function resetAuto() {
    clearTimeout(timer);
    if (!paused) startAuto();
  }

  // Navigation buttons
  prevBtn.addEventListener('click', () => { go(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { go(current + 1); resetAuto(); });

  // Dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      go(parseInt(dot.dataset.idx, 10));
      resetAuto();
    });
  });

  // Pause on hover, resume on leave
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

  // Touch swipe (basic)
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

  // Start
  startAuto();

  // Listen for the dot animation end to advance (more accurate timing)
  // The CSS animation runs 6s and the JS timer also at 6s — synced.
})();
