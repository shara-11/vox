/* =========================================================================
   VOX — main.js
   Vanilla JS only. Handles: cinematic loader, sticky nav, mobile menu,
   ambient particles, animated HUD grid, scroll reveals, animated counters,
   FAQ accordion, and the hero waveform.
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Cinematic loader
     ------------------------------------------------------------------- */
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(function () {
      loader.classList.add('loaded');
      document.body.style.overflow = '';
    }, 900);
  });

  /* ---------------------------------------------------------------------
     Sticky header
     ------------------------------------------------------------------- */
  var header = document.getElementById('site-header');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  document.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------------------
     Ambient particles (hero background)
     ------------------------------------------------------------------- */
  var particlesEl = document.getElementById('particles');
  if (particlesEl && !reduceMotion) {
    var count = window.innerWidth < 720 ? 24 : 46;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'particle';
      var left = Math.random() * 100;
      var duration = 10 + Math.random() * 14;
      var delay = Math.random() * 14;
      var drift = (Math.random() - 0.5) * 80;
      p.style.left = left + 'vw';
      p.style.bottom = '-10px';
      p.style.animationDuration = duration + 's';
      p.style.animationDelay = '-' + delay + 's';
      p.style.setProperty('--drift', drift + 'px');
      p.style.opacity = (0.25 + Math.random() * 0.4).toFixed(2);
      particlesEl.appendChild(p);
    }
  }

  /* ---------------------------------------------------------------------
     Animated HUD grid (canvas) — a slow-drifting perspective grid,
     evoking a heads-up display floor rather than a decorative pattern.
     ------------------------------------------------------------------- */
  var canvas = document.getElementById('gridCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var offset = 0;

    function resize() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawGrid() {
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      var spacing = 46 * dpr;
      ctx.strokeStyle = 'rgba(255,255,255,0.045)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (var x = -spacing; x < w + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Horizontal lines, slowly drifting upward
      for (var y = (offset % spacing) - spacing; y < h + spacing; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (!reduceMotion) {
        offset += 0.18 * dpr;
        requestAnimationFrame(drawGrid);
      }
    }
    drawGrid();
  }

  /* ---------------------------------------------------------------------
     Hero waveform — idle oscilloscope line beneath the wordmark
     ------------------------------------------------------------------- */
  var heroWave = document.getElementById('heroWave');
  if (heroWave && !reduceMotion) {
    var t = 0;
    function animateWave() {
      var pts = [];
      var segments = 40;
      for (var i = 0; i <= segments; i++) {
        var x = (400 / segments) * i;
        var y = 30 +
          Math.sin(i * 0.5 + t) * 4 +
          Math.sin(i * 0.18 + t * 1.6) * 7;
        pts.push(x.toFixed(1) + ',' + y.toFixed(1));
      }
      heroWave.setAttribute('points', pts.join(' '));
      t += 0.035;
      requestAnimationFrame(animateWave);
    }
    animateWave();
  }

  /* ---------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-up');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = Array.prototype.indexOf.call(revealEls, el) % 6 * 70;
          setTimeout(function () { el.classList.add('in'); }, reduceMotion ? 0 : delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------------------------------------------------------------
     Animated stat counters
     ------------------------------------------------------------------- */
  var statNumbers = document.querySelectorAll('.stat-number');
  function formatNumber(value, decimals) {
    if (decimals) return value.toFixed(decimals);
    return Math.round(value).toLocaleString('en-US');
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = target * eased;
      el.textContent = formatNumber(current, decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    if (reduceMotion) {
      el.textContent = formatNumber(target, decimals) + suffix;
    } else {
      requestAnimationFrame(step);
    }
  }
  if ('IntersectionObserver' in window && statNumbers.length) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNumbers.forEach(function (el) { statIo.observe(el); });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
     ------------------------------------------------------------------- */
  var triggers = document.querySelectorAll('.accordion-trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));

      // Close other open items for a clean, single-focus interaction.
      triggers.forEach(function (other) {
        if (other !== trigger) {
          other.setAttribute('aria-expanded', 'false');
          var otherPanel = document.getElementById(other.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.style.maxHeight = null;
        }
      });

      trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (panel) panel.style.maxHeight = expanded ? null : panel.scrollHeight + 'px';
    });
  });

})();
