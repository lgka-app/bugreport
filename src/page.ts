// The form page and its two result screens. Server-rendered, no client JS:
// it has to work inside the in-app WebView on every phone in school.

const STYLE = `
:root {
  color-scheme: dark light;
  --bg: #000000;
  --surface: #1e1e1e;
  --text: #ffffff;
  --muted: rgba(255, 255, 255, 0.7);
  --border: rgba(255, 255, 255, 0.14);
  --accent: #3770d4;
  --field: rgba(255, 255, 255, 0.06);
}
@media (prefers-color-scheme: light) {
  :root {
    --bg: #f2f2f7;
    --surface: #ffffff;
    --text: #1a1a1a;
    --muted: #6b6b6b;
    --border: rgba(0, 0, 0, 0.12);
    --field: #f2f2f7;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 32px 16px 64px;
  background: var(--bg);
  color: var(--text);
  font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-text-size-adjust: 100%;
}
main { max-width: 560px; margin: 0 auto; }
h1 { font-size: 26px; line-height: 1.25; margin: 0 0 12px; letter-spacing: -0.02em; }
h2 { font-size: 18px; margin: 0 0 8px; }
p { margin: 0 0 16px; color: var(--muted); }
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
}
label { display: block; font-weight: 600; margin-bottom: 6px; }
.hint { font-weight: 400; color: var(--muted); font-size: 14px; margin: -2px 0 8px; }
input, textarea, select {
  width: 100%;
  padding: 12px 14px;
  font: inherit;
  color: var(--text);
  background: var(--field);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 18px;
  appearance: none;
}
textarea { min-height: 150px; resize: vertical; }
input:focus, textarea:focus, select:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
button {
  width: 100%;
  padding: 15px;
  font: 600 17px/1 inherit;
  color: #ffffff;
  background: var(--accent);
  border: 0;
  border-radius: 14px;
  cursor: pointer;
}
button:active { opacity: 0.85; }
.row { display: flex; gap: 12px; }
.row > div { flex: 1; }
.footnote { font-size: 13px; color: var(--muted); text-align: center; margin: 0; }
.honey { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.error { border-left: 3px solid #ff6b6b; padding-left: 12px; color: var(--text); }
`;

const shell = (title: string, body: string) => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>${STYLE}</style>
</head>
<body><main>${body}</main></body>
</html>`;

export function formPage(error?: string): string {
  return shell(
    "Fehler melden – LGKA+ App",
    `
<h1>Etwas funktioniert nicht?</h1>
<p>Danke, dass du dir kurz Zeit nimmst. Ich lese jede Meldung selbst und versuche, den Fehler nachzustellen und zu beheben.</p>
${error ? `<p class="error">${error}</p>` : ""}
<form method="post" action="/">
  <div class="card">
    <label for="what">Was ist passiert?</label>
    <p class="hint">Schreib einfach in deinen eigenen Worten, was nicht geklappt hat – und wenn du magst, was du davor gemacht hast und ob es jedes Mal passiert.</p>
    <textarea id="what" name="what" required maxlength="5000" autofocus></textarea>

    <label for="where_in_app">Wo in der App war das?</label>
    <p class="hint">Freiwillig, z.&nbsp;B. „Vertretungsplan“ oder „beim Öffnen“.</p>
    <input id="where_in_app" name="where_in_app" maxlength="200" autocomplete="off">

    <div class="row">
      <div>
        <label for="platform">Handy</label>
        <select id="platform" name="platform">
          <option value="">Keine Angabe</option>
          <option value="android">Android</option>
          <option value="ios">iPhone</option>
        </select>
      </div>
      <div>
        <label for="app_version">App-Version</label>
        <input id="app_version" name="app_version" maxlength="40" autocomplete="off" placeholder="steht in den Einstellungen">
      </div>
    </div>
  </div>

  <div class="card">
    <h2>Wie kann ich dich erreichen?</h2>
    <p class="hint">Komplett freiwillig. Es hilft mir aber sehr: oft ist eine kurze Rückfrage („Auf welchem Bildschirm genau?“) der Unterschied zwischen „kann ich beheben“ und „finde ich nie“. Und ich kann dir Bescheid geben, wenn es behoben ist.</p>
    <label for="contact">Name und/oder Kontakt</label>
    <p class="hint">E-Mail, Handynummer, Instagram – was dir am liebsten ist.</p>
    <input id="contact" name="contact" maxlength="200" autocomplete="off" placeholder="z. B. Max, @max oder max@example.com">
  </div>

  <div class="honey" aria-hidden="true">
    <label for="website">Website</label>
    <input id="website" name="website" tabindex="-1" autocomplete="off">
  </div>

  <button type="submit">Absenden</button>
</form>
<p class="footnote">Gespeichert wird nur, was du hier einträgst – keine IP-Adresse, kein Konto, keine Cookies.</p>
`,
  );
}

export function thanksPage(): string {
  return shell(
    "Danke! – LGKA+ App",
    `
<h1>Danke dir!</h1>
<div class="card">
  <p>Deine Meldung ist angekommen. Ich schaue sie mir an und versuche, den Fehler nachzustellen.</p>
  <p>Falls du einen Kontakt dagelassen hast, melde ich mich bei Rückfragen – oder wenn es behoben ist.</p>
</div>
<p class="footnote">Du kannst dieses Fenster jetzt schließen.</p>
`,
  );
}
