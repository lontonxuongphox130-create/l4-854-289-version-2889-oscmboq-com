(function () {
  var video = document.querySelector('[data-video-player]');
  if (!video) {
    return;
  }
  var button = document.querySelector('[data-play-button]');
  var source = video.getAttribute('data-play-url');
  var hls = null;
  var loaded = false;

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function loadVideo() {
    if (loaded || !source) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = source;
    }
  }

  function startVideo() {
    loadVideo();
    hideButton();
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', startVideo);
  }
  video.addEventListener('click', loadVideo, { once: true });
  video.addEventListener('play', hideButton);
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
