const KEY = "yearone-open";
const gate = document.currentScript && document.currentScript.getAttribute("data-gate");

if (sessionStorage.getItem(KEY) !== "1") {
  location.replace(gate || "index.html");
}
