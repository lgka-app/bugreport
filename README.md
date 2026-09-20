# lgka-bugreport

Das Fehlermeldungs-Formular der LGKA+ App — https://bugreport.lgka.app

Ein Cloudflare Worker, der das Formular selbst ausliefert (server-gerendertes HTML,
kein Client-JavaScript, damit es in jedem In-App-WebView funktioniert) und die
Meldungen in einer D1-Datenbank speichert.

## Datenschutz

Gespeichert wird ausschließlich, was die Person ins Formular tippt, plus ein
Zeitstempel. Keine IP-Adresse, kein User-Agent, keine Cookies, keine
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
