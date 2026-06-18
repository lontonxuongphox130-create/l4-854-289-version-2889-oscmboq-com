(function () {
  function setupPlayer(wrapper) {
    var frame = wrapper.querySelector(".player-frame");
    var video = wrapper.querySelector("[data-player]");
    var center = wrapper.querySelector("[data-play]");
    var playToggle = wrapper.querySelector("[data-play-toggle]");
    var muteToggle = wrapper.querySelector("[data-mute-toggle]");
    var fullscreen = wrapper.querySelector("[data-fullscreen]");
    var status = wrapper.querySelector("[data-player-status]");
    var streamUrl = video ? video.getAttribute("src") : "";
    var prepared = false;
    var preparing = null;
    var hls = null;

    if (!frame || !video || !streamUrl) {
      return;
    }

    function setStatus(text, hidden) {
      if (!status) {
        return;
      }
      status.textContent = text;
      status.classList.toggle("is-hidden", Boolean(hidden));
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      if (preparing) {
        return preparing;
      }
      preparing = new Promise(function (resolve) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          prepared = true;
          setStatus("", true);
          resolve();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          video.removeAttribute("src");
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            prepared = true;
            setStatus("", true);
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放遇到问题，请稍后重试", false);
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              }
            }
          });
          return;
        }
        setStatus("播放遇到问题，请稍后重试", false);
        resolve();
      });
      return preparing;
    }

    function refresh() {
      frame.classList.toggle("is-playing", !video.paused && !video.ended);
      if (playToggle) {
        playToggle.textContent = video.paused ? "▶" : "暂停";
      }
      if (muteToggle) {
        muteToggle.textContent = video.muted ? "静音" : "音量";
      }
    }

    function togglePlay() {
      prepare().then(function () {
        if (video.paused) {
          var result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(function () {
              setStatus("点击播放", false);
            });
          }
        } else {
          video.pause();
        }
      });
    }

    center.addEventListener("click", togglePlay);
    video.addEventListener("click", togglePlay);
    if (playToggle) {
      playToggle.addEventListener("click", togglePlay);
    }
    if (muteToggle) {
      muteToggle.addEventListener("click", function () {
        video.muted = !video.muted;
        refresh();
      });
    }
    if (fullscreen) {
      fullscreen.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (frame.requestFullscreen) {
          frame.requestFullscreen();
        }
      });
    }
    video.addEventListener("play", refresh);
    video.addEventListener("pause", refresh);
    video.addEventListener("ended", refresh);
    video.addEventListener("canplay", function () {
      setStatus("", true);
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
    refresh();
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player-wrap]")).forEach(setupPlayer);
  });
})();
