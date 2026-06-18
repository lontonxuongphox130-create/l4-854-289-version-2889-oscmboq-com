(function () {
  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function attachStream(video, sourceUrl, startAfterAttach) {
    if (video.dataset.ready === sourceUrl) {
      if (startAfterAttach) {
        video.play().catch(function () {});
      }
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.dataset.ready = sourceUrl;
      if (startAfterAttach) {
        video.play().catch(function () {});
      }
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (video._hlsPlayer) {
          video._hlsPlayer.destroy();
        }
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        video._hlsPlayer = hls;
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.dataset.ready = sourceUrl;
          if (startAfterAttach) {
            video.play().catch(function () {});
          }
        });
      } else {
        video.src = sourceUrl;
        video.dataset.ready = sourceUrl;
        if (startAfterAttach) {
          video.play().catch(function () {});
        }
      }
    });
  }

  window.setupMoviePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function start() {
      overlay.classList.add("is-hidden");
      video.controls = true;
      attachStream(video, sourceUrl, true);
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
  };
})();
