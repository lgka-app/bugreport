import { Hono } from "hono";
import { formPage, thanksPage } from "./page";

type Env = {
  DB: D1Database;
  ADMIN_TOKEN?: string;
};

const app = new Hono<{ Bindings: Env }>();

// Privacy: nothing about the request is logged or stored anywhere in here.
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "no-referrer");
  if (!c.res.headers.has("Cache-Control")) c.header("Cache-Control", "no-store");
});

const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s.length > 0 ? s : null;
};

app.get("/", (c) => c.html(formPage()));

app.post("/", async (c) => {
  const form = await c.req.formData();

  // Honeypot: hidden field, only bots fill it. Answer normally so they stop trying.
  if (clean(form.get("website"), 10) !== null) return c.html(thanksPage());

  const what = clean(form.get("what"), 5000);
  if (!what) return c.html(formPage("Bitte schreib kurz, was passiert ist."), 400);

  const platform = form.get("platform");
  await c.env.DB.prepare(
    `INSERT INTO reports (what, where_in_app, platform, app_version, contact) VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(
      what,
      clean(form.get("where_in_app"), 200),
      platform === "android" || platform === "ios" ? platform : null,
      clean(form.get("app_version"), 40),
      clean(form.get("contact"), 200),
    )
    .run();

  return c.html(thanksPage());
});

app.get("/healthz", (c) => c.text("ok"));

// Reading the reports: /admin?key=<ADMIN_TOKEN> (wrangler secret put ADMIN_TOKEN).
app.get("/admin", async (c) => {
  const token = c.env.ADMIN_TOKEN;
  if (!token || c.req.query("key") !== token) return c.text("not found", 404);

  const { results } = await c.env.DB.prepare(
    `SELECT id, created_at, what, where_in_app, platform, app_version, contact
       FROM reports ORDER BY created_at DESC LIMIT 200`,
  ).all();

  if (c.req.query("format") === "json") return c.json(results);

  const esc = (v: unknown) =>
    String(v ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
  const rows = results
    .map(
      (r: any) => `<article>
<h3>#${esc(r.id)} · ${esc(r.created_at)} UTC</h3>
<pre>${esc(r.what)}</pre>
<p>Wo: ${esc(r.where_in_app) || "–"} · ${esc(r.platform) || "–"} ${esc(r.app_version) || ""}<br>
Kontakt: ${esc(r.contact) || "–"}</p>
</article>`,
    )
    .join("");

  return c.html(`<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Fehlermeldungen</title><style>
body{font:15px/1.5 -apple-system,system-ui,sans-serif;max-width:760px;margin:0 auto;padding:24px;background:#000;color:#fff}
@media (prefers-color-scheme: light){body{background:#f2f2f7;color:#1a1a1a}}
article{border:1px solid rgba(128,128,128,.35);border-radius:14px;padding:14px 16px;margin-bottom:14px}
h3{margin:0 0 8px;font-size:14px;opacity:.7;font-weight:600}
pre{white-space:pre-wrap;margin:0 0 10px;font:inherit}
p{margin:0;opacity:.7;font-size:14px}
</style></head><body><h1>Fehlermeldungen (${results.length})</h1>${rows || "<p>Noch nichts.</p>"}</body></html>`);
});

app.notFound((c) => c.text("not found", 404));

export default app satisfies ExportedHandler<Env>;
