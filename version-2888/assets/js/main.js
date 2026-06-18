(function () {
  var header = document.querySelector('[data-header]');
  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
    mobilePanel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobilePanel.classList.remove('is-open');
      });
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;
    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    prev && prev.addEventListener('click', function () {
      show(current - 1);
      restart();
    });
    next && next.addEventListener('click', function () {
      show(current + 1);
      restart();
    });
    restart();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.parentElement;
    var input = panel.querySelector('[data-local-search]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
    var list = scope ? scope.querySelector('[data-filter-list]') : null;
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];
    var empty = scope ? scope.querySelector('[data-empty-state]') : null;
    var active = '全部';

    if (input && input.hasAttribute('data-query-input')) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      input.value = q;
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' '));
        var type = normalize(card.getAttribute('data-type'));
        var byKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var byType = active === '全部' || type.indexOf(normalize(active)) !== -1;
        var visible = byKeyword && byType;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    buttons.forEach(function (button) {
      if (button.getAttribute('data-filter-value') === active) {
        button.classList.add('is-active');
      }
      button.addEventListener('click', function () {
        active = button.getAttribute('data-filter-value') || '全部';
        buttons.forEach(function (other) {
          other.classList.toggle('is-active', other === button);
        });
        apply();
      });
    });

    input && input.addEventListener('input', apply);
    apply();
  });
})();
