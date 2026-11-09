# PNC Student & Teacher Hub 2026–2027 — Analytics Edition

A responsive frontend demonstration built with **HTML5, CSS3, and Vanilla JavaScript**.

## Run locally
1. Extract the ZIP archive.
2. Open the `pnc-hub-analytics` folder in Visual Studio Code.
3. Open `index.html` with Live Server, or open it directly in a modern browser.

## Dashboard analytics
- Weekly study activity chart calculated from saved study tasks.
- Student year distribution donut using clearly labelled sample figures.
- Club category chart calculated from the 16 sample clubs.
- Room booking request summary calculated from saved booking requests.
- Daily schedule, latest announcements, upcoming activities, and quick actions.

Charts are built with native SVG and CSS. No chart framework is required.

## Project structure
```text
pnc-hub-analytics/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── app.js
└── assets/
    └── images/
```

## Important demo limitations
- Data is stored in the browser's LocalStorage; it is not synchronized between users or devices.
- Login and role selection are demonstrations, not secure authentication.
- Student totals (500+, 250+, 250+) are placeholders, not official PNC statistics.
- Club leaders, meeting room details, events, and rental listings are sample data and should be confirmed before real use.
- A production deployment needs a secure backend, database, account verification, and server-side access controls.

## Beginner notes
- `index.html` loads the CSS and JavaScript files.
- `css/style.css` contains the visual theme, responsive layout, and dashboard chart styles.
- `js/app.js` contains the demo data, navigation, LocalStorage helpers, page rendering, and chart calculations.


## Install on Android and iPhone (PWA)
This project includes a Progressive Web App (PWA) manifest, app icons, a service worker, and an install helper. It can be added to a phone's home screen after it is deployed to an HTTPS website.

### Deploy first
1. Upload the complete project folder to an HTTPS host (for example, AWS or Cloudflare Pages).
2. Keep the folder structure and file names unchanged.
3. Open the deployed website on a phone.

### Android
1. Open the website in Chrome.
2. Tap **Install PNC Hub** if the button appears, or open Chrome's menu and choose **Install app** / **Add to Home screen**.
3. Confirm installation.

### iPhone
1. Open the website in **Safari**.
2. Tap **Share**.
3. Choose **Add to Home Screen**.
4. Tap **Add**.

### Test on your computer
Use VS Code Live Server or another localhost server. Service workers do not work reliably when opening the HTML file directly using `file://`.

### Offline and data notes
- The service worker caches the main app shell and same-origin GET resources. The cached interface can open offline after the first successful online visit.
- Google Fonts and other third-party resources may not be available offline.
- LocalStorage data remains on the individual device/browser; it is not shared between students or teachers and may not synchronize across devices.
- Offline form submissions are not synchronized to a server. This is a frontend demonstration, not a production multi-user system.
- To publish updates, upload the new files. The service worker uses a versioned cache and replaces the previous cache when it activates.
