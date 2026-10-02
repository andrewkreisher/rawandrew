const lock = document.querySelector("[data-lock]");

if (lock) {
  lock.addEventListener("click", () => {
    sessionStorage.removeItem("yearone-open");
    location.href = "index.html";
  });
}
