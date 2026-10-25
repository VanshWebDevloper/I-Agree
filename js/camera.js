const folderWindow = document.getElementById("folderWindow");
const photoGrid = document.getElementById("photoGrid");
const viewer = document.getElementById("viewer");
const fullImage = document.getElementById("fullImage");
const imageName = document.getElementById("imageName");

const closeViewer = document.getElementById("closeViewer");
const cancelDelete = document.getElementById("cancelDelete");
const deletePhoto = document.getElementById("deletePhoto");

let selectedPhoto = null;

const STORAGE_KEY = "cameraDeletedImages";

function getDeletedImages() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function closePhotoViewer() {
  viewer.style.display = "none";
  fullImage.src = "";
  selectedPhoto = null;
}

function openPhoto(photo) {
  if (!photo || !photo.isConnected) return;

  selectedPhoto = photo;
  fullImage.src = photo.dataset.image;
  imageName.textContent =
    photo.querySelector("span").textContent;

  viewer.style.display = "flex";
}

function restoreDeletedPhotos() {
  const deletedImages = getDeletedImages();

  document.querySelectorAll(".photo").forEach(photo => {
    if (deletedImages.includes(photo.dataset.image)) {
      photo.remove();
    }
  });
}

function deleteSelectedPhoto() {
  if (!selectedPhoto || !selectedPhoto.isConnected) return;

  const imagePath = selectedPhoto.dataset.image;

  const deletedImages = getDeletedImages();

  if (!deletedImages.includes(imagePath)) {
    deletedImages.push(imagePath);
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(deletedImages)
    );
  } catch (error) {
    console.error("Could not save deleted photos:", error);
  }

  selectedPhoto.remove();
  closePhotoViewer();

  window.parent.postMessage(
    { type: "softo:camera-deleted" },
    "*"
  );
}

restoreDeletedPhotos();

photoGrid.addEventListener("click", event => {
  const photo = event.target.closest(".photo");

  if (photo) {
    openPhoto(photo);
  }
});

closeViewer.addEventListener("click", closePhotoViewer);
cancelDelete.addEventListener("click", closePhotoViewer);

deletePhoto.addEventListener("click", deleteSelectedPhoto);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && viewer.style.display === "flex") {
    closePhotoViewer();
  }
});
