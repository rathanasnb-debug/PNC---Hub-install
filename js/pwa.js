// PWA installation support for Android/desktop browsers and iPhone guidance.
let pncInstallPrompt = null;
const pncInstallArea = document.getElementById("pwa-install-area");
const pncIsIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

function pncShowInstallMessage(message) {
  if (!pncInstallArea) return;
  let status = document.getElementById("pnc-install-status");
  if (!status) {
    status = document.createElement("div");
    status.id = "pnc-install-status";
    status.setAttribute("role", "status");
    status.style.cssText = "position:fixed;right:18px;bottom:78px;z-index:9998;max-width:min(360px,calc(100vw - 36px));padding:14px 16px;border:1px solid #d9e3ec;border-radius:14px;background:#fff;color:#142b3b;box-shadow:0 8px 25px #0003;font:14px/1.5 system-ui,sans-serif";
    pncInstallArea.appendChild(status);
  }
  status.textContent = message;
}

function pncShowInstallButton() {
  if (!pncInstallArea || document.getElementById("pnc-install-button")) return;
  const button = document.createElement("button");
  button.id = "pnc-install-button";
  button.type = "button";
  button.textContent = "⬇ Install PNC Hub";
  button.setAttribute("aria-label", "Install PNC Hub on this device");
  button.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:9998;border:0;border-radius:999px;padding:13px 18px;background:#126f8a;color:#fff;font-weight:700;box-shadow:0 8px 25px #0003;cursor:pointer;font:600 14px Arial,sans-serif";
  button.addEventListener("click", async () => {
    if (pncInstallPrompt) {
      const promptEvent = pncInstallPrompt;
      pncInstallPrompt = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          button.remove();
          pncShowInstallMessage("PNC Hub is installed. Find its icon on your phone’s home screen and tap it to open the app.");
        } else {
          pncShowInstallMessage("Installation was cancelled. Tap Install PNC Hub to try again.");
        }
      } catch (error) {
        console.error("PNC Hub could not start installation:", error);
        pncShowInstallMessage("The install prompt could not be opened. Use your browser menu to install or add PNC Hub to your home screen.");
      }
    } else {
      pncShowInstallMessage(pncIsIOS
        ? "To install on iPhone: open this page in Safari, tap Share, choose Add to Home Screen, then tap Add. Afterward, tap the PNC Hub icon on your home screen to open the app."
        : "To install PNC Hub: open your browser menu and choose Install app or Add to Home screen. After installation, tap the PNC Hub icon on your home screen to open the app.");
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
  pncShowInstallMessage("PNC Hub is installed. Find its icon on your phone’s home screen and tap it to open the app.");
});

const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
if (!isStandalone) pncShowInstallButton();

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.error("PNC Hub offline support could not be enabled:", error);
    });
  });
}
