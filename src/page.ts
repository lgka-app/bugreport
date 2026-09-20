// The form page and its result screen. Server-rendered, no client JS: it has to
// work inside the in-app WebView on every phone in school.
//
// The visual language follows the app's own design guidelines (lgka-ios/designguidelines):
// inset-grouped sections on a grouped background, system font, the app spacing
// scale, and the accent (#3770D4) only on the primary action, the icon squares
// and links — never on surfaces or plain text.

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
  --field-hover: rgba(60, 60, 67, 0.26);
  --accent: #3770d4;
  --accent-soft: rgba(55, 112, 212, 0.12);
  --accent-ring: rgba(55, 112, 212, 0.35);
  --danger: #d32f36;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-lift: 0 2px 10px rgba(0, 0, 0, 0.07);
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
    --field-hover: rgba(235, 235, 245, 0.3);
    --accent: #4b83e4;
    --accent-soft: rgba(75, 131, 228, 0.18);
    --accent-ring: rgba(75, 131, 228, 0.45);
    --danger: #ff6169;
    --shadow: none;
    --shadow-lift: none;
  }
}

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  padding:
    calc(env(safe-area-inset-top) + 28px)
    calc(env(safe-area-inset-right) + var(--gutter))
    calc(env(safe-area-inset-bottom) + 28px)
    calc(env(safe-area-inset-left) + var(--gutter));
  background: var(--bg);
  color: var(--text);
  font: 17px/1.45 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior-y: contain;
  overflow-x: hidden;
}
main { max-width: 560px; margin: 0 auto; }
/* the confirmation screen is short — centre it instead of stranding it at the top.
   Browsers without :has() simply keep the top alignment. */
body:has(main.solo) {
  min-height: 100vh; min-height: 100dvh;
  display: flex; flex-direction: column; justify-content: center;
}
body:has(main.solo) > main { width: 100%; }

/* ---- header: app icon + title, like a large-title nav bar ---- */
header { text-align: center; margin-bottom: 26px; }
.logo {
  width: 72px; height: 72px;
  border-radius: 17px;             /* iOS squircle proportion, 22.37% */
  display: block; margin: 0 auto 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
h1 {
  font-size: clamp(26px, 7.5vw, 30px);
  font-weight: 700; line-height: 1.16;
  letter-spacing: -0.021em; margin: 0 0 8px;
  text-wrap: balance;
}
.lede {
  color: var(--secondary); font-size: 15px; line-height: 1.47;
  margin: 0 auto; max-width: 40ch; text-wrap: pretty;
}

/* ---- inset grouped sections ---- */
section { margin: 0 0 24px; }
.section-title {
  font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--tertiary);
  margin: 0 0 7px; padding: 0 16px;
}
.card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.field { padding: 14px 16px; }
.field + .field, .split + .field { border-top: 0.5px solid var(--separator); }
.split { display: grid; grid-template-columns: 1fr 1fr; border-top: 0.5px solid var(--separator); }
.split > .field + .field { border-top: 0; border-left: 0.5px solid var(--separator); }
/* the two narrow columns get tighter padding so the select label never clips */
.split .field { padding-left: 12px; padding-right: 12px; }
.split input, .split select { font-size: 16px; padding-left: 10px; padding-right: 10px; }
.split select { padding-right: 28px; background-position: right 9px center; }
/* below ~380px two side-by-side controls stop fitting — stack them instead */
@media (max-width: 379px) {
  .split { grid-template-columns: 1fr; }
  .split > .field + .field { border-top: 0.5px solid var(--separator); border-left: 0; }
  .split .field { padding-left: 16px; padding-right: 16px; }
}

label { display: block; font-size: 15px; font-weight: 600; letter-spacing: -0.005em; margin-bottom: 3px; }
.req { color: var(--accent); font-weight: 700; }
.legend { font-size: 13px; color: var(--tertiary); margin: 0 0 9px; padding: 0 16px; }
.hint { font-size: 13px; line-height: 1.4; color: var(--secondary); margin: 0 0 9px; }

input, textarea, select {
  width: 100%; max-width: 100%;
  min-height: 44px;                /* HIG minimum hit target */
  padding: 11px 12px;
  font: inherit; font-size: 17px;
  color: var(--text);
  background: var(--field);
  border: 1px solid var(--field-border);
  border-radius: 10px;
  appearance: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}
textarea { min-height: 128px; resize: vertical; line-height: 1.45; display: block; }
::placeholder { color: var(--tertiary); }
input:focus, textarea:focus, select:focus { outline: none; }
input:focus-visible, textarea:focus-visible, select:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-ring);
}
/* :user-invalid only fires once the field has actually been touched or submitted */
input:user-invalid, textarea:user-invalid, select:user-invalid {
  border-color: var(--danger);
}
input:user-invalid:focus-visible, textarea:user-invalid:focus-visible {
  box-shadow: 0 0 0 3px rgba(211, 47, 54, 0.28);
}

/* ---- file input: a quiet dropzone instead of a bare control ---- */
input[type="file"] {
  min-height: 56px;
  display: flex; align-items: center;
  padding: 8px 12px 8px 8px;
  font-size: 14px; line-height: 1.3;
  color: var(--secondary);
  background: transparent;
  border: 1px dashed rgba(60, 60, 67, 0.3);
  cursor: pointer;
}
@media (prefers-color-scheme: dark) {
  input[type="file"] { border-color: rgba(235, 235, 245, 0.3); }
}
input[type="file"]:hover { border-color: var(--accent); background: var(--accent-soft); }
input[type="file"]::file-selector-button {
  font: 600 15px/1.2 inherit;
  color: var(--accent);
  background: var(--accent-soft);
  border: 0; border-radius: 9px;
  min-height: 40px;
  padding: 10px 14px; margin: 0 12px 0 0;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
input[type="file"]::file-selector-button:hover { opacity: 0.8; }

select {
  padding-right: 34px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5l5-5' fill='none' stroke='%238e8e93' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
  text-overflow: ellipsis;
}

/* ---- the contact section's icon square (accent at 12%, app pattern) ---- */
.callout { display: flex; gap: 14px; align-items: flex-start; padding: 16px; }
.icon-square {
  flex: 0 0 auto; width: 44px; height: 44px; border-radius: 12px;
  background: var(--accent-soft);
  display: grid; place-items: center;
}
.icon-square svg { width: 22px; height: 22px; stroke: var(--accent); }
.callout p { margin: 0; font-size: 14px; line-height: 1.45; color: var(--secondary); }
.callout strong { color: var(--text); font-weight: 600; }

/* the Instagram shortcut above the form — a tappable card row */
.link-row {
  display: flex; gap: 14px; align-items: center;
  background: var(--surface); border-radius: var(--radius);
  box-shadow: var(--shadow); padding: 12px 16px 12px 12px;
  margin: 0 0 24px; text-decoration: none; color: inherit;
  min-height: 68px;
  transition: box-shadow 0.15s ease, transform 0.08s ease;
}
.link-row:hover { box-shadow: var(--shadow-lift); }
.link-row:active { transform: scale(0.99); }
.link-row:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--accent-ring); }
.link-row .text { flex: 1; min-width: 0; }
.link-row .text b { display: block; font-size: 15px; font-weight: 600; }
.link-row .text span { font-size: 13px; color: var(--secondary); }
.link-row .chev { flex: 0 0 auto; color: var(--tertiary); }

button {
  width: 100%; min-height: 50px;
  padding: 14px 20px;
  font: 600 17px/1.2 inherit;
  letter-spacing: -0.01em;
  color: #ffffff; background: var(--accent);
  border: 0; border-radius: var(--radius);
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.08s ease;
}
button:hover { opacity: 0.92; }
button:active { transform: scale(0.985); opacity: 0.85; }
button:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--bg), 0 0 0 6px var(--accent-ring); }

.honey { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.banner {
  display: flex; gap: 10px; align-items: flex-start;
  background: var(--surface); border-left: 3px solid var(--danger);
  border-radius: 10px; padding: 12px 14px; margin: 0 0 20px;
  font-size: 15px; line-height: 1.4; box-shadow: var(--shadow);
}
.banner svg { flex: 0 0 auto; margin-top: 1px; }

/* ---- footer ---- */
.site-footer {
  margin: 28px auto 0;
  padding-top: 20px;
  border-top: 0.5px solid var(--separator);
  text-align: center;
}
.site-footer .footnote {
  font-size: 13px; line-height: 1.45; color: var(--tertiary);
  margin: 0 auto 6px; max-width: 42ch; text-wrap: pretty;
}
.site-footer nav {
  display: flex; flex-wrap: wrap;
  justify-content: center; align-items: center;
  gap: 0 2px;
}
.site-footer a {
  display: inline-flex; align-items: center;
  min-height: 44px; padding: 0 10px;
  font-size: 13px; font-weight: 500;
  color: var(--accent); text-decoration: none;
  border-radius: 8px;
}
.site-footer a:hover { text-decoration: underline; }
.site-footer a:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--accent-ring); }
.site-footer .dot { color: var(--tertiary); font-size: 11px; user-select: none; }

/* ---- tablet: more air, wider measure, hover affordances ---- */
@media (min-width: 700px) {
  :root { --gutter: 32px; --radius: 18px; }
  body { padding-top: 56px; padding-bottom: 48px; }
  main { max-width: 600px; }
  header { margin-bottom: 36px; }
  .logo { width: 84px; height: 84px; border-radius: 19px; }
  h1 { font-size: 34px; }
  .lede { font-size: 17px; }
  .field { padding: 18px 20px; }
  .split .field { padding-left: 16px; padding-right: 16px; }
  .callout { padding: 20px; }
  section { margin-bottom: 28px; }
  .link-row { padding: 14px 20px 14px 16px; margin-bottom: 28px; }
  .site-footer { margin-top: 40px; padding-top: 24px; }
  input:hover, textarea:hover, select:hover { border-color: var(--field-hover); }
  input:focus-visible:hover, textarea:focus-visible:hover, select:focus-visible:hover { border-color: var(--accent); }
}

/* ---- desktop: a two-column composition, not a lonely centred column ---- */
@media (min-width: 1080px) {
  body { padding-top: 72px; padding-bottom: 56px; }
  main {
    max-width: 1000px;
    display: grid;
    grid-template-columns: minmax(0, 330px) minmax(0, 560px);
    column-gap: 72px;
    align-items: start;
    justify-content: center;
  }
  .rail { position: sticky; top: 72px; }
  .pane { min-width: 0; }
  /* auto margins would shrink-wrap a grid item, so the rule spans both columns */
  .site-footer { grid-column: 1 / -1; justify-self: stretch; margin: 56px 0 0; }
  header { text-align: left; margin-bottom: 24px; }
  .logo { margin-left: 0; margin-right: 0; }
  h1 { font-size: 38px; }
  .lede { margin-left: 0; max-width: 32ch; }
  main.solo { display: block; max-width: 560px; }
  main.solo header { text-align: center; }
  main.solo .logo { margin-left: auto; margin-right: auto; }
  main.solo .lede { margin-left: auto; margin-right: auto; }
}
@media (min-width: 1400px) {
  main { max-width: 1060px; column-gap: 88px; }
  h1 { font-size: 42px; }
}

/* on a black background the icon's own black corners disappear, so it gets a hairline ring */
@media (prefers-color-scheme: dark) {
  .logo { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 10px 30px rgba(55, 112, 212, 0.2); }
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
  button:active, .link-row:active { transform: none; }
}

/* ---- confirmation screen ---- */
.done-mark {
  width: 76px; height: 76px; border-radius: 50%;
  background: var(--accent-soft); display: grid; place-items: center;
  margin: 0 auto 20px;
}
.done-mark svg { width: 38px; height: 38px; stroke: var(--accent); }
`;

const FOOTER = `<footer class="site-footer">
  <p class="footnote">Gespeichert wird nur, was du hier einträgst und hochlädst. Keine IP-Adresse, kein Konto, keine Cookies.</p>
  <nav aria-label="Rechtliches">
    <a href="https://lgka.app">lgka.app</a>
    <span class="dot" aria-hidden="true">•</span>
    <a href="https://privacy.lgka.app">Datenschutz</a>
    <span class="dot" aria-hidden="true">•</span>
    <a href="https://impressum.lgka.app">Impressum</a>
  </nav>
</footer>`;

const shell = (title: string, body: string, mainClass = "") => `<!doctype html>
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
<body><main${mainClass ? ` class="${mainClass}"` : ""}>${body}${FOOTER}</main></body>
</html>`;

const LOGO = `<img class="logo" src="/logo.png" width="72" height="72" alt="LGKA+">`;

export function formPage(error?: string): string {
  return shell(
    "Fehler melden – LGKA+ App",
    `
<div class="rail">
  <header>
    ${LOGO}
    <h1>Etwas geht nicht?</h1>
    <p class="lede">Geht an mich, nicht an einen Support. Je genauer du's beschreibst, desto eher finde ich's.</p>
  </header>

  <a class="link-row" href="https://ig.me/m/lxka76" target="_blank" rel="noopener">
    <span class="icon-square" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/></svg>
    </span>
    <span class="text">
      <b>Geht auch direkt</b>
      <span>@lxka76 auf Instagram</span>
    </span>
    <svg class="chev" width="9" height="15" viewBox="0 0 9 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m1.5 1.5 6 6-6 6"/></svg>
  </a>
</div>

<div class="pane">
${
  error
    ? `<div class="banner" role="alert"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="color:var(--danger)"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.01"/></svg><span>${error}</span></div>`
    : ""
}

<form method="post" action="/" enctype="multipart/form-data">
  <section>
    <h2 class="section-title">Was nicht geht</h2>
    <p class="legend"><span class="req">*</span> muss, der Rest ist optional.</p>
    <div class="card">
      <div class="field">
        <label for="what">Was ist passiert? <span class="req" aria-hidden="true">*</span></label>
        <p class="hint">Was du gemacht hast, was dann kam. Und ob's jedes Mal passiert.</p>
        <textarea id="what" name="what" required maxlength="5000"></textarea>
      </div>
      <div class="field">
        <label for="where_in_app">Wo in der App?</label>
        <p class="hint">z.&nbsp;B. Vertretungsplan, oder direkt beim Öffnen.</p>
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
        <p class="hint">Hilft oft mehr als Text. Bis zu 4 Bilder, je max. 8&nbsp;MB.</p>
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
        <p><strong>Optional</strong> – aber ohne kann ich nicht nachfragen, wenn was unklar ist. Und du erfährst nicht, wenn's gefixt ist.</p>
      </div>
      <div class="field">
        <label for="contact">Wie erreiche ich dich?</label>
        <p class="hint">E-Mail, Nummer, Insta – such dir was aus.</p>
        <input id="contact" name="contact" maxlength="200" autocomplete="off" placeholder="z. B. Max, @max oder max@example.com" enterkeyhint="send">
      </div>
    </div>
  </section>

  <div class="honey" aria-hidden="true">
    <label for="website">Website</label>
    <input id="website" name="website" tabindex="-1" autocomplete="off">
  </div>

  <button type="submit">Abschicken</button>
</form>
</div>
`,
  );
}

export function thanksPage(): string {
  return shell(
    "Ist da – LGKA+ App",
    `
<header>
  <div class="done-mark" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
  </div>
  <h1>Ist da.</h1>
  <p class="lede">Ich schau's mir an.</p>
</header>

<section>
  <div class="card">
    <div class="field">
      <p class="hint" style="margin:0">Mit Kontakt meld ich mich, wenn was unklar ist – oder wenn's gefixt ist.</p>
    </div>
  </div>
</section>
`,
    "solo",
  );
}
