const folderWindow = document.getElementById("folderWindow");
const viewer = document.getElementById("viewer");
const fullImage = document.getElementById("fullImage");
const imageName = document.getElementById("imageName");

document.querySelectorAll(".photo").forEach(photo => {
  photo.addEventListener("dblclick", () => {
    fullImage.src = photo.dataset.image;
    imageName.textContent = photo.querySelector("span").textContent;
    viewer.style.display = "flex";
  });
});

document.getElementById("closeViewer").addEventListener("click", () => {
  viewer.style.display = "none";
  fullImage.src = "";
});
