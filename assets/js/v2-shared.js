/* ============================================
 * v2.0 · Shared interactions for subpages
 * (cursor / tilt / reveal / magnetic / page-transition)
 * ============================================ */
(() => {
  'use strict';
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Magnetic custom cursor ---- */
  function initCursor() {
    if (!canHover || prefersReduced) return;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a, button, [role=button]').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
    document.querySelectorAll('[data-cursor=view]').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('viewing'));
      el.addEventListener('mouseleave', () => ring.classList.remove('viewing'));
    });
    document.querySelectorAll('.btn, .nav-cta, .social-icon, [data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---- Card tilt + spotlight ---- */
  function initTilt() {
    if (!canHover || prefersReduced) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.style.transformStyle = 'preserve-3d';
      let raf = 0;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -8;
        const ry = (px - 0.5) * 10;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
          card.style.setProperty('--mx', `${px * 100}%`);
          card.style.setProperty('--my', `${py * 100}%`);
        });
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---- Reveal on scroll ---- */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          // staggered child reveal if container has data-reveal-stagger
          const delay = parseInt(e.target.dataset.revealDelay || '0', 10);
          setTimeout(() => e.target.classList.add('in'), delay);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---- Parallax (hero layers) ---- */
  function initParallax() {
    if (prefersReduced) return;
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;
    let raf = 0;
    addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = scrollY;
        layers.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.3;
          el.style.transform = `translate3d(0, ${y * speed * -1}px, 0)`;
        });
      });
    }, { passive: true });
  }

  /* ---- Page transition (View Transitions where supported) ---- */
  function initPageTransition() {
    if (!document.startViewTransition) return;
    document.querySelectorAll('a[href]:not([target=_blank]):not([href^="#"]):not([href^="mailto"])').forEach((a) => {
      a.addEventListener('click', (e) => {
        const url = new URL(a.href);
        if (url.origin !== location.origin) return;
        e.preventDefault();
        document.startViewTransition(() => { location.href = a.href; });
      });
    });
  }

  function boot() {
    initCursor();
    initTilt();
    initReveal();
    initParallax();
    initPageTransition();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
