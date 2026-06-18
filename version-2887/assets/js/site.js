function initHeroCarousel() {
  const root = document.getElementById('heroCarousel');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) return;
  let current = 0;
  let timer = null;
  const show = function(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  };
  const start = function() {
    timer = window.setInterval(function() {
      show(current + 1);
    }, 5000);
  };
  const stop = function() {
    if (timer) window.clearInterval(timer);
  };
  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      stop();
      show(i);
      start();
    });
  });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initMobileNav() {
  const button = document.getElementById('mobileMenuButton');
  const nav = document.getElementById('mainNav');
  if (!button || !nav) return;
  button.addEventListener('click', function() {
    const open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function initFilters() {
  document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
    const input = scope.querySelector('[data-filter-input]');
    const year = scope.querySelector('[data-filter-year]');
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
    const empty = scope.querySelector('[data-filter-empty]');
    const readQuery = scope.getAttribute('data-read-query');
    if (readQuery && input) {
      const params = new URLSearchParams(window.location.search);
      const value = params.get(readQuery) || '';
      input.value = value;
    }
    const apply = function() {
      const words = input && input.value ? input.value.trim().toLowerCase().split(/\s+/).filter(Boolean) : [];
      const yearValue = year && year.value ? year.value : '';
      let visible = 0;
      cards.forEach(function(card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const cardYear = card.getAttribute('data-year') || '';
        const matchedText = words.every(function(word) { return text.indexOf(word) !== -1; });
        const matchedYear = !yearValue || cardYear === yearValue;
        const show = matchedText && matchedYear;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    };
    if (input) input.addEventListener('input', apply);
    if (year) year.addEventListener('change', apply);
    apply();
  });
}

function initStaticPlayer(sourceUrl) {
  const video = document.getElementById('movieVideo');
  const start = document.getElementById('playerStart');
  if (!video || !sourceUrl) return;
  let loaded = false;
  const loadVideo = function() {
    if (loaded) return;
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  };
  const playVideo = function() {
    loadVideo();
    if (start) start.classList.add('is-hidden');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {});
    }
  };
  if (start) start.addEventListener('click', playVideo);
  video.addEventListener('click', function() {
    if (!loaded) playVideo();
  });
  video.addEventListener('play', function() {
    if (start) start.classList.add('is-hidden');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initHeroCarousel();
  initMobileNav();
  initFilters();
});
