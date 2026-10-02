'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DIR = path.join(__dirname, '..', 'db');
const FILE = process.env.CROCO_DB || path.join(DIR, 'crocobet.db');
const LEGACY = path.join(DIR, 'statuses.db');

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS projects (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    name_ka    TEXT,
    country    TEXT,
    flag       TEXT,
    platform   TEXT,
    framework  TEXT,
    position   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS suites (
    project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    id         TEXT NOT NULL,
    name       TEXT NOT NULL,
    name_ka    TEXT,
    summary    TEXT,
    icon       TEXT,
    position   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, id)
  );

  CREATE TABLE IF NOT EXISTS groups (
    project_id   TEXT NOT NULL,
    id           TEXT NOT NULL,
    suite_id     TEXT NOT NULL,
    name         TEXT NOT NULL,
    file         TEXT,
    precondition TEXT,
    position     INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, id),
    FOREIGN KEY (project_id, suite_id) REFERENCES suites (project_id, id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cases (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id   TEXT NOT NULL,
    group_id     TEXT NOT NULL,
    ref          TEXT NOT NULL,
    title        TEXT NOT NULL,
    tags         TEXT NOT NULL DEFAULT '[]',
    merged       TEXT NOT NULL DEFAULT '[]',
    precondition TEXT,
    steps        TEXT NOT NULL DEFAULT '[]',
    source       TEXT NOT NULL DEFAULT 'manual',
    position     INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL,
    UNIQUE (project_id, ref),
    FOREIGN KEY (project_id, group_id) REFERENCES groups (project_id, id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS cases_group ON cases (project_id, group_id, position);

  CREATE TABLE IF NOT EXISTS statuses (
    project_id TEXT NOT NULL,
    case_id    INTEGER NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    status     TEXT NOT NULL CHECK (status IN ('passed', 'failed')),
    at         TEXT NOT NULL,
    PRIMARY KEY (case_id)
  );

  CREATE INDEX IF NOT EXISTS statuses_project ON statuses (project_id);

  CREATE TABLE IF NOT EXISTS status_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    case_id    INTEGER,
    ref        TEXT NOT NULL,
    status     TEXT NOT NULL,
    at         TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS status_log_project ON status_log (project_id, ref);

  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

let db;

function open() {
  if (db) return db;
  fs.mkdirSync(DIR, { recursive: true });
  db = new DatabaseSync(FILE);
  db.exec(SCHEMA);
  migrateLegacyStatuses();
  return db;
}

function tx(fn) {
  const conn = open();
  conn.exec('BEGIN');
  try {
    const out = fn(conn);
    conn.exec('COMMIT');
    return out;
  } catch (err) {
    conn.exec('ROLLBACK');
    throw err;
  }
}

const flag = key => open().prepare('SELECT value FROM meta WHERE key = ?').get(key);
const setFlag = (key, value) =>
  open().prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value').run(key, value);

/* statuses.db from the single-project version: ref-keyed, no project column.
   Parked in meta until the cases are seeded, then attached by ref. */
function migrateLegacyStatuses() {
  if (flag('legacy_statuses_read') || !fs.existsSync(LEGACY)) return;
  try {
    const old = new DatabaseSync(LEGACY, { readOnly: true });
    const rows = old.prepare('SELECT ref, status, at FROM statuses').all();
    const log = old.prepare('SELECT ref, status, at FROM status_log ORDER BY id').all();
    old.close();
    setFlag('legacy_statuses', JSON.stringify({ rows, log }));
    setFlag('legacy_statuses_read', new Date().toISOString());
  } catch (_) {
    setFlag('legacy_statuses_read', 'failed');
  }
}

/* called by the seeder once cases exist */
function attachLegacyStatuses(projectId) {
  const parked = flag('legacy_statuses');
  if (!parked) return 0;

  const payload = JSON.parse(parked.value);
  const conn = open();
  const findCase = conn.prepare('SELECT id FROM cases WHERE project_id = ? AND ref = ?');
  const putStatus = conn.prepare(`INSERT INTO statuses (project_id, case_id, status, at) VALUES (?, ?, ?, ?)
                                  ON CONFLICT (case_id) DO UPDATE SET status = excluded.status, at = excluded.at`);
  const putLog = conn.prepare('INSERT INTO status_log (project_id, case_id, ref, status, at) VALUES (?, ?, ?, ?, ?)');

  let n = 0;
  tx(() => {
    for (const row of payload.rows || []) {
      const found = findCase.get(projectId, row.ref);
      if (!found) continue;
      putStatus.run(projectId, found.id, row.status, row.at);
      n++;
    }
    for (const row of payload.log || []) {
      const found = findCase.get(projectId, row.ref);
      putLog.run(projectId, found ? found.id : null, row.ref, row.status, row.at);
    }
  });

  conn.prepare('DELETE FROM meta WHERE key = ?').run('legacy_statuses');
  return n;
}

module.exports = { open, tx, FILE, attachLegacyStatuses, flag, setFlag };
