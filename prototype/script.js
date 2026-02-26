/* ===== Chipatala Connect – UI Interactions ===== */

(function () {
  'use strict';

  /* ---------- Theme Toggle ---------- */
  const THEME_KEY = 'chipatala-theme';

  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    updateToggleIcons(dark);
  }

  function updateToggleIcons(dark) {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      const sun = btn.querySelector('.icon-sun');
      const moon = btn.querySelector('.icon-moon');
      if (sun && moon) {
        sun.style.display = dark ? 'none' : 'block';
        moon.style.display = dark ? 'block' : 'none';
      }
    });
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    applyTheme(dark);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(!isDark);
      });
    });

    /* ---------- Tabs ---------- */
    document.querySelectorAll('.tabs').forEach(function (tabsContainer) {
      const buttons = tabsContainer.querySelectorAll('.tab-btn');
      const parentCard = tabsContainer.closest('.card') || tabsContainer.parentElement;
      const panels = parentCard.querySelectorAll('.tab-panel');

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) { b.classList.remove('active'); });
          panels.forEach(function (p) { p.classList.remove('active'); });
          btn.classList.add('active');
          var target = parentCard.querySelector('#' + btn.dataset.tab);
          if (target) target.classList.add('active');
        });
      });
    });

    /* ---------- Retrieve Code Demo ---------- */
    var retrieveBtn = document.getElementById('retrieve-btn');
    var retrieveResult = document.getElementById('retrieve-result');
    if (retrieveBtn && retrieveResult) {
      retrieveBtn.addEventListener('click', function () {
        retrieveResult.style.display = 'block';
        retrieveResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    /* ---------- QR Generate Demo ---------- */
    var generateQrBtn = document.getElementById('generate-qr-btn');
    var qrResult = document.getElementById('qr-result');
    if (generateQrBtn && qrResult) {
      generateQrBtn.addEventListener('click', function () {
        qrResult.style.display = 'block';
        qrResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    /* ---------- Access Request Demo ---------- */
    var accessBtn = document.getElementById('access-request-btn');
    var sessionPanel = document.getElementById('session-panel');
    if (accessBtn && sessionPanel) {
      accessBtn.addEventListener('click', function () {
        sessionPanel.style.display = 'block';
        sessionPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    /* ---------- Sidebar Active State ---------- */
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-nav a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      }
    });
  });
})();
