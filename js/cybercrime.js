const proof = document.querySelector("#proof");
const preview = document.querySelector("#preview");

proof.addEventListener("change", () => {
preview.replaceChildren();

Array.from(proof.files).slice(0, 5).forEach(file => {
if (!file.type.startsWith("image/")) return;

const img = document.createElement("img");
img.src = URL.createObjectURL(file);
img.alt = file.name;
preview.appendChild(img);

});
});

document.querySelector("#report").addEventListener("submit", event => {
event.preventDefault();
document.querySelector("#message").textContent =
"Report submitted successfully!";
});

document.querySelector("#job-form").addEventListener("submit", event => {
event.preventDefault();
document.querySelector("#job-message").textContent =
"Application submitted successfully!";
});