(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function bindMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        setSlide(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function bindFilters() {
    var bars = document.querySelectorAll("[data-filter-bar]");
    bars.forEach(function (bar) {
      var scope = bar.closest("[data-filter-scope]") || document;
      var keyword = bar.querySelector("[data-filter-keyword]");
      var year = bar.querySelector("[data-filter-year]");
      var region = bar.querySelector("[data-filter-region]");
      var type = bar.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-filter-empty]");

      function apply() {
        var key = keyword ? keyword.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;

          if (key && text.indexOf(key) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && keyword) {
        keyword.value = q;
      }
      apply();
    });
  }

  ready(function () {
    bindMobileMenu();
    bindSearchForms();
    bindHero();
    bindFilters();
  });
})();
