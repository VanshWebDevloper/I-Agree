const fullscreenButton = document.querySelector("#fullscreen-btn");

fullscreenButton.onclick = function() {

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }

};