const lock = document.querySelector("[data-lock]");

if (lock) {
  lock.addEventListener("click", () => {
    sessionStorage.removeItem("rawandrew-open");
    location.href = "index.html";
  });
}
