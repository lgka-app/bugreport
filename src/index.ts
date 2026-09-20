import { Hono } from "hono";
import { formPage, thanksPage } from "./page";

type Env = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  ADMIN_TOKEN?: string;
};

const MAX_FILES = 4;
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per screenshot — plenty for a phone screen grab
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/gif": "gif",
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
  if (!what) return c.html(formPage("Schreib kurz, was passiert ist."), 400);

  const files = form
    .getAll("screenshots")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_FILES);

  for (const f of files) {
    if (!TYPES[f.type]) {
      return c.html(formPage("Screenshots nur als Bild – PNG, JPG, HEIC oder WebP."), 400);
    }
    if (f.size > MAX_BYTES) {
      return c.html(formPage("Ein Bild ist über 8 MB. Kleiner machen oder weglassen."), 400);
    }
  }

  const platform = form.get("platform");
  const { meta } = await c.env.DB.prepare(
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

  // Uploads are keyed by report id, so an orphaned object is obvious and deletable.
  if (files.length > 0) {
    const id = meta.last_row_id;
    const keys: string[] = [];
    for (const [i, f] of files.entries()) {
      const key = `reports/${id}/${i + 1}.${TYPES[f.type]}`;
      await c.env.UPLOADS.put(key, f.stream(), { httpMetadata: { contentType: f.type } });
      keys.push(key);
    }
    await c.env.DB.prepare(`UPDATE reports SET screenshots = ? WHERE id = ?`)
      .bind(JSON.stringify(keys), id)
      .run();
  }

  return c.html(thanksPage());
});

app.get("/healthz", (c) => c.text("ok"));

const authed = (c: { env: Env; req: { query: (k: string) => string | undefined } }) => {
  const token = c.env.ADMIN_TOKEN;
  return Boolean(token) && c.req.query("key") === token;
};

// Reading the reports: /admin?key=<ADMIN_TOKEN> (wrangler secret put ADMIN_TOKEN).
app.get("/admin", async (c) => {
  if (!authed(c)) return c.text("not found", 404);
  const key = c.req.query("key")!;

  const { results } = await c.env.DB.prepare(
    `SELECT id, created_at, what, where_in_app, platform, app_version, contact, screenshots
       FROM reports ORDER BY created_at DESC LIMIT 200`,
  ).all();

  if (c.req.query("format") === "json") return c.json(results);

  const esc = (v: unknown) =>
    String(v ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
  const rows = results
    .map((r: any) => {
      const shots: string[] = r.screenshots ? JSON.parse(r.screenshots) : [];
      const imgs = shots
        .map((s) => {
          const href = `/admin/file?key=${encodeURIComponent(key)}&k=${encodeURIComponent(s)}`;
          return `<a href="${href}" target="_blank"><img src="${href}" alt="Screenshot"></a>`;
        })
        .join("");
      return `<article>
<h3>#${esc(r.id)} · ${esc(r.created_at)} UTC</h3>
<pre>${esc(r.what)}</pre>
${imgs ? `<div class="shots">${imgs}</div>` : ""}
<p>Wo: ${esc(r.where_in_app) || "–"} · ${esc(r.platform) || "–"} ${esc(r.app_version) || ""}<br>
Kontakt: ${esc(r.contact) || "–"}</p>
</article>`;
    })
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
.shots{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px}
.shots img{height:180px;border-radius:10px;border:1px solid rgba(128,128,128,.35)}
</style></head><body><h1>Fehlermeldungen (${results.length})</h1>${rows || "<p>Noch nichts.</p>"}</body></html>`);
});

// Screenshots are never public: they are served only with the admin key.
app.get("/admin/file", async (c) => {
  if (!authed(c)) return c.text("not found", 404);
  const k = c.req.query("k");
  if (!k || !k.startsWith("reports/")) return c.text("not found", 404);

  const obj = await c.env.UPLOADS.get(k);
  if (!obj) return c.text("not found", 404);
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "private, max-age=600",
    },
  });
});

app.notFound((c) => c.text("not found", 404));

export default app satisfies ExportedHandler<Env>;
