(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function renderGlobalResults(input, panel) {
    var items = window.SEARCH_ITEMS || [];
    var keyword = normalizeText(input.value);
    if (keyword.length < 1) {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
      return;
    }
    var results = items.filter(function (item) {
      return normalizeText(item.title + item.category + item.genre + item.region + item.year + item.type).indexOf(keyword) !== -1;
    }).slice(0, 12);
    if (!results.length) {
      panel.innerHTML = '<div class="empty-state is-visible">没有找到相关影片</div>';
      panel.classList.add('is-open');
      return;
    }
    panel.innerHTML = results.map(function (item) {
      return '<a class="search-item" href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.category + ' · ' + item.year + ' · ' + item.region) + '</span></span></a>';
    }).join('');
    panel.classList.add('is-open');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function setupGlobalSearch() {
    qsa('[data-global-search]').forEach(function (input) {
      var wrap = input.closest('[data-search-wrap]');
      var panel = wrap ? qs('[data-search-panel]', wrap) : null;
      if (!panel) {
        return;
      }
      input.addEventListener('input', function () {
        renderGlobalResults(input, panel);
      });
      input.addEventListener('focus', function () {
        renderGlobalResults(input, panel);
      });
      document.addEventListener('click', function (event) {
        if (!wrap.contains(event.target)) {
          panel.classList.remove('is-open');
        }
      });
    });
  }

  function setupLocalFilters() {
    var list = qs('[data-local-list]');
    if (!list) {
      return;
    }
    var cards = qsa('[data-card]', list);
    var search = qs('[data-local-search]');
    var filters = qsa('[data-local-filter]');
    var empty = qs('[data-empty-state]');

    function apply() {
      var keyword = normalizeText(search ? search.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        if (keyword && normalizeText(card.getAttribute('data-search')).indexOf(keyword) === -1) {
          ok = false;
        }
        filters.forEach(function (filter) {
          var key = filter.getAttribute('data-local-filter');
          var value = filter.value;
          if (value && card.getAttribute('data-' + key) !== value) {
            ok = false;
          }
        });
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    filters.forEach(function (filter) {
      filter.addEventListener('change', apply);
    });
    apply();
  }

  window.initMoviePlayer = function (src) {
    var box = qs('[data-player]');
    if (!box) {
      return;
    }
    var video = qs('video', box);
    var overlay = qs('.player-overlay', box);
    var hls = null;
    var loaded = false;

    function attach() {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilters();
  });
})();
