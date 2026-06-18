const body = document.body;
const root = body.dataset.root || "";

function initHeader() {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-mobile-toggle]");

    if (header) {
        const update = () => {
            header.classList.toggle("is-scrolled", window.scrollY > 20);
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    if (toggle) {
        toggle.addEventListener("click", () => {
            body.classList.toggle("menu-open");
        });
    }
}

function initSiteSearch() {
    document.querySelectorAll("[data-site-search]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const query = input ? input.value.trim() : "";
            const target = `${root}search.html${query ? `?q=${encodeURIComponent(query)}` : ""}`;
            window.location.href = target;
        });
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const setSlide = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    };

    const restart = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => setSlide(index + 1), 5500);
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => {
            setSlide(dotIndex);
            restart();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            setSlide(index - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            setSlide(index + 1);
            restart();
        });
    }

    setSlide(0);
    restart();
}

function initFilters() {
    const grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const input = document.querySelector("[data-filter-input]");
    const selects = Array.from(document.querySelectorAll("[data-filter-select]"));
    const reset = document.querySelector("[data-filter-reset]");
    const count = document.querySelector("[data-result-count]");
    const params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
        input.value = params.get("q");
    }

    const apply = () => {
        const keyword = input ? input.value.trim().toLowerCase() : "";
        const selected = Object.fromEntries(
            selects.map((select) => [select.dataset.filterSelect, select.value])
        );
        let visible = 0;

        cards.forEach((card) => {
            const text = card.dataset.keywords || "";
            const matchKeyword = !keyword || text.includes(keyword);
            const matchSelects = Object.entries(selected).every(([key, value]) => {
                return !value || (card.dataset[key] || "") === value;
            });
            const show = matchKeyword && matchSelects;
            card.classList.toggle("is-hidden", !show);
            if (show) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = String(visible);
        }
    };

    if (input) {
        input.addEventListener("input", apply);
    }

    selects.forEach((select) => {
        const paramValue = params.get(select.dataset.filterSelect || "");
        if (paramValue) {
            select.value = paramValue;
        }
        select.addEventListener("change", apply);
    });

    if (reset) {
        reset.addEventListener("click", () => {
            if (input) {
                input.value = "";
            }
            selects.forEach((select) => {
                select.value = "";
            });
            apply();
        });
    }

    apply();
}

function initImageFallbacks() {
    document.querySelectorAll("img[data-img-fallback]").forEach((image) => {
        image.addEventListener("error", () => {
            image.style.opacity = "0";
            image.setAttribute("aria-hidden", "true");
        }, { once: true });
    });
}

async function initPlayers() {
    const videos = Array.from(document.querySelectorAll("video[data-hls-src]"));
    if (!videos.length) {
        return;
    }

    let Hls = null;
    try {
        const module = await import("./hls-dru42stk.js");
        Hls = module.H;
    } catch (error) {
        console.warn("HLS library failed to load", error);
    }

    videos.forEach((video) => {
        const src = video.dataset.hlsSrc;
        if (!src) {
            return;
        }

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        }

        const shell = video.closest(".video-shell");
        const markPlaying = () => shell && shell.classList.add("is-playing");
        const markPaused = () => shell && shell.classList.remove("is-playing");

        video.addEventListener("play", markPlaying);
        video.addEventListener("pause", markPaused);
        video.addEventListener("ended", markPaused);
    });

    document.querySelectorAll("[data-play-now]").forEach((button) => {
        button.addEventListener("click", async () => {
            const video = document.querySelector("video[data-hls-src]");
            if (!video) {
                return;
            }
            const player = document.getElementById("player");
            if (player) {
                player.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            try {
                video.muted = false;
                await video.play();
            } catch (error) {
                console.warn("Video play was blocked by the browser", error);
            }
        });
    });
}

initHeader();
initSiteSearch();
initHero();
initFilters();
initImageFallbacks();
initPlayers();
