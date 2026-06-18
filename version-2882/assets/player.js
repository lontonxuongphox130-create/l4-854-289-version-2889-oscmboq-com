(function () {
    window.initMoviePlayer = function (url) {
        var video = document.getElementById("videoPlayer");
        var overlay = document.getElementById("playOverlay");
        var hlsInstance = null;
        var prepared = false;

        if (!video || !overlay || !url) {
            return;
        }

        function attach() {
            if (prepared) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }

            prepared = true;
        }

        function start() {
            attach();
            overlay.classList.add("is-hidden");
            video.controls = true;
            var result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!prepared || video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
