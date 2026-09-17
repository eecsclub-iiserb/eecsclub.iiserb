/**
 * EECS Club IISER Bhopal — Main Application Script
 * Orchestrates Cyber-Deck UI, ASCII Hardware Lab, Lore Console, and Gallery Lightbox.
 */

import { initTextScramble, initCircuitCanvas, refreshCanvasTheme } from './reactbits.js';
import { initAnimations } from './animations.js';

const THEME_LABELS = {
  'kanagawa': { icon: '🐲', name: 'KANAGAWA' },
  'tokyo-night': { icon: '🌃', name: 'TOKYO NIGHT' },
  'gruvbox': { icon: '📻', name: 'GRUVBOX' },
  'nord': { icon: '❄️', name: 'NORD' },
  'acid': { icon: '⚡', name: 'ACID BRUTAL' }
};

function initApp() {
  // 1. Initialize Visual Effects, Canvas & Animations
  initCircuitCanvas();
  initTextScramble();
  initAnimations();

  // 2. Multi-Theme Switcher System (5 Curated Themes)
  const themeBtn = document.getElementById('theme-btn');
  const themeMenu = document.getElementById('theme-menu');
  const themeBtnIcon = document.getElementById('theme-btn-icon');
  const themeBtnLabel = document.getElementById('theme-btn-label');
  const themeOptions = document.querySelectorAll('[data-set-theme]');

  function applyTheme(themeId) {
    if (!THEME_LABELS[themeId]) themeId = 'kanagawa';
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('eecs_theme', themeId);

    // Update Button Label & Icon in Navbar
    if (themeBtnIcon) themeBtnIcon.innerText = THEME_LABELS[themeId].icon;
    if (themeBtnLabel) themeBtnLabel.innerText = THEME_LABELS[themeId].name;

    // Update active state on all theme buttons (navbar dropdown and mobile drawer)
    document.querySelectorAll('[data-set-theme]').forEach((opt) => {
      const match = opt.getAttribute('data-set-theme') === themeId;
      opt.classList.toggle('active', match);
      opt.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    // Refresh canvas particle colors to match current theme
    setTimeout(() => {
      refreshCanvasTheme();
    }, 50);
  }

  // Load saved theme or default to kanagawa
  const savedTheme = localStorage.getItem('eecs_theme') || 'kanagawa';
  applyTheme(savedTheme);

  // Dropdown Toggle & Selection Handlers
  if (themeBtn && themeMenu) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = themeMenu.classList.toggle('open');
      themeBtn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
        themeMenu.classList.remove('open');
        themeBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && themeMenu.classList.contains('open')) {
        themeMenu.classList.remove('open');
        themeBtn.setAttribute('aria-expanded', 'false');
        themeBtn.focus();
      }
    });
  }

  // Theme option clicks (for navbar dropdown and mobile drawer)
  document.querySelectorAll('[data-set-theme]').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const themeId = opt.getAttribute('data-set-theme');
      applyTheme(themeId);
      if (themeMenu) {
        themeMenu.classList.remove('open');
      }
      if (themeBtn) {
        themeBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });

// (terminal console removed)

  // 4. Mobile Navigation Drawer
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerText = isOpen ? '[✕] CLOSE' : '[☰] MENU';
    });

    mobileDrawer.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.innerText = '[☰] MENU';
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('open') && !mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileDrawer.classList.remove('open');
        mobileToggle.innerText = '[☰] MENU';
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 5. Project Filter System
  const filterBtns = document.querySelectorAll('.nb-filter-tab');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // 6. Gallery Lightbox Modal
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.gallery-item, .achievement-img-wrapper').forEach((item) => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img) return;
        const caption = item.getAttribute('data-caption') || img.getAttribute('alt');
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        if (lightboxCaption) lightboxCaption.innerText = caption;
        
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  // 7. Hackathons Master Directory Modal
  const hackModal = document.getElementById('hackathons-modal');
  const openHackModalBtn = document.getElementById('open-hackathons-modal-btn');
  const closeHackModalBtn = document.getElementById('close-hackathons-modal-btn');

  if (hackModal && openHackModalBtn) {
    const openModal = () => {
      hackModal.classList.add('open');
      hackModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      hackModal.classList.remove('open');
      hackModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    openHackModalBtn.addEventListener('click', openModal);
    if (closeHackModalBtn) closeHackModalBtn.addEventListener('click', closeModal);

    hackModal.addEventListener('click', (e) => {
      if (e.target === hackModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hackModal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // 8. Back to Top Button
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


