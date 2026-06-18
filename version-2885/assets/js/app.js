(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-index')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var panel = scope.querySelector('[data-filter-panel]');
      if (!panel) {
        return;
      }
      var input = panel.querySelector('.filter-input');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var noResults = scope.querySelector('[data-no-results]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && input) {
        input.value = query;
      }

      function matchesSelect(card, select) {
        var value = normalize(select.value);
        var key = select.getAttribute('data-filter-key');
        if (!value || !key) {
          return true;
        }
        return normalize(card.getAttribute('data-' + key)).indexOf(value) !== -1;
      }

      function apply() {
        var term = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-category'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = (!term || haystack.indexOf(term) !== -1) && selects.every(function (select) {
            return matchesSelect(card, select);
          });
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (noResults) {
          noResults.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var hls = null;
      var initialized = false;
      if (!video) {
        return;
      }

      function initialize() {
        if (initialized) {
          return;
        }
        initialized = true;
        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          return;
        }
        video.src = source;
      }

      function playVideo() {
        initialize();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }
      player.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('button')) {
          return;
        }
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
