const KEY = "yearone-open";
const ACCEPT = String.fromCharCode(114, 97, 119, 97, 110);

const form = document.querySelector("#gate-form");
const input = document.querySelector("#answer");
const feedback = document.querySelector("#feedback");
const continueLink = document.querySelector("[data-continue]");

if (sessionStorage.getItem(KEY) === "1" && continueLink) {
  continueLink.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const given = input.value.trim().toLowerCase();

  if (given === ACCEPT) {
    sessionStorage.setItem(KEY, "1");
    feedback.hidden = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      location.href = "anniversary.html";
      return;
    }
    document.body.classList.add("is-opening");
    window.setTimeout(() => {
      location.href = "anniversary.html";
    }, 460);
    return;
  }

  feedback.hidden = false;
  feedback.textContent = "Not that one.";
  input.classList.remove("is-wrong");
  void input.offsetWidth;
  input.classList.add("is-wrong");
  input.select();
});
