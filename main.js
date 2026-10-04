const startButton = document.querySelector("#blink");
const intro = document.querySelector("#intro");
const storylines = document.querySelectorAll(".storyline");

startButton.onclick = function() {
  startButton.style.animation = "none";
  startButton.style.opacity = "0";

  setTimeout(() => {
    startButton.style.display = "none";
    intro.style.opacity = "1";
    intro.style.pointerEvents = "auto";

    storylines.forEach((line, index) => {
      setTimeout(() => {
        line.style.opacity = "1";
      }, index * 1800);
    });
  }, 1500);
};