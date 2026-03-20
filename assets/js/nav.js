// assets/js/nav.js — Utilvault Shared Navigation Script
// Author: Hasan Rizvee (rizvee.github.io)

document.addEventListener('DOMContentLoaded', () => {

  /* ── Theme Toggle ── */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const icon = themeToggle?.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  const saved = localStorage.getItem('uv-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('uv-theme', next);
  });

  /* ── Mobile Menu ── */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  mobileMenuBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (icon) {
      icon.className = navLinks?.classList.contains('active')
        ? 'fa-solid fa-xmark'
        : 'fa-solid fa-bars';
    }
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('header') && navLinks?.classList.contains('active')) {
      navLinks.classList.remove('active');
      const icon = mobileMenuBtn?.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    }
  });

  /* ── Dropdown Menus ── */
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(dropdown => {
    const btn = dropdown.querySelector('.nav-dropdown-btn');
    const menu = dropdown.querySelector('.nav-dropdown-menu');

    // Toggle on click (works for both desktop and mobile)
    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');

      // Close all other dropdowns first
      dropdowns.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-btn')?.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      dropdowns.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-btn')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Close dropdowns on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdowns.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-btn')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ── Back to Top ── */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
