// The form page and its result screen. Server-rendered, no client JS: it has to
// work inside the in-app WebView on every phone in school.
//
// The visual language follows the app's own design guidelines (lgka-ios/designguidelines):
// inset-grouped sections on a grouped background, system font, the app spacing
// scale, and the accent (#3770D4) only on the primary action and the icon square.

const STYLE = `
:root {
  color-scheme: light dark;
  /* light — matches .systemGroupedBackground / .secondarySystemGroupedBackground */
  --bg: #f2f2f7;
  --surface: #ffffff;
  --text: #1a1a1a;
  --secondary: #6b6b6b;
  --tertiary: #8e8e93;
  --separator: rgba(60, 60, 67, 0.16);
  --field: #f2f2f7;
  --field-border: rgba(60, 60, 67, 0.14);
  --accent: #3770d4;
  --accent-soft: rgba(55, 112, 212, 0.12);
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  --gutter: 16px;
  --radius: 14px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #000000;
    --surface: #1c1c1e;
    --text: #ffffff;
    --secondary: rgba(235, 235, 245, 0.68);
    --tertiary: rgba(235, 235, 245, 0.45);
    --separator: rgba(84, 84, 88, 0.6);
    --field: rgba(118, 118, 128, 0.18);
    --field-border: transparent;
    --accent: #4b83e4;
    --accent-soft: rgba(75, 131, 228, 0.18);
    --shadow: none;
  }
}

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  padding:
    calc(env(safe-area-inset-top) + 28px)
    calc(env(safe-area-inset-right) + var(--gutter))
    calc(env(safe-area-inset-bottom) + 48px)
    calc(env(safe-area-inset-left) + var(--gutter));
  background: var(--bg);
  color: var(--text);
  font: 17px/1.45 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior-y: contain;
}
main { max-width: 580px; margin: 0 auto; }

/* ---- header: app icon + title, like a large-title nav bar ---- */
header { text-align: center; margin-bottom: 28px; }
.logo {
  width: 72px; height: 72px;
  border-radius: 17px;             /* iOS squircle proportion, 22.37% */
  display: block; margin: 0 auto 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
h1 {
  font-size: 28px; font-weight: 700; line-height: 1.2;
  letter-spacing: -0.02em; margin: 0 0 8px;
}
.lede { color: var(--secondary); font-size: 15px; margin: 0 auto; max-width: 42ch; }

/* ---- inset grouped sections ---- */
section { margin-bottom: 26px; }
.section-title {
  font-size: 13px; font-weight: 600; letter-spacing: 0.02em;
  text-transform: uppercase; color: var(--tertiary);
  margin: 0 0 8px; padding: 0 16px;
}
.card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.field { padding: 14px 16px; }
.field + .field { border-top: 0.5px solid var(--separator); }
.split { display: grid; grid-template-columns: 1fr 1fr; }
.split > .field + .field { border-top: 0; border-left: 0.5px solid var(--separator); }
/* the two narrow columns get tighter padding so the select label never clips */
.split .field { padding-left: 12px; padding-right: 12px; }
.split input, .split select { font-size: 16px; padding-left: 10px; padding-right: 10px; }
.split select { padding-right: 30px; background-position: right 10px center; }

label { display: block; font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.req { color: var(--accent); font-weight: 700; }
.legend { font-size: 13px; color: var(--tertiary); margin: 0 0 10px; padding: 0 16px; }
.hint { font-size: 13px; line-height: 1.4; color: var(--secondary); margin: 0 0 10px; }

input, textarea, select {
  width: 100%;
  min-height: 44px;                /* HIG minimum hit target */
  padding: 11px 12px;
  font: inherit; font-size: 17px;
  color: var(--text);
  background: var(--field);
  border: 1px solid var(--field-border);
  border-radius: 10px;
  appearance: none;
}
textarea { min-height: 132px; resize: vertical; line-height: 1.45; }
::placeholder { color: var(--tertiary); }
input:focus-visible, textarea:focus-visible, select:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 1px;
  border-color: transparent;
}
input[type="file"] {
  padding: 9px 12px;
  font-size: 15px;
  color: var(--secondary);
  cursor: pointer;
}
input[type="file"]::file-selector-button {
  font: 600 15px/1 inherit;
  color: var(--accent);
  background: var(--accent-soft);
  border: 0; border-radius: 8px;
  padding: 9px 14px; margin-right: 12px;
  cursor: pointer;
}
input[type="file"]::file-selector-button:hover { opacity: 0.85; }

select {
  padding-right: 34px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5l5-5' fill='none' stroke='%238e8e93' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
}

/* ---- the contact section's icon square (accent at 12%, app pattern) ---- */
.callout { display: flex; gap: 14px; align-items: flex-start; padding: 16px; }
.icon-square {
  flex: 0 0 auto; width: 44px; height: 44px; border-radius: 11px;
  background: var(--accent-soft);
  display: grid; place-items: center;
}
.icon-square svg { width: 22px; height: 22px; stroke: var(--accent); }
.callout p { margin: 0; font-size: 14px; line-height: 1.45; color: var(--secondary); }

/* the Instagram shortcut above the form — a tappable card row */
.link-row {
  display: flex; gap: 14px; align-items: center;
  background: var(--surface); border-radius: var(--radius);
  box-shadow: var(--shadow); padding: 14px 16px;
  margin: 0 0 26px; text-decoration: none; color: inherit;
  transition: opacity 0.15s ease, transform 0.08s ease;
}
.link-row:hover { opacity: 0.92; }
.link-row:active { transform: scale(0.99); }
.link-row .text { flex: 1; min-width: 0; }
.link-row .text b { display: block; font-size: 15px; font-weight: 600; }
.link-row .text span { font-size: 13px; color: var(--secondary); }
.link-row .chev { flex: 0 0 auto; color: var(--tertiary); }
.callout strong { color: var(--text); font-weight: 600; }

button {
  width: 100%; min-height: 50px;
  padding: 14px 20px;
  font: 600 17px/1.2 inherit;
  color: #ffffff; background: var(--accent);
  border: 0; border-radius: var(--radius);
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.08s ease;
}
button:hover { opacity: 0.92; }
button:active { transform: scale(0.985); opacity: 0.85; }

.footnote {
  font-size: 13px; line-height: 1.45; color: var(--tertiary);
  text-align: center; margin: 16px auto 0; max-width: 40ch;
}
.honey { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.banner {
  display: flex; gap: 10px; align-items: center;
  background: var(--surface); border-left: 3px solid #e5484d;
  border-radius: 10px; padding: 12px 14px; margin-bottom: 20px;
  font-size: 15px; box-shadow: var(--shadow);
}

/* ---- tablet and desktop: more air, wider measure, hover affordances ---- */
@media (min-width: 700px) {
  :root { --gutter: 32px; --radius: 18px; }
  body { padding-top: 64px; padding-bottom: 80px; }
  main { max-width: 640px; }
  header { margin-bottom: 40px; }
  .logo { width: 88px; height: 88px; border-radius: 20px; }
  h1 { font-size: 36px; }
  .lede { font-size: 17px; }
  .field { padding: 18px 20px; }
  .callout { padding: 20px; }
  section { margin-bottom: 32px; }
  input:hover, textarea:hover, select:hover { border-color: var(--accent); }
}
@media (min-width: 1100px) {
  main { max-width: 680px; }
  h1 { font-size: 40px; }
}
/* on a black background the icon's own black corners disappear, so it gets a hairline ring */
@media (prefers-color-scheme: dark) {
  .logo { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 10px 30px rgba(55, 112, 212, 0.2); }
}
@media (prefers-reduced-motion: reduce) {
  button { transition: none; }
}

/* ---- confirmation screen ---- */
.done-mark {
  width: 76px; height: 76px; border-radius: 50%;
  background: var(--accent-soft); display: grid; place-items: center;
  margin: 0 auto 20px;
}
.done-mark svg { width: 38px; height: 38px; stroke: var(--accent); }
`;

const shell = (title: string, body: string) => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#f2f2f7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<title>${title}</title>
<style>${STYLE}</style>
</head>
<body><main>${body}</main></body>
</html>`;

const LOGO = `<img class="logo" src="/logo.png" width="72" height="72" alt="LGKA+">`;

export function formPage(error?: string): string {
  return shell(
    "Fehler melden – LGKA+ App",
    `
<header>
  ${LOGO}
  <h1>Etwas funktioniert nicht?</h1>
  <p class="lede">Danke, dass du dir kurz Zeit nimmst. Ich lese jede Meldung selbst und versuche, den Fehler nachzustellen und zu beheben.</p>
</header>

<a class="link-row" href="https://ig.me/m/lxka76" target="_blank" rel="noopener">
  <span class="icon-square" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/></svg>
  </span>
  <span class="text">
    <b>Lieber kurz schreiben?</b>
    <span>Schreib mir direkt auf Instagram – @lxka76</span>
  </span>
  <svg class="chev" width="9" height="15" viewBox="0 0 9 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m1.5 1.5 6 6-6 6"/></svg>
</a>

${
  error
    ? `<div class="banner" role="alert"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e5484d" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.01"/></svg><span>${error}</span></div>`
    : ""
}

<form method="post" action="/" enctype="multipart/form-data">
  <section>
    <h2 class="section-title">Der Fehler</h2>
    <p class="legend"><span class="req">*</span> Pflichtfeld – alles andere kannst du weglassen.</p>
    <div class="card">
      <div class="field">
        <label for="what">Was ist passiert? <span class="req" aria-hidden="true">*</span></label>
        <p class="hint">Schreib einfach in deinen eigenen Worten, was nicht geklappt hat – und wenn du magst, was du davor gemacht hast und ob es jedes Mal passiert.</p>
        <textarea id="what" name="what" required maxlength="5000"></textarea>
      </div>
      <div class="field">
        <label for="where_in_app">Wo in der App war das?</label>
        <p class="hint">z.&nbsp;B. „Vertretungsplan“ oder „beim Öffnen“.</p>
        <input id="where_in_app" name="where_in_app" maxlength="200" autocomplete="off" enterkeyhint="next">
      </div>
      <div class="split">
        <div class="field">
          <label for="platform">Handy</label>
          <select id="platform" name="platform">
            <option value="">Keine Angabe</option>
            <option value="android">Android</option>
            <option value="ios">iPhone</option>
          </select>
        </div>
        <div class="field">
          <label for="app_version">App-Version</label>
          <input id="app_version" name="app_version" maxlength="40" autocomplete="off" placeholder="z. B. 3.0.0" inputmode="decimal">
        </div>
      </div>
      <div class="field">
        <label for="screenshots">Screenshots</label>
        <p class="hint">Ein Bild sagt mehr als tausend Worte – bis zu 4 Bilder, je max. 8&nbsp;MB.</p>
        <input id="screenshots" name="screenshots" type="file" accept="image/*" multiple>
      </div>
    </div>
  </section>

  <section>
    <h2 class="section-title">Kontakt</h2>
    <div class="card">
      <div class="callout">
        <div class="icon-square" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.3A8.4 8.4 0 1 1 21 11.5Z"/></svg>
        </div>
        <p><strong>Wenn ich dich erreichen kann, hilft mir das sehr.</strong> Oft ist eine kurze Rückfrage („Auf welchem Bildschirm genau?“) der Unterschied zwischen „kann ich beheben“ und „finde ich nie“. Und ich kann dir Bescheid sagen, wenn es behoben ist.</p>
      </div>
      <div class="field">
        <label for="contact">Name und/oder Kontakt</label>
        <p class="hint">E-Mail, Handynummer, Instagram – was dir am liebsten ist.</p>
        <input id="contact" name="contact" maxlength="200" autocomplete="off" placeholder="z. B. Max, @max oder max@example.com" enterkeyhint="send">
      </div>
    </div>
  </section>

  <div class="honey" aria-hidden="true">
    <label for="website">Website</label>
    <input id="website" name="website" tabindex="-1" autocomplete="off">
  </div>

  <button type="submit">Absenden</button>
  <p class="footnote">Gespeichert wird nur, was du hier einträgst und hochlädst – keine IP-Adresse, kein Konto, keine Cookies.</p>
</form>
`,
  );
}

export function thanksPage(): string {
  return shell(
    "Danke! – LGKA+ App",
    `
<header>
  <div class="done-mark" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
  </div>
  <h1>Danke dir!</h1>
  <p class="lede">Deine Meldung ist angekommen.</p>
</header>

<section>
  <div class="card">
    <div class="field">
      <p class="hint" style="margin:0">Ich schaue sie mir an und versuche, den Fehler nachzustellen. Falls du einen Kontakt dagelassen hast, melde ich mich bei Rückfragen – oder wenn es behoben ist.</p>
    </div>
  </div>
</section>

<p class="footnote">Du kannst dieses Fenster jetzt schließen.</p>
`,
  );
}
