(function () {
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    var current = 0;
    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector("[data-filter-panel]");
  var filterGrid = document.querySelector("[data-filter-grid]");
  if (filterPanel && filterGrid) {
    var keyword = filterPanel.querySelector("[data-filter-keyword]");
    var region = filterPanel.querySelector("[data-filter-region]");
    var type = filterPanel.querySelector("[data-filter-type]");
    var year = filterPanel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (keyword && initialQuery) {
      keyword.value = initialQuery;
    }

    var normalize = function (value) {
      return (value || "").toString().trim().toLowerCase();
    };

    var applyFilters = function () {
      var key = normalize(keyword && keyword.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var ok = true;

        if (key && haystack.indexOf(key) === -1) {
          ok = false;
        }
        if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1) {
          ok = false;
        }
        if (typeValue && normalize(card.dataset.type) !== typeValue) {
          ok = false;
        }
        if (yearValue && normalize(card.dataset.year) !== yearValue) {
          ok = false;
        }

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    [keyword, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var hlsInstance = null;
    var started = false;

    if (!video || !button) {
      return;
    }

    var startPlayback = function () {
      var streamUrl = video.getAttribute("data-stream");
      if (!streamUrl) {
        return;
      }

      button.classList.add("is-hidden");

      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else {
          video.src = streamUrl;
        }
      }

      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    };

    button.addEventListener("click", startPlayback);
    player.addEventListener("click", function (event) {
      if (event.target === player) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
