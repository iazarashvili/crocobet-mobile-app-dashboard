'use strict';

const db = require('../lib/db');

const now = () => new Date().toISOString();
const json = (value, fallback) => {
  try { const out = JSON.parse(value); return out == null ? fallback : out; }
  catch (_) { return fallback; }
};
const VALID = new Set(['passed', 'failed']);

const q = name => db.open().prepare(SQL[name]);

const SQL = {
  projects: `SELECT p.*,
               (SELECT COUNT(*) FROM cases c WHERE c.project_id = p.id) AS cases
             FROM projects p ORDER BY p.position, p.name`,
  project: 'SELECT * FROM projects WHERE id = ?',
  suites: 'SELECT * FROM suites WHERE project_id = ? ORDER BY position, name',
  groups: 'SELECT * FROM groups WHERE project_id = ? ORDER BY position, name',
  cases: 'SELECT * FROM cases WHERE project_id = ? ORDER BY position, id',
  caseById: 'SELECT * FROM cases WHERE id = ?',
  caseByRef: 'SELECT * FROM cases WHERE project_id = ? AND ref = ?',
  nextCasePos: 'SELECT COALESCE(MAX(position), -1) + 1 AS n FROM cases WHERE project_id = ? AND group_id = ?',
  nextSuitePos: 'SELECT COALESCE(MAX(position), -1) + 1 AS n FROM suites WHERE project_id = ?',
  nextGroupPos: 'SELECT COALESCE(MAX(position), -1) + 1 AS n FROM groups WHERE project_id = ?',
  statuses: `SELECT c.ref, s.status, s.at FROM statuses s
             JOIN cases c ON c.id = s.case_id WHERE s.project_id = ?`,
  overview: `SELECT p.id, p.name, p.name_ka, p.flag, p.country,
               (SELECT COUNT(*) FROM cases c WHERE c.project_id = p.id) AS total,
               (SELECT COUNT(*) FROM statuses s WHERE s.project_id = p.id AND s.status = 'passed') AS passed,
               (SELECT COUNT(*) FROM statuses s WHERE s.project_id = p.id AND s.status = 'failed') AS failed,
               (SELECT MAX(at) FROM statuses s WHERE s.project_id = p.id) AS last_run
             FROM projects p ORDER BY p.position, p.name`,
};

const rowToCase = row => ({
  id: row.id,
  ref: row.ref,
  title: row.title,
  tags: json(row.tags, []),
  merged: json(row.merged, []),
  precondition: row.precondition || undefined,
  steps: json(row.steps, []),
  source: row.source,
  groupId: row.group_id,
});

const rowToProject = row => row && ({
  id: row.id,
  name: row.name,
  nameKa: row.name_ka,
  country: row.country,
  flag: row.flag,
  platform: row.platform,
  framework: row.framework,
  position: row.position,
  cases: row.cases,
});

/* ---------- projects ---------- */
const projects = {
  list: () => q('projects').all().map(rowToProject),
  get: id => rowToProject(q('project').get(id)),

  create(input) {
    const id = String(input.id || '').trim();
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(id)) throw httpError(400, 'id must be kebab-case, 2-41 chars');
    if (!input.name) throw httpError(400, 'name is required');
    if (projects.get(id)) throw httpError(409, `project "${id}" already exists`);

    const pos = db.open().prepare('SELECT COALESCE(MAX(position), 0) + 1 AS n FROM projects').get().n;
    db.open().prepare(`INSERT INTO projects (id, name, name_ka, country, flag, platform, framework, position, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, input.name, input.nameKa || null, input.country || null, input.flag || null,
        input.platform || null, input.framework || null, input.position || pos, now());
    return projects.get(id);
  },

  update(id, input) {
    const current = q('project').get(id);
    if (!current) throw httpError(404, `project "${id}" not found`);
    db.open().prepare(`UPDATE projects SET name = ?, name_ka = ?, country = ?, flag = ?,
                       platform = ?, framework = ?, position = ? WHERE id = ?`)
      .run(input.name ?? current.name, input.nameKa ?? current.name_ka, input.country ?? current.country,
        input.flag ?? current.flag, input.platform ?? current.platform,
        input.framework ?? current.framework, input.position ?? current.position, id);
    return projects.get(id);
  },

  remove(id) {
    if (!projects.get(id)) throw httpError(404, `project "${id}" not found`);
    db.tx(conn => {
      conn.prepare('DELETE FROM status_log WHERE project_id = ?').run(id);
      conn.prepare('DELETE FROM statuses WHERE project_id = ?').run(id);
      conn.prepare('DELETE FROM cases WHERE project_id = ?').run(id);
      conn.prepare('DELETE FROM groups WHERE project_id = ?').run(id);
      conn.prepare('DELETE FROM suites WHERE project_id = ?').run(id);
      conn.prepare('DELETE FROM projects WHERE id = ?').run(id);
    });
    return { id };
  },

  tree(id) {
    const project = projects.get(id);
    if (!project) throw httpError(404, `project "${id}" not found`);

    const byGroup = new Map();
    for (const row of q('cases').all(id)) {
      if (!byGroup.has(row.group_id)) byGroup.set(row.group_id, []);
      byGroup.get(row.group_id).push(rowToCase(row));
    }

    const bySuite = new Map();
    for (const row of q('groups').all(id)) {
      if (!bySuite.has(row.suite_id)) bySuite.set(row.suite_id, []);
      bySuite.get(row.suite_id).push({
        id: row.id,
        name: row.name,
        file: row.file || '',
        precondition: row.precondition || undefined,
        cases: byGroup.get(row.id) || [],
      });
    }

    const suites = q('suites').all(id).map(row => ({
      id: row.id,
      name: row.name,
      nameKa: row.name_ka || row.name,
      summary: row.summary || '',
      icon: row.icon || '',
      groups: bySuite.get(row.id) || [],
    }));

    return { project, suites };
  },
};

/* ---------- suites / groups / cases ---------- */
const slug = text => String(text || '').toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'item';

function uniqueId(table, projectId, base) {
  const exists = db.open().prepare(`SELECT 1 FROM ${table} WHERE project_id = ? AND id = ?`);
  let id = base;
  let n = 2;
  while (exists.get(projectId, id)) id = `${base}-${n++}`;
  return id;
}

const suites = {
  create(projectId, input) {
    if (!projects.get(projectId)) throw httpError(404, `project "${projectId}" not found`);
    if (!input.name) throw httpError(400, 'name is required');
    const id = uniqueId('suites', projectId, slug(input.id || input.name));
    const pos = q('nextSuitePos').get(projectId).n;
    db.open().prepare(`INSERT INTO suites (project_id, id, name, name_ka, summary, icon, position)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(projectId, id, input.name, input.nameKa || input.name, input.summary || '', input.icon || '', pos);
    return { id, projectId };
  },

  update(projectId, id, input) {
    const row = db.open().prepare('SELECT * FROM suites WHERE project_id = ? AND id = ?').get(projectId, id);
    if (!row) throw httpError(404, 'suite not found');
    db.open().prepare('UPDATE suites SET name = ?, name_ka = ?, summary = ?, icon = ? WHERE project_id = ? AND id = ?')
      .run(input.name ?? row.name, input.nameKa ?? row.name_ka, input.summary ?? row.summary,
        input.icon ?? row.icon, projectId, id);
    return { id, projectId };
  },

  remove(projectId, id) {
    db.tx(conn => {
      const groupIds = conn.prepare('SELECT id FROM groups WHERE project_id = ? AND suite_id = ?').all(projectId, id).map(r => r.id);
      for (const gid of groupIds) removeGroupRows(conn, projectId, gid);
      conn.prepare('DELETE FROM groups WHERE project_id = ? AND suite_id = ?').run(projectId, id);
      conn.prepare('DELETE FROM suites WHERE project_id = ? AND id = ?').run(projectId, id);
    });
    return { id };
  },
};

function removeGroupRows(conn, projectId, groupId) {
  const ids = conn.prepare('SELECT id FROM cases WHERE project_id = ? AND group_id = ?').all(projectId, groupId).map(r => r.id);
  for (const caseId of ids) conn.prepare('DELETE FROM statuses WHERE case_id = ?').run(caseId);
  conn.prepare('DELETE FROM cases WHERE project_id = ? AND group_id = ?').run(projectId, groupId);
}

const groups = {
  create(projectId, input) {
    if (!input.suiteId) throw httpError(400, 'suiteId is required');
    const suite = db.open().prepare('SELECT 1 FROM suites WHERE project_id = ? AND id = ?').get(projectId, input.suiteId);
    if (!suite) throw httpError(404, 'suite not found');
    if (!input.name) throw httpError(400, 'name is required');

    const id = uniqueId('groups', projectId, slug(input.id || input.name));
    const pos = q('nextGroupPos').get(projectId).n;
    db.open().prepare(`INSERT INTO groups (project_id, id, suite_id, name, file, precondition, position)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(projectId, id, input.suiteId, input.name, input.file || '', input.precondition || '', pos);
    return { id, projectId };
  },

  update(projectId, id, input) {
    const row = db.open().prepare('SELECT * FROM groups WHERE project_id = ? AND id = ?').get(projectId, id);
    if (!row) throw httpError(404, 'group not found');
    db.open().prepare('UPDATE groups SET name = ?, file = ?, precondition = ?, suite_id = ? WHERE project_id = ? AND id = ?')
      .run(input.name ?? row.name, input.file ?? row.file, input.precondition ?? row.precondition,
        input.suiteId ?? row.suite_id, projectId, id);
    return { id, projectId };
  },

  remove(projectId, id) {
    db.tx(conn => {
      removeGroupRows(conn, projectId, id);
      conn.prepare('DELETE FROM groups WHERE project_id = ? AND id = ?').run(projectId, id);
    });
    return { id };
  },
};

function validateCase(input) {
  const ref = String(input.ref || '').trim();
  const title = String(input.title || '').trim();
  if (!ref) throw httpError(400, 'ref is required');
  if (!title) throw httpError(400, 'title is required');

  const steps = (Array.isArray(input.steps) ? input.steps : [])
    .map(s => ({ action: String(s.action || '').trim(), expected: String(s.expected || '').trim() }))
    .filter(s => s.action || s.expected);
  if (!steps.length) throw httpError(400, 'at least one step is required');
  if (steps.some(s => !s.action || !s.expected)) throw httpError(400, 'every step needs an action and an expected result');

  const tags = (Array.isArray(input.tags) ? input.tags : String(input.tags || '').split(','))
    .map(t => String(t).trim()).filter(Boolean);
  const merged = (Array.isArray(input.merged) ? input.merged : [])
    .map(t => String(t).trim()).filter(Boolean);

  return { ref, title, steps, tags, merged, precondition: String(input.precondition || '').trim() || null };
}

const cases = {
  create(projectId, input) {
    const group = db.open().prepare('SELECT 1 FROM groups WHERE project_id = ? AND id = ?').get(projectId, input.groupId);
    if (!group) throw httpError(404, 'group not found');

    const data = validateCase(input);
    if (q('caseByRef').get(projectId, data.ref)) throw httpError(409, `"${data.ref}" already exists in this project`);

    const pos = q('nextCasePos').get(projectId, input.groupId).n;
    const stamp = now();
    const info = db.open().prepare(`INSERT INTO cases (project_id, group_id, ref, title, tags, merged, precondition, steps, source, position, created_at, updated_at)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(projectId, input.groupId, data.ref, data.title, JSON.stringify(data.tags), JSON.stringify(data.merged),
        data.precondition, JSON.stringify(data.steps), input.source || 'manual', pos, stamp, stamp);
    return rowToCase(q('caseById').get(Number(info.lastInsertRowid)));
  },

  update(id, input) {
    const row = q('caseById').get(id);
    if (!row) throw httpError(404, 'case not found');

    const data = validateCase({ ...rowToCase(row), ...input });
    const clash = q('caseByRef').get(row.project_id, data.ref);
    if (clash && clash.id !== row.id) throw httpError(409, `"${data.ref}" already exists in this project`);

    db.open().prepare(`UPDATE cases SET group_id = ?, ref = ?, title = ?, tags = ?, merged = ?,
                       precondition = ?, steps = ?, updated_at = ? WHERE id = ?`)
      .run(input.groupId || row.group_id, data.ref, data.title, JSON.stringify(data.tags),
        JSON.stringify(data.merged), data.precondition, JSON.stringify(data.steps), now(), id);
    return rowToCase(q('caseById').get(id));
  },

  remove(id) {
    const row = q('caseById').get(id);
    if (!row) throw httpError(404, 'case not found');
    db.tx(conn => {
      conn.prepare('DELETE FROM statuses WHERE case_id = ?').run(id);
      conn.prepare('DELETE FROM cases WHERE id = ?').run(id);
    });
    return { id, ref: row.ref };
  },
};

/* ---------- statuses ---------- */
const statuses = {
  all(projectId) {
    const map = {};
    for (const row of q('statuses').all(projectId)) map[row.ref] = { status: row.status, at: row.at };
    return map;
  },

  set(projectId, ref, status) {
    const row = q('caseByRef').get(projectId, ref);
    if (!row) throw httpError(404, `case "${ref}" not found in "${projectId}"`);
    if (status !== 'untested' && !VALID.has(status)) throw httpError(400, 'status must be passed, failed or untested');

    const at = now();
    db.tx(conn => {
      if (status === 'untested') conn.prepare('DELETE FROM statuses WHERE case_id = ?').run(row.id);
      else {
        conn.prepare(`INSERT INTO statuses (project_id, case_id, status, at) VALUES (?, ?, ?, ?)
                      ON CONFLICT (case_id) DO UPDATE SET status = excluded.status, at = excluded.at`)
          .run(projectId, row.id, status, at);
      }
      conn.prepare('INSERT INTO status_log (project_id, case_id, ref, status, at) VALUES (?, ?, ?, ?, ?)')
        .run(projectId, row.id, ref, status, at);
    });
    return statuses.all(projectId);
  },

  history(projectId, limit) {
    return db.open()
      .prepare('SELECT ref, status, at FROM status_log WHERE project_id = ? ORDER BY id DESC LIMIT ?')
      .all(projectId, Math.min(Number(limit) || 50, 500));
  },
};

/* ---------- overview ---------- */
const overview = () => q('overview').all().map(row => ({
  id: row.id,
  name: row.name,
  nameKa: row.name_ka,
  flag: row.flag,
  country: row.country,
  total: row.total,
  passed: row.passed,
  failed: row.failed,
  untested: row.total - row.passed - row.failed,
  lastRun: row.last_run,
}));

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { projects, suites, groups, cases, statuses, overview, httpError, backend: 'sqlite' };
