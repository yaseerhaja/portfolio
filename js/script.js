/* Hajamohaideen Kudhbudeen — portfolio interactions */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'hk-theme';

  /* ---------------------------------------------------------- theme */
  var themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0c' : '#fafafa');
  }

  var stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    /* storage blocked — fall back to system preference */
  }

  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  /* ------------------------------------------------------ mobile nav */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* -------------------------------------------------- sticky nav state */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------ scroll reveal + spy */
  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    Array.prototype.forEach.call(revealItems, function (el) {
      el.classList.add('is-in');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
          el.classList.add('is-in');
          revealObserver.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );
    Array.prototype.forEach.call(revealItems, function (el) {
      revealObserver.observe(el);
    });
  }

  /* section highlight in nav */
  var links = document.querySelectorAll('.nav__link');
  var sections = [];
  Array.prototype.forEach.call(links, function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) sections.push({ link: link, el: target });
  });

  function syncSpy() {
    if (!sections.length) return;
    var line = window.scrollY + window.innerHeight * 0.35;
    var current = null;

    sections.forEach(function (s) {
      if (s.el.offsetTop <= line) current = s;
    });

    /* past the last section (footer in view) keeps the last one lit */
    if (!current && window.scrollY + window.innerHeight >= document.body.scrollHeight - 4) {
      current = sections[sections.length - 1];
    }

    sections.forEach(function (s) {
      s.link.classList.toggle('is-active', s === current);
    });
  }

  window.addEventListener('scroll', syncSpy, { passive: true });
  window.addEventListener('resize', syncSpy);
  syncSpy();

  /* ------------------------------------------------------------ year */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
