(function () {
  const toggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('.hero-carousel');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    const prev = carousel.querySelector('.hero-prev');
    const next = carousel.querySelector('.hero-next');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const slideIndex = Number(dot.getAttribute('data-slide')) || 0;
        showSlide(slideIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  function setupFiltering() {
    const searchInput = document.querySelector('.page-search');
    const cards = Array.from(document.querySelectorAll('.filterable-list .movie-card'));
    const chips = Array.from(document.querySelectorAll('.filter-chip'));
    let activeKey = 'all';
    let activeValue = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      const term = normalize(searchInput ? searchInput.value : '');

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category,
          card.dataset.tags
        ].join(' '));
        const matchesSearch = !term || text.includes(term);
        const field = activeKey === 'all' ? '' : normalize(card.dataset[activeKey]);
        const matchesChip = activeKey === 'all' || field.includes(normalize(activeValue));

        card.classList.toggle('is-hidden-by-filter', !(matchesSearch && matchesChip));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });

        chip.classList.add('is-active');
        activeKey = chip.getAttribute('data-filter-key') || 'all';
        activeValue = chip.getAttribute('data-filter-value') || 'all';
        applyFilter();
      });
    });

    applyFilter();
  }

  setupFiltering();
})();

function applyInitialSearch() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const input = document.querySelector('.page-search');

  if (query && input) {
    input.value = query;
    input.dispatchEvent(new Event('input'));
  }
}

function initMoviePlayer(source) {
  const video = document.getElementById('movie-player');
  const cover = document.getElementById('play-cover');
  let attached = false;
  let hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      video.play().catch(function () {});
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    video.addEventListener('loadedmetadata', function () {
      video.play().catch(function () {});
    }, { once: true });

    video.load();
    video.play().catch(function () {});
  }

  function startPlayback() {
    if (cover) {
      cover.classList.add('is-hidden');
    }

    attachSource();
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
