(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 6500);
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-button]"));
            var target = document.querySelector(panel.getAttribute("data-filter-panel"));

            if (!target) {
                return;
            }

            var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
            var empty = target.parentElement.querySelector(".empty-state");
            var selected = "all";

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var shown = 0;

                cards.forEach(function (card) {
                    var matchesQuery = !query || (card.getAttribute("data-search") || "").indexOf(query) !== -1;
                    var matchesFilter = selected === "all" || card.getAttribute("data-type") === selected || card.getAttribute("data-year") === selected;
                    var visible = matchesQuery && matchesFilter;

                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.style.display = shown ? "none" : "block";
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    selected = button.getAttribute("data-filter-button") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    applyFilter();
                });
            });
        });
    });
})();
