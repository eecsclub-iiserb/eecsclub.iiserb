/**
 * GSAP & SCROLL STORYTELLING ENGINE
 * Handles SVG circuit path drawing, live telemetry counters, scroll elevator, and typewriter sequences.
 */

export function initAnimations() {
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Stagger Entrance
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl.from('.hero-tag-badge', { opacity: 0, y: -20, duration: 0.6 })
          .from('.hero-title', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
          .from('.hero-tagline', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
          .from('.hero-cta-group', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');

    // 2. SVG Circuit Path Drawing on Scroll
    document.querySelectorAll('.pcb-circuit-line').forEach((line) => {
      const length = line.getTotalLength ? line.getTotalLength() : 300;
      gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(line, {
        scrollTrigger: {
          trigger: line.closest('.section') || line,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: 1.2
        },
        strokeDashoffset: 0,
        ease: 'none'
      });
    });

    // 3. Section Chapter Reveals
    document.querySelectorAll('.section').forEach((section) => {
      const titlebar = section.querySelector('.terminal-titlebar');
      const header = section.querySelector('.section-header');
      const cards = section.querySelectorAll('.nb-card, .dossier-card, .project-cartridge');

      if (titlebar) {
        gsap.from(titlebar, {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: -15,
          duration: 0.5,
          ease: 'power2.out'
        });
      }

      if (header) {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 25,
          duration: 0.6,
          ease: 'power2.out'
        });
      }

      if (cards.length > 0) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 30,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    });

    // 4. Telemetry Metric Counter Rollups
    document.querySelectorAll('[data-counter-target]').forEach((counter) => {
      const targetVal = parseFloat(counter.getAttribute('data-counter-target') || '0');
      const isInteger = Number.isInteger(targetVal);

      gsap.to(counter, {
        scrollTrigger: {
          trigger: counter,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        innerHTML: targetVal,
        duration: 1.8,
        ease: 'power2.out',
        snap: isInteger ? { innerHTML: 1 } : { innerHTML: 0.1 }
      });
    });
  }

  // 5. Live HUD Clock & Telemetry Ticker
  initHudTelemetry();

  // 6. Scroll Elevator Tracker (Active Rail)
  initScrollElevator();
}

function initHudTelemetry() {
  const clockEl = document.getElementById('hud-clock');
  const freqEl = document.getElementById('hud-freq');

  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    clockEl.innerText = now.toTimeString().split(' ')[0] + ' UTC+5:30';
  }

  function updateFreq() {
    if (!freqEl) return;
    const jitter = (24.00 + (Math.random() - 0.5) * 0.04).toFixed(2);
    freqEl.innerText = `${jitter} MHz`;
  }

  setInterval(updateClock, 1000);
  setInterval(updateFreq, 2500);
  updateClock();
  updateFreq();
}

function initScrollElevator() {
  const elevatorNodes = document.querySelectorAll('.elevator-node');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 250;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    elevatorNodes.forEach((node) => {
      const target = node.getAttribute('href').replace('#', '');
      if (target === currentId) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    // Also sync header nav links
    document.querySelectorAll('.nav-link[href^="#"]').forEach((link) => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }, { passive: true });
}
