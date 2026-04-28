/* ============================================
 * v2.0 · Home Page Interactions
 * - Hero fx (char drop, typewriter)
 * - Magnetic cursor
 * - Card 3D tilt + spotlight
 * - Snap nav sync + progress rail
 * ============================================ */

(() => {
  'use strict';

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------- Hero: split chars & kick off ------- */
  function initHero() {
    const hello = document.querySelector('.hello');
    if (hello) {
      const text = hello.textContent;
      hello.textContent = '';
      [...text].forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        hello.appendChild(span);
      });
      requestAnimationFrame(() => hello.classList.add('ready'));
    }

    const hero = document.getElementById('hero');
    if (hero) setTimeout(() => hero.classList.add('ready'), 50);

    // typewriter tagline
    const tag = document.querySelector('.hero-tagline');
    if (tag && !prefersReduced) {
      const full = tag.dataset.text || tag.textContent;
      tag.textContent = '';
      let i = 0;
      setTimeout(function tick() {
        if (i <= full.length) {
          tag.textContent = full.slice(0, i) + (i < full.length ? '▍' : '');
          i++;
          setTimeout(tick, 55);
        }
      }, 1400);
    }
  }

  /* ------- Magnetic cursor ------- */
  function initCursor() {
    if (!canHover || prefersReduced) return;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

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

    // hover states
    const hovTargets = document.querySelectorAll('a, button, .nav-links li, .progress-dot, .social-icon');
    hovTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });

    const viewTargets = document.querySelectorAll('.photo-card:not(.ghost), .hero-portrait');
    viewTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('viewing'));
      el.addEventListener('mouseleave', () => ring.classList.remove('viewing'));
    });

    // magnetic pull on buttons
    document.querySelectorAll('.btn, .nav-cta, .social-icon').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ------- Card 3D tilt + spotlight ------- */
  function initTilt() {
    if (!canHover || prefersReduced) return;
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach((card) => {
      card.style.transformStyle = 'preserve-3d';
      let raf = 0;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -10;
        const ry = (px - 0.5) * 12;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
          card.style.setProperty('--mx', `${px * 100}%`);
          card.style.setProperty('--my', `${py * 100}%`);
        });
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ------- Nav + progress rail sync ------- */
  function initNavSync() {
    const sections = document.querySelectorAll('main > .snap');
    const navMap = new Map();
    document.querySelectorAll('[data-nav-target]').forEach((a) => {
      navMap.set(a.dataset.navTarget, a);
    });
    const dots = document.querySelectorAll('.progress-dot');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
            const id = entry.target.id;
            // nav highlight
            navMap.forEach((a, key) => a.classList.toggle('active', key === id));
            // dots
            dots.forEach((d) => d.classList.toggle('active', d.dataset.target === id));
            // url hash (no history)
            history.replaceState(null, '', `#${id}`);
          }
        });
      },
      { threshold: [0.55] }
    );
    sections.forEach((s) => io.observe(s));

    // dot click → scroll
    dots.forEach((d) => {
      d.addEventListener('click', () => {
        const target = document.getElementById(d.dataset.target);
        target?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ------- Reveal on scroll ------- */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ------- Portrait 3D follow cursor ------- */
  function initPortraitParallax() {
    if (!canHover || prefersReduced) return;
    const portrait = document.querySelector('.hero-portrait');
    if (!portrait) return;
    portrait.addEventListener('mousemove', (e) => {
      const r = portrait.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      portrait.style.transform =
        `perspective(1200px) rotateY(${px * 10}deg) rotateX(${py * -10}deg) translateZ(0)`;
    });
    portrait.addEventListener('mouseleave', () => {
      portrait.style.transform = '';
    });
  }

  /* ------- Boot ------- */
  function boot() {
    initHero();
    initCursor();
    initTilt();
    initNavSync();
    initReveal();
    initPortraitParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
