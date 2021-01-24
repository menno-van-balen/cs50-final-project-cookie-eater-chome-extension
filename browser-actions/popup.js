// addEventListeners for popup page
document.getElementById("add").addEventListener("click", () => {
  chrome.runtime.sendMessage("add");
  document.getElementById("status").textContent =
    "Domain added to your whitelist.";
  setTimeout(() => {
    window.close();
  }, 1000);
});

document.getElementById("options").addEventListener("click", () => {
  window.close();
  chrome.runtime.openOptionsPage();
});
