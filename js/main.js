const startButton = document.querySelector("#blink");
const story = document.querySelector("#story");
const intro = document.querySelector("#intro");
const storylines = document.querySelectorAll(".storyline");
const music = document.querySelector("#music");

startButton.onclick = function() {
  music.volume = 0.2;
  music.loop = true;
  music.play();

  startButton.style.animation = "none";
  startButton.style.opacity = "0";

  setTimeout(() => {
    startButton.style.display = "none";
    showStory(0);
  }, 1500);
};

function showStory(index) {
  if (index >= storylines.length) {
    story.style.opacity = "0";

    setTimeout(() => {
      story.style.display = "none";
      intro.style.opacity = "1";
      intro.style.pointerEvents = "auto";
    }, 1500);

    return;
  }

  const line = storylines[index];

  line.style.opacity = "1";

  setTimeout(() => {
    line.style.opacity = "0";

    setTimeout(() => {
      showStory(index + 1);
    }, 1500);

  }, 2500);
}