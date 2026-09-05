/**
 * EECS Club IISER Bhopal — Main Application Script
 * Orchestrates Cyber-Deck UI, ASCII Hardware Lab, Lore Console, and Gallery Lightbox.
 */

import { initTextScramble, initCircuitCanvas, refreshCanvasTheme } from './reactbits.js';
import { initAnimations } from './animations.js';
import { terminalEasterEggs, siteConfig, coreTeam, projects } from './data.js';

const THEME_LABELS = {
  'kanagawa': { icon: '🐲', name: 'KANAGAWA' },
  'tokyo-night': { icon: '🌃', name: 'TOKYO NIGHT' },
  'gruvbox': { icon: '📻', name: 'GRUVBOX' },
  'nord': { icon: '❄️', name: 'NORD' },
  'acid': { icon: '⚡', name: 'ACID BRUTAL' }
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Visual Effects, Canvas & Animations
  initCircuitCanvas();
  initTextScramble();
  initAnimations();

  // 2. Multi-Theme Switcher System (5 Curated Themes)
  const themeBtn = document.getElementById('theme-btn');
  const themeMenu = document.getElementById('theme-menu');
  const themeBtnIcon = document.getElementById('theme-btn-icon');
  const themeBtnLabel = document.getElementById('theme-btn-label');
  const hudTheme = document.getElementById('hud-theme');
  const themeOptions = document.querySelectorAll('[data-set-theme]');

  function applyTheme(themeId) {
    if (!THEME_LABELS[themeId]) themeId = 'kanagawa';
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('eecs_theme', themeId);

    // Update Button Label & Icon in Navbar
    if (themeBtnIcon) themeBtnIcon.innerText = THEME_LABELS[themeId].icon;
    if (themeBtnLabel) themeBtnLabel.innerText = THEME_LABELS[themeId].name;

    // Update HUD Telemetry indicator if present
    if (hudTheme) hudTheme.innerText = THEME_LABELS[themeId].name;

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

  // 3. Interactive Retro Lore Terminal Console
  initTerminalConsole(applyTheme);

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
      });
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

  // 7. Back to Top Button
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

function initTerminalConsole(applyThemeFn) {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalChips = document.querySelectorAll('.lore-chip');

  if (!terminalInput || !terminalOutput) return;

  function runCommand(cmd) {
    const raw = cmd.trim();
    if (!raw) return;

    const parts = raw.toLowerCase().split(' ');
    const mainCmd = parts[0];
    const arg = parts[1];

    let response = '';

    if (mainCmd === 'clear') {
      terminalOutput.innerHTML = '';
      terminalInput.value = '';
      return;
    } else if (mainCmd === 'help') {
      response = terminalEasterEggs['help'];
    } else if (mainCmd === 'lore') {
      response = terminalEasterEggs['lore'];
    } else if (mainCmd === 'whoami') {
      response = terminalEasterEggs['whoami'];
    } else if (mainCmd === 'contact') {
      response = terminalEasterEggs['contact'];
    } else if (mainCmd === 'team') {
      response = `[EECS CLUB ROSTER SUMMARY // 20 MEMBERS]\n` +
        coreTeam.map((m, i) => `  [#${(i+1).toString().padStart(2, '0')}] ${m.name.padEnd(18)} | ${m.department}`).join('\n');
    } else if (mainCmd === 'projects') {
      response = `[EECS CLUB ACTIVE PROJECTS]\n` +
        projects.map((p) => `  • [${p.category.toUpperCase()}] ${p.title} (Lead: ${p.doneBy})`).join('\n');
    } else if (mainCmd === 'stats') {
      response = `[TELEMETRY STATS]\n` +
        siteConfig.stats.map(s => `  ${s.label}: ${s.value}${s.suffix}`).join('\n');
    } else if (mainCmd === 'theme') {
      if (!arg) {
        const current = document.documentElement.getAttribute('data-theme') || 'kanagawa';
        const currentName = THEME_LABELS[current] ? THEME_LABELS[current].name : current;
        response = `[THEME CONTROLLER // 5 RETRO COLOR PALETTES]\n` +
          `Active Theme: ${currentName}\n\n` +
          `Available Themes:\n` +
          `  • kanagawa    [🐲] Kanagawa Dragon ink & gold (Default)\n` +
          `  • tokyo-night [🌃] Cyberpunk neon blue & purple\n` +
          `  • gruvbox     [📻] Retro hacker terminal amber & green\n` +
          `  • nord        [❄️] Arctic frost cyan & polar slate\n` +
          `  • acid        [⚡] Acid high-contrast cyber gold & coral\n\n` +
          `Type: "theme <name>" (e.g. "theme tokyo-night") or use the navbar [🎨] dropdown.`;
      } else if (THEME_LABELS[arg]) {
        applyThemeFn(arg);
        response = `[SUCCESS] Theme palette switched to "${THEME_LABELS[arg].name}" ${THEME_LABELS[arg].icon}.\nDisplay variables, CSS styles, and circuit canvas recalibrated.`;
      } else {
        response = `[ERROR] Unknown theme: "${arg}".\nAvailable: kanagawa, tokyo-night, gruvbox, nord, acid`;
      }
    } else {
      response = `Command not found: "${raw}". Type "help" for available commands.`;
    }

    const commandBlock = document.createElement('div');
    commandBlock.className = 'lore-terminal-output';
    commandBlock.innerHTML = `<span style="color: var(--dragon-gold); font-weight: 700;">guest@iiserb:~$</span> ${escapeHtml(raw)}\n<span style="color: var(--text-white);">${escapeHtml(response)}</span>`;
    terminalOutput.appendChild(commandBlock);

    terminalInput.value = '';
    const screen = terminalOutput.parentElement;
    screen.scrollTop = screen.scrollHeight;
  }

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      runCommand(terminalInput.value);
    }
  });

  terminalChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      runCommand(cmd);
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
