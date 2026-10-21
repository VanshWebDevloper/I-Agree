
const agreeButton = document.getElementById("i-agree");
const disagreeButton = document.getElementById("disagree");
const agreementCheck = document.getElementById("agreement-check");

agreeButton.addEventListener("click", () => {
  if (!agreementCheck.checked) {
    alert("Please read and accept the agreement first.");
    return;
  }

  window.location.href = "chatterBot.html";
});

disagreeButton.addEventListener("click", () => {
  alert("ERROR 403: Disagreement is not supported by SoftO Chatbot.");
});
