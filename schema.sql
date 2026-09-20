-- Bug reports from the LGKA+ apps. Only what the reporter typed, plus a
-- timestamp: no IP, no user agent, no cookies, nothing derived from the request.
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  what TEXT NOT NULL,        -- what happened (required)
  where_in_app TEXT,         -- which screen / part of the app
  platform TEXT,             -- 'android' | 'ios' | 'unknown'
  app_version TEXT,
  contact TEXT,              -- voluntary: name, email, phone, Instagram, whatever
  screenshots TEXT,          -- JSON array of R2 object keys, or NULL
  handled INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS reports_created_at ON reports (created_at DESC);

-- Added 2026-09-20 with the screenshot upload: JSON array of R2 object keys.
-- ALTER TABLE reports ADD COLUMN screenshots TEXT;
