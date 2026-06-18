(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileNav() {
    var toggle = qs("[data-mobile-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initGlobalSearch() {
    var root = document.body.getAttribute("data-root") || "";
    qsa("[data-global-search]").forEach(function (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") {
          return;
        }
        var query = input.value.trim();
        if (query) {
          window.location.href = root + "all.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFiltering() {
    var cards = qsa("[data-movie-card]");
    if (!cards.length) {
      return;
    }
    var searchInput = qs("[data-list-search]");
    var emptyState = qs("[data-empty-state]");
    var activeType = "all";
    var params = new URLSearchParams(window.location.search);
    var startQuery = params.get("q") || "";

    if (searchInput && startQuery) {
      searchInput.value = startQuery;
    }

    function matchesType(card) {
      if (activeType === "all") {
        return true;
      }
      var type = card.getAttribute("data-type") || "";
      if (activeType === "剧") {
        return type.indexOf("剧") !== -1;
      }
      return type.indexOf(activeType) !== -1;
    }

    function apply() {
      var query = normalize(searchInput ? searchInput.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var ok = matchesType(card) && (!query || haystack.indexOf(query) !== -1);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    qsa("[data-filter-type]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeType = button.getAttribute("data-filter-type") || "all";
        qsa("[data-filter-type]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }
    apply();
  }

  function initBackTop() {
    var button = qs("[data-back-top]");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 500);
    }, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initGlobalSearch();
    initHero();
    initFiltering();
    initBackTop();
  });
})();
