/* Hajamohaideen Kudhbudeen — portfolio interactions
   Vanilla, no dependencies. Every effect is transform/opacity only and
   switches itself off under prefers-reduced-motion. */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'hk-theme';
  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#08080a' : '#fbfbfc');
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
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
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

  /* --------------------------------------------- headline word reveal */
  /* Wraps each word as <span class="w"><i>word</i></span> so the mask can
     slide it up. Text stays in the markup for crawlers and no-JS readers. */
  function splitWords(el) {
    var words = [];

    (function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.nodeValue.split(/(\s+)/).forEach(function (chunk) {
            if (!chunk) return;
            if (/^\s+$/.test(chunk)) {
              frag.appendChild(document.createTextNode(chunk));
              return;
            }
            var mask = document.createElement('span');
            var inner = document.createElement('i');
            mask.className = 'w';
            inner.textContent = chunk;
            mask.appendChild(inner);
            frag.appendChild(mask);
            words.push(inner);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);

    words.forEach(function (w, i) {
      w.style.setProperty('--d', i * 80 + 'ms');
    });
  }

  var splitTargets = document.querySelectorAll('[data-split]');
  if (!reduceMotion) {
    Array.prototype.forEach.call(splitTargets, splitWords);

    /* the hero headline lights straight away; the rest wait their turn */
    var hero = document.querySelector('.hero__title[data-split]');
    if (hero) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          hero.classList.add('is-lit');
        });
      });
    }

    if ('IntersectionObserver' in window) {
      var litObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-lit');
            obs.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
      );
      Array.prototype.forEach.call(splitTargets, function (el) {
        if (el !== hero) litObserver.observe(el);
      });
    } else {
      Array.prototype.forEach.call(splitTargets, function (el) {
        el.classList.add('is-lit');
      });
    }
  }

  /* ---------------------------------------------------- typewriter */
  /* The animated span is aria-hidden; a visually-hidden sibling carries
     the full list for screen readers, and the markup ships with the
     first word already in place for no-JS readers. */
  var typer = document.getElementById('typewriter');

  if (typer) {
    var out = typer.querySelector('.typewriter__text');
    var words = (typer.getAttribute('data-words') || '').split('|').filter(Boolean);

    if (words.length && out) {
      if (reduceMotion) {
        out.textContent = words.join(' / ');
      } else {
        var wi = 0;
        var ci = 0;
        var deleting = false;
        var timer;

        /* hold the widest word's width so the line never reflows */
        var sizer = document.createElement('span');
        sizer.className = 'typewriter__text';
        sizer.style.position = 'absolute';
        sizer.style.visibility = 'hidden';
        sizer.style.whiteSpace = 'pre';
        typer.appendChild(sizer);
        var widest = 0;
        words.forEach(function (w) {
          sizer.textContent = w;
          widest = Math.max(widest, sizer.getBoundingClientRect().width);
        });
        typer.removeChild(sizer);
        /* reserve on the wrapper, not the text — the text box has to
           shrink with its content or the caret can't follow it */
        typer.style.minWidth = Math.ceil(widest) + 8 + 'px';

        var step = function () {
          var word = words[wi];

          if (!deleting) {
            ci++;
            out.textContent = word.slice(0, ci);
            if (ci === word.length) {
              deleting = true;
              timer = setTimeout(step, 2600);
              return;
            }
            timer = setTimeout(step, 105);
          } else {
            ci--;
            out.textContent = word.slice(0, ci);
            if (ci === 0) {
              deleting = false;
              wi = (wi + 1) % words.length;
              timer = setTimeout(step, 520);
              return;
            }
            timer = setTimeout(step, 55);
          }
        };

        /* don't burn frames while the tab is in the background */
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            clearTimeout(timer);
          } else {
            timer = setTimeout(step, 400);
          }
        });

        ci = words[0].length;
        deleting = true;
        timer = setTimeout(step, 2200);
      }
    }
  }

  /* -------------------------------------------------- sticky nav state */
  var nav = document.getElementById('nav');
  var navProgress = document.getElementById('navProgress');

  /* --------------------------------------------------------- hero aura */
  var heroAura = document.getElementById('heroAura');
  var heroSection = document.getElementById('top');
  var heroCopy = heroSection && heroSection.querySelector('.hero__grid > div');
  var heroPortrait = heroSection && heroSection.querySelector('.hero__portrait');

  if (!reduceMotion && heroCopy) heroCopy.classList.add('hero__scrub');
  if (!reduceMotion && heroPortrait) heroPortrait.classList.add('hero__scrub');

  /* --------------------------------------------- pinned stack diagram */
  /* The stage is taller than the viewport; the diagram sticks to the top
     of it and the four layers land one after another as you scroll
     through, in step with the scroll rather than on a single trigger. */
  var stage = document.getElementById('stackStage');
  var infoRows = stage ? stage.querySelectorAll('.info-row') : [];
  var infoBracket = stage ? stage.querySelector('.info-bracket') : null;
  var stackScrub = stage && infoRows.length && !reduceMotion;

  if (stackScrub && window.innerWidth > 860) stage.classList.add('is-pinned');

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  /* smoothstep keeps each layer's arrival from starting or stopping abruptly */
  function smooth(v) {
    return v * v * (3 - 2 * v);
  }

  function drawStack() {
    if (!stackScrub) return;

    var box = stage.getBoundingClientRect();
    var vh = window.innerHeight;
    var pinned = stage.classList.contains('is-pinned');
    var p;

    if (pinned) {
      /* progress through the sticky travel */
      p = clamp01(-box.top / Math.max(box.height - vh, 1));
    } else {
      p = clamp01((vh * 0.9 - box.top) / (box.height + vh * 0.5));
    }

    var n = infoRows.length;
    var lastActive = -1;

    for (var i = 0; i < n; i++) {
      /* each layer owns an overlapping slice of the travel */
      var start = (i / n) * 0.72;
      var end = start + 0.34;
      var rp = smooth(clamp01((p - start) / (end - start)));
      infoRows[i].style.setProperty('--rp', rp.toFixed(3));
      if (rp > 0.55) lastActive = i;
    }

    for (var j = 0; j < n; j++) {
      infoRows[j].classList.toggle('is-active', j === lastActive && lastActive < n - 1);
    }

    if (infoBracket) {
      infoBracket.style.setProperty('--bp', smooth(clamp01((p - 0.45) / 0.4)).toFixed(3));
    }
  }

  /* ----------------------------------------------------- timeline rail */
  var timeline = document.getElementById('timeline');
  var timelineRail = document.getElementById('timelineRail');

  /* --------------------------------------------------------- scrollspy */
  var links = document.querySelectorAll('.nav__link');
  var sections = [];
  Array.prototype.forEach.call(links, function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) sections.push({ link: link, el: target });
  });

  function currentSection() {
    var line = window.scrollY + window.innerHeight * 0.35;
    var current = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= line) current = s;
    });
    if (!current && window.scrollY + window.innerHeight >= document.body.scrollHeight - 4) {
      current = sections[sections.length - 1];
    }
    return current;
  }

  /* one rAF-throttled pass for everything that reads scroll position */
  var ticking = false;

  function onFrame() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;

    if (nav) nav.classList.toggle('is-stuck', y > 8);

    if (navProgress) {
      var max = document.documentElement.scrollHeight - vh;
      var p = max > 0 ? Math.min(y / max, 1) : 0;
      navProgress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }

    /* hero scrub: the aura, portrait and copy leave at different rates and
       dim on the way out, so the section hands over instead of just sliding */
    if (heroSection && !reduceMotion && y < vh * 1.8) {
      var hp = Math.min(y / (vh * 0.85), 1);
      var fade = 1 - Math.max(hp - 0.15, 0) * 0.9;

      if (heroAura) heroAura.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(2) + 'px,0)';
      if (heroCopy) {
        heroCopy.style.transform = 'translate3d(0,' + (hp * -34).toFixed(2) + 'px,0)';
        heroCopy.style.opacity = fade.toFixed(3);
      }
      if (heroPortrait) {
        heroPortrait.style.transform =
          'translate3d(0,' + (hp * -64).toFixed(2) + 'px,0) scale(' + (1 - hp * 0.05).toFixed(4) + ')';
        heroPortrait.style.opacity = fade.toFixed(3);
      }
    }

    drawStack();

    /* rail fills as the timeline passes the reading line */
    if (timeline && timelineRail) {
      var box = timeline.getBoundingClientRect();
      var travelled = vh * 0.68 - box.top;
      var ratio = Math.max(0, Math.min(travelled / box.height, 1));
      timelineRail.style.setProperty('--p', ratio.toFixed(4));
    }

    var current = currentSection();
    sections.forEach(function (s) {
      s.link.classList.toggle('is-active', s === current);
    });
  }

  function requestFrame() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }

  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', function () {
    /* pinning only makes sense where there is room for it */
    if (stackScrub) stage.classList.toggle('is-pinned', window.innerWidth > 860);
    requestFrame();
  });
  onFrame();

  /* ------------------------------------------------------ scroll reveal */
  var revealItems = document.querySelectorAll('.reveal');
  var roles = document.querySelectorAll('.role');

  /* stagger the bullets inside each role card */
  Array.prototype.forEach.call(roles, function (role) {
    var items = role.querySelectorAll('.role__list li');
    Array.prototype.forEach.call(items, function (li, i) {
      li.style.setProperty('--d', Math.min(i * 55, 440) + 'ms');
    });
  });

  function markAll() {
    Array.prototype.forEach.call(revealItems, function (el) {
      el.classList.add('is-in');
    });
    Array.prototype.forEach.call(roles, function (el) {
      el.classList.add('is-in');
    });
  }

  if (!('IntersectionObserver' in window) || reduceMotion) {
    markAll();
  } else {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    /* siblings that enter together get a small cascade */
    var groups = document.querySelectorAll('.stats, .skills, .work, .cards3, .facts, .contact__links');
    Array.prototype.forEach.call(groups, function (group) {
      var kids = group.querySelectorAll(':scope > .reveal');
      Array.prototype.forEach.call(kids, function (kid, i) {
        kid.style.setProperty('--d', Math.min(i * 70, 420) + 'ms');
      });
    });

    Array.prototype.forEach.call(revealItems, function (el) {
      observer.observe(el);
    });
    Array.prototype.forEach.call(roles, function (el) {
      observer.observe(el);
    });
  }

  /* --------------------------------------------- pointer-tracked sheen */
  if (window.matchMedia && window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    var cards = document.querySelectorAll('.skill-card, .work-card');
    Array.prototype.forEach.call(cards, function (card) {
      card.addEventListener(
        'pointermove',
        function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
          card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
        },
        { passive: true }
      );
    });
  }

  /* ------------------------------------------------------- work carousel */
  /* Continuous circular marquee. The original cards are cloned until the
     track is at least twice the viewport, then the offset wraps by one
     set width — so the loop has no seam and no "rewind" jump. Falls back
     to the plain grid under reduced motion or if anything is missing. */
  (function () {
    var frame = document.getElementById('workCarousel');
    var viewport = document.getElementById('workViewport');
    var track = document.getElementById('workTrack');
    if (!frame || !viewport || !track || reduceMotion) return;

    var originals = Array.prototype.slice.call(track.children);
    if (originals.length < 2) return;

    frame.classList.add('is-live');

    var setWidth = 0;
    var step = 0;
    var x = 0;
    var target = 0;
    var paused = false;
    var pausedByUser = false;
    var dragging = false;
    var dragId = null;
    var lastPointerX = 0;
    var SPEED = 38; /* px per second */

    function clearClones() {
      Array.prototype.slice.call(track.querySelectorAll('[data-clone]')).forEach(function (el) {
        track.removeChild(el);
      });
    }

    function gapWidth() {
      var g = parseFloat(getComputedStyle(track).columnGap);
      return isNaN(g) ? 0 : g;
    }

    function measure() {
      clearClones();

      var gap = gapWidth();
      setWidth = originals.reduce(function (sum, el) {
        return sum + el.getBoundingClientRect().width + gap;
      }, 0);
      step = originals[0].getBoundingClientRect().width + gap;

      /* enough copies to cover the viewport plus one full set */
      var needed = Math.ceil((viewport.getBoundingClientRect().width + setWidth) / setWidth);
      for (var i = 0; i < needed; i++) {
        originals.forEach(function (el) {
          var copy = el.cloneNode(true);
          copy.setAttribute('data-clone', '');
          copy.setAttribute('aria-hidden', 'true');
          /* clones must not be tab stops or duplicate ids */
          copy.removeAttribute('id');
          Array.prototype.slice.call(copy.querySelectorAll('a, button, [id]')).forEach(function (node) {
            node.removeAttribute('id');
            if (node.tagName === 'A' || node.tagName === 'BUTTON') node.setAttribute('tabindex', '-1');
          });
          track.appendChild(copy);
        });
      }

      x = wrap(x);
      target = x;
      draw();
    }

    function wrap(v) {
      if (!setWidth) return v;
      while (v <= -setWidth) v += setWidth;
      while (v > 0) v -= setWidth;
      return v;
    }

    function draw() {
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    }

    var last = 0;

    function tick(now) {
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      if (!paused && !pausedByUser && !dragging && !document.hidden) {
        target -= SPEED * dt;
      }

      /* ease toward the target so button nudges glide instead of jumping */
      x += (target - x) * (dragging ? 1 : 0.14);

      if (target <= -setWidth) {
        target += setWidth;
        x += setWidth;
      } else if (target > 0) {
        target -= setWidth;
        x -= setWidth;
      }

      draw();
      requestAnimationFrame(tick);
    }

    /* pause while a human is looking at or touching a card */
    frame.addEventListener('pointerenter', function () { paused = true; });
    frame.addEventListener('pointerleave', function () { paused = false; });
    frame.addEventListener('focusin', function () { paused = true; });
    frame.addEventListener('focusout', function () { paused = false; });

    var prev = document.getElementById('workPrev');
    var next = document.getElementById('workNext');
    var pause = document.getElementById('workPause');

    /* snap to a card boundary so the card lands flush with the frame
       instead of stopping wherever the drift happened to be */
    function nudge(dir) {
      target = Math.round((target + dir * step) / step) * step;
    }

    if (prev) prev.addEventListener('click', function () { nudge(1); });
    if (next) next.addEventListener('click', function () { nudge(-1); });
    if (pause) {
      pause.addEventListener('click', function () {
        pausedByUser = !pausedByUser;
        pause.setAttribute('aria-pressed', String(pausedByUser));
        pause.setAttribute('aria-label', pausedByUser ? 'Play the carousel' : 'Pause the carousel');
      });
    }

    /* drag to scrub */
    viewport.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      dragId = e.pointerId;
      lastPointerX = e.clientX;
      viewport.setPointerCapture(dragId);
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== dragId) return;
      var dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      if (Math.abs(dx) > 2) frame.classList.add('is-dragging');
      target += dx;
      x += dx;
    });

    function endDrag(e) {
      if (!dragging || (e && e.pointerId !== dragId)) return;
      dragging = false;
      if (dragId !== null && viewport.hasPointerCapture(dragId)) {
        viewport.releasePointerCapture(dragId);
      }
      dragId = null;
      /* let the click through only if the pointer barely moved */
      setTimeout(function () { frame.classList.remove('is-dragging'); }, 0);
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    });

    measure();
    /* widths shift once the webfonts land */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    requestAnimationFrame(tick);
  })();

  /* ------------------------------------------------- copy to clipboard */
  /* The mailto: button next to this one needs a mail client to do
     anything; this is the fallback that always works. */
  var copyBtn = document.getElementById('copyEmail');
  var copyStatus = document.getElementById('copyStatus');

  function legacyCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(field);
    return ok;
  }

  if (copyBtn) {
    var label = copyBtn.querySelector('.btn__label');
    var idle = label ? label.textContent : '';
    var resetTimer;

    var settle = function (ok, value) {
      if (label) label.textContent = ok ? 'Copied' : 'Copy blocked';
      copyBtn.classList.toggle('is-done', ok);
      if (copyStatus) {
        copyStatus.textContent = ok
          ? value + ' copied to clipboard'
          : 'Copy failed. The address is ' + value;
      }
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        if (label) label.textContent = idle;
        copyBtn.classList.remove('is-done');
        if (copyStatus) copyStatus.textContent = '';
      }, 2400);
    };

    copyBtn.addEventListener('click', function () {
      var value = copyBtn.getAttribute('data-copy') || '';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          function () {
            settle(true, value);
          },
          function () {
            settle(legacyCopy(value), value);
          }
        );
      } else {
        settle(legacyCopy(value), value);
      }
    });
  }

  /* ------------------------------------------------------------ year */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
