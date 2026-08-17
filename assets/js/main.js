(function () {
  'use strict';

  /* =========================================================
     OPENING HOURS — edit here to update the whole site
     Times in 24h "HH:MM". Day keys: 0=Sunday ... 6=Saturday
     Set a day to null to mark it closed.
  ========================================================= */
  var HOURS = {
    0: { open: '11:30', close: '22:30' }, // Dimanche
    1: null,                              // Lundi — fermé
    2: { open: '11:30', close: '22:00' }, // Mardi
    3: { open: '11:30', close: '22:00' }, // Mercredi
    4: { open: '11:30', close: '22:00' }, // Jeudi
    5: { open: '11:30', close: '22:00' }, // Vendredi
    6: { open: '11:30', close: '22:30' }  // Samedi
  };

  var DAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  function toMinutes(hhmm) {
    var parts = hhmm.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function getStatus(now) {
    var day = now.getDay();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var today = HOURS[day];

    if (today) {
      var openMin = toMinutes(today.open);
      var closeMin = toMinutes(today.close);
      if (nowMin >= openMin && nowMin < closeMin) {
        var minsLeft = closeMin - nowMin;
        if (minsLeft <= 30) {
          return { open: true, label: 'Ferme bientôt (' + today.close + ')' };
        }
        return { open: true, label: 'Ouvert · Ferme à ' + today.close };
      }
      if (nowMin < openMin) {
        return { open: false, label: 'Fermé · Ouvre à ' + today.open };
      }
    }

    // find next opening day
    for (var i = 1; i <= 7; i++) {
      var d = (day + i) % 7;
      if (HOURS[d]) {
        var label = i === 1 ? 'demain' : DAY_LABELS[d];
        return { open: false, label: 'Fermé · Ouvre ' + label + ' à ' + HOURS[d].open };
      }
    }
    return { open: false, label: 'Fermé' };
  }

  function updateStatus() {
    var pill = document.getElementById('statusPill');
    if (!pill) return;
    var status = getStatus(new Date());
    var textEl = pill.querySelector('.status-text');
    textEl.textContent = status.label;
    pill.classList.toggle('is-open', status.open);
    pill.classList.toggle('is-closed', !status.open);
  }

  function markTodayInHoursTable() {
    var list = document.getElementById('hoursList');
    if (!list) return;
    var items = list.querySelectorAll('li');
    var jsDay = new Date().getDay(); // 0=Sunday
    // hoursList order: Lundi(1) Mardi(2) Mer(3) Jeu(4) Ven(5) Sam(6) Dim(0)
    var order = [1, 2, 3, 4, 5, 6, 0];
    items.forEach(function (li, idx) {
      if (order[idx] === jsDay) li.classList.add('is-today');
    });
  }

  updateStatus();
  markTodayInHoursTable();
  setInterval(updateStatus, 60000);

  /* =========================================================
     HEADER — sticky shrink + mobile nav toggle
  ========================================================= */
  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  function onScroll() {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* =========================================================
     SCROLL REVEAL — IntersectionObserver fade/slide-up
  ========================================================= */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* =========================================================
     MENU TABS
  ========================================================= */
  var tabs = document.querySelectorAll('.menu-tab');
  var panels = document.querySelectorAll('.menu-panels > [data-panel]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var cat = tab.getAttribute('data-cat');

      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(function (panel) {
        var match = panel.getAttribute('data-panel') === cat;
        panel.classList.toggle('is-active', match);
        if (match) {
          panel.querySelectorAll('.reveal').forEach(function (el) {
            el.classList.add('is-visible');
          });
        }
      });
    });
  });

  /* =========================================================
     MENU HORIZONTAL SCROLL (Drinks)
  ========================================================= */
  document.querySelectorAll('.menu-scroll-outer').forEach(function (outer) {
    var track = outer.querySelector('.menu-scroll-track');
    var prevBtn = outer.querySelector('.menu-scroll-prev');
    var nextBtn = outer.querySelector('.menu-scroll-next');
    if (!track) return;

    function stepWidth() {
      var card = track.querySelector('.menu-card');
      var gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      return card ? card.getBoundingClientRect().width + gap : 260;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -stepWidth(), behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: stepWidth(), behavior: 'smooth' });
    });
  });

  /* =========================================================
     TESTIMONIAL CAROUSEL
  ========================================================= */
  var track = document.getElementById('testimonialTrack');
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll('.testimonial'));
    var dotsWrap = document.getElementById('testDots');
    var prevBtn = document.getElementById('testPrev');
    var nextBtn = document.getElementById('testNext');
    var current = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Avis ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); resetTimer(); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('is-active', idx === current); });
      dots.forEach(function (d, idx) { d.classList.toggle('is-active', idx === current); });
    }

    function resetTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { goTo(current + 1); }, 6000);
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); resetTimer(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); resetTimer(); });

    goTo(0);
    resetTimer();
  }

  /* =========================================================
     FOOTER YEAR
  ========================================================= */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
