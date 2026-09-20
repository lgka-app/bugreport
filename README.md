# lgka-bugreport

Das Fehlermeldungs-Formular der LGKA+ App — https://bugreport.lgka.app

Ein Cloudflare Worker, der das Formular selbst ausliefert (server-gerendertes HTML,
kein Client-JavaScript, damit es in jedem In-App-WebView funktioniert), die
Meldungen in einer D1-Datenbank speichert und Screenshots in R2 ablegt.

Pflicht ist nur „Was ist passiert?“ (mit `*` markiert). Screenshots: bis zu 4
Bilder, je max. 8 MB, nur Bildformate (PNG, JPG, WebP, HEIC, GIF). Die Objekte
liegen unter `reports/<id>/<n>.<ext>` im Bucket `lgka-bugreport-uploads` (EU) und
sind **nicht öffentlich** — sie werden nur über `/admin/file?key=…` ausgeliefert.

## Datenschutz

Gespeichert wird ausschließlich, was die Person ins Formular tippt oder hochlädt,
plus ein Zeitstempel. Keine IP-Adresse, kein User-Agent, keine Cookies, keine
Request-Logs (`invocation_logs: false`). Die Datenbank liegt in der
EU-Jurisdiktion (`lgka-bugreport`, Region EEUR) — gleiche Linie wie `lgka-api`.

Name/Kontakt (E-Mail, Handynummer, Instagram …) sind freiwillig und im Formular
auch als freiwillig beschrieben: sie helfen nur bei Rückfragen.

## Entwicklung

```sh
npm install
npm run dev        # lokal
npm run migrate    # schema.sql auf die Remote-DB anwenden
npm run deploy
```

## Meldungen lesen

```
https://bugreport.lgka.app/admin?key=<ADMIN_TOKEN>            # HTML
https://bugreport.lgka.app/admin?key=<ADMIN_TOKEN>&format=json
```

`ADMIN_TOKEN` ist ein Worker-Secret (`wrangler secret put ADMIN_TOKEN`). Ohne
gültigen Key antwortet `/admin` mit 404. Alternativ direkt:

```sh
wrangler d1 execute lgka-bugreport --remote --command "SELECT * FROM reports ORDER BY id DESC LIMIT 20"
```

## Vorgänger

Bis September 2026 lief die Fehlermeldung über ein Google Form
(`Fehlermeldungen LGKA+ App`). Das Formular bleibt bestehen, damit ältere
App-Versionen weiter melden können; neue Versionen zeigen dieses hier.
