#!/usr/bin/env node
'use strict';

/* Loads seeds/<project>/*.js into SQLite. Idempotent: matched on (project_id, ref). */

const fs = require('fs');
const path = require('path');
const db = require('../lib/db');

const SEEDS = path.join(__dirname, '..', 'seeds');

function loadSeed(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  if (!files.length) return null;

  global.window = {};
  for (const file of files) {
    const full = path.join(dir, file);
    delete require.cache[require.resolve(full)];
    require(full);
  }
  const data = global.window.TEST_DATA;
  delete global.window;

  if (!data || !data.project || !data.project.id) {
    throw new Error(`${dir}: 00-init.js must define TEST_DATA.project.id`);
  }
  return data;
}

function seed(data) {
  const conn = db.open();
  const now = new Date().toISOString();
  const p = data.project;

  const q = {
    project: conn.prepare(`INSERT INTO projects (id, name, name_ka, country, flag, platform, framework, position, created_at)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                           ON CONFLICT (id) DO UPDATE SET name = excluded.name, name_ka = excluded.name_ka,
                             country = excluded.country, flag = excluded.flag, platform = excluded.platform,
                             framework = excluded.framework, position = excluded.position`),
    suite: conn.prepare(`INSERT INTO suites (project_id, id, name, name_ka, summary, icon, position)
                         VALUES (?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT (project_id, id) DO UPDATE SET name = excluded.name, name_ka = excluded.name_ka,
                           summary = excluded.summary, icon = excluded.icon, position = excluded.position`),
    group: conn.prepare(`INSERT INTO groups (project_id, id, suite_id, name, file, precondition, position)
                         VALUES (?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT (project_id, id) DO UPDATE SET suite_id = excluded.suite_id, name = excluded.name,
                           file = excluded.file, precondition = excluded.precondition, position = excluded.position`),
    findCase: conn.prepare('SELECT id FROM cases WHERE project_id = ? AND ref = ?'),
    insertCase: conn.prepare(`INSERT INTO cases (project_id, group_id, ref, title, tags, merged, precondition, steps, source, position, created_at, updated_at)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    updateCase: conn.prepare(`UPDATE cases SET group_id = ?, title = ?, tags = ?, merged = ?, precondition = ?,
                              steps = ?, position = ?, updated_at = ? WHERE id = ?`),
  };

  const counts = { suites: 0, groups: 0, inserted: 0, updated: 0 };

  db.tx(() => {
    q.project.run(p.id, p.name, p.nameKa || null, p.country || null, p.flag || null,
      p.platform || null, p.framework || null, p.position || 0, now);

    data.suites.forEach((suite, si) => {
      q.suite.run(p.id, suite.id, suite.name, suite.nameKa || null, suite.summary || null, suite.icon || null, si);
      counts.suites++;

      suite.groups.forEach((group, gi) => {
        q.group.run(p.id, group.id, suite.id, group.name, group.file || null, group.precondition || null, gi);
        counts.groups++;

        group.cases.forEach((c, ci) => {
          const tags = JSON.stringify(c.tags || []);
          const merged = JSON.stringify(c.merged || []);
          const steps = JSON.stringify(c.steps || []);
          const existing = q.findCase.get(p.id, c.ref);

          if (existing) {
            q.updateCase.run(group.id, c.title, tags, merged, c.precondition || null, steps, ci, now, existing.id);
            counts.updated++;
          } else {
            q.insertCase.run(p.id, group.id, c.ref, c.title, tags, merged, c.precondition || null,
              steps, 'patrol', ci, now, now);
            counts.inserted++;
          }
        });
      });
    });
  });

  return counts;
}

function main() {
  const only = process.argv[2];
  const dirs = fs.readdirSync(SEEDS, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name)
    .filter(name => !only || name === only)
    .sort();

  if (!dirs.length) {
    console.error(only ? `no seed folder named "${only}"` : 'no seed folders found');
    process.exit(1);
  }

  for (const name of dirs) {
    const data = loadSeed(path.join(SEEDS, name));
    if (!data) { console.log(`${name}: empty, skipped`); continue; }
    const c = seed(data);
    const attached = db.attachLegacyStatuses(data.project.id);
    console.log(
      `${data.project.flag || ''} ${data.project.name} (${data.project.id}): ` +
      `${c.suites} suites, ${c.groups} groups, +${c.inserted} new / ${c.updated} updated cases` +
      (attached ? `, ${attached} legacy statuses attached` : '')
    );
  }
  console.log(`\ndb: ${db.FILE}`);
}

main();
