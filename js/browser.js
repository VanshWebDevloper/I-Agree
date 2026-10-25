const toolbar = document.querySelectorAll(".toolbar-button");

if (toolbar[0]) {
  toolbar[0].addEventListener("click", () => history.back());
}

if (toolbar[1]) {
  toolbar[1].addEventListener("click", () => history.forward());
}
