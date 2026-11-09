// PWA installation support for Android/desktop browsers and iPhone guidance.
let pncInstallPrompt = null;
const pncInstallArea = document.getElementById("pwa-install-area");

function pncShowInstallButton() {
  if (!pncInstallArea || document.getElementById("pnc-install-button")) return;
  const button = document.createElement("button");
  button.id = "pnc-install-button";
  button.type = "button";
  button.textContent = "⬇ Install PNC Hub";
  button.setAttribute("aria-label", "Install PNC Hub on this device");
  button.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:9998;border:0;border-radius:999px;padding:13px 18px;background:#4f46e5;color:#fff;font-weight:700;box-shadow:0 8px 25px #0003;cursor:pointer;font:600 14px Arial,sans-serif";
  button.addEventListener("click", async () => {
    if (pncInstallPrompt) {
      pncInstallPrompt.prompt();
      await pncInstallPrompt.userChoice;
      pncInstallPrompt = null;
      button.remove();
    } else {
      alert("To install PNC Hub on iPhone: open this website in Safari, tap the Share button, choose ‘Add to Home Screen’, then tap ‘Add’. On Android, open the browser menu and choose ‘Install app’ or ‘Add to Home screen’.");
    }
  });
  pncInstallArea.appendChild(button);
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  pncInstallPrompt = event;
  pncShowInstallButton();
});

window.addEventListener("appinstalled", () => {
  document.getElementById("pnc-install-button")?.remove();
  pncInstallPrompt = null;
});

const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
if (!isStandalone && isIOS) pncShowInstallButton();

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.error("PNC Hub offline support could not be enabled:", error);
    });
  });
}
