#!/usr/bin/env node
'use strict';

/* Reads patrolTest(...) declarations out of a Patrol integration_test tree and
   upserts them as cases. Steps cannot be derived from dart source, so new cases
   arrive with an empty step list and are filled in the app. Existing cases are
   matched by ref and keep everything they already have. */

const fs = require('fs');
const path = require('path');
const db = require('../lib/db');
const store = require('../lib/store');

const TEST_RE = /patrolTest\(\s*(['"])([\s\S]*?)\1\s*,\s*tags:\s*(\[[^\]]*\]|'[^']*')/g;

const titleCase = text => text
  .replace(/_test$/, '').replace(/[_-]+/g, ' ').trim()
  .replace(/^./, c => c.toUpperCase());

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('_test.dart') ? [full] : [];
  });
}

function parse(file) {
  const src = fs.readFileSync(file, 'utf8');
  const out = [];
  let m;
  TEST_RE.lastIndex = 0;
  while ((m = TEST_RE.exec(src))) {
    const raw = m[2];
    const ids = raw.match(/[A-Z][A-Z0-9]*\d*-\d+/g) || [];
    const title = raw.replace(/([A-Z][A-Z0-9]*\d*-\d+:\s*)+/g, '').replace(/^\[.*?\]\s*/, '').trim();
    out.push({
      ref: ids.length ? ids.join(' + ') : null,
      merged: ids.length > 1 ? ids : [],
      title: title || raw,
      tags: [...m[3].matchAll(/'([^']+)'/g)].map(x => x[1]),
    });
  }
  return out;
}

function usage(message) {
  if (message) console.error(`error: ${message}\n`);
  console.error('usage: node scripts/import-patrol.js <integration_test dir> --project <id> [--dry]');
  process.exit(message ? 1 : 0);
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help')) usage();

  const root = args.find(a => !a.startsWith('--'));
  const projectId = args[args.indexOf('--project') + 1];
  const dry = args.includes('--dry');

  if (!root) usage('an integration_test directory is required');
  if (!args.includes('--project') || !projectId || projectId.startsWith('--')) usage('--project <id> is required');

  const testsDir = fs.existsSync(path.join(root, 'tests')) ? path.join(root, 'tests') : root;
  if (!fs.existsSync(testsDir)) usage(`${testsDir} does not exist`);

  const project = store.projects.get(projectId);
  if (!project) usage(`project "${projectId}" not found — create it in the app first`);

  const conn = db.open();
  const now = new Date().toISOString();
  const q = {
    suite: conn.prepare(`INSERT INTO suites (project_id, id, name, name_ka, summary, icon, position)
                         VALUES (?, ?, ?, ?, '', '', ?) ON CONFLICT (project_id, id) DO NOTHING`),
    group: conn.prepare(`INSERT INTO groups (project_id, id, suite_id, name, file, precondition, position)
                         VALUES (?, ?, ?, ?, ?, '', ?)
                         ON CONFLICT (project_id, id) DO UPDATE SET file = excluded.file, suite_id = excluded.suite_id`),
    find: conn.prepare('SELECT id, steps FROM cases WHERE project_id = ? AND ref = ?'),
    insert: conn.prepare(`INSERT INTO cases (project_id, group_id, ref, title, tags, merged, steps, source, position, created_at, updated_at)
                          VALUES (?, ?, ?, ?, ?, ?, '[]', 'patrol', ?, ?, ?)`),
    /* group_id is deliberately left alone: a case that was already filed somewhere
       (by hand or by the seeder) must not be moved by a re-import. */
    update: conn.prepare('UPDATE cases SET title = ?, tags = ?, merged = ?, updated_at = ? WHERE id = ?'),
  };

  const files = walk(testsDir).sort();
  const report = { files: files.length, suites: new Set(), groups: 0, added: 0, updated: 0, skipped: [] };

  const work = () => {
    files.forEach((file, index) => {
      const rel = path.relative(path.dirname(testsDir), file);
      const suiteId = path.basename(path.dirname(file));
      const groupId = path.basename(file, '_test.dart');
      const tests = parse(file);
      if (!tests.length) return;

      report.suites.add(suiteId);
      report.groups++;

      q.suite.run(projectId, suiteId, titleCase(suiteId), titleCase(suiteId), report.suites.size - 1);
      q.group.run(projectId, groupId, suiteId, titleCase(groupId), rel, index);

      tests.forEach((t, i) => {
        const ref = t.ref || `${groupId.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-${i + 1}`;
        const tags = JSON.stringify(t.tags);
        const merged = JSON.stringify(t.merged);
        const existing = q.find.get(projectId, ref);

        if (existing) {
          q.update.run(t.title, tags, merged, now, existing.id);
          report.updated++;
          if (JSON.parse(existing.steps).length === 0) report.skipped.push(ref);
        } else {
          q.insert.run(projectId, groupId, ref, t.title, tags, merged, i, now, now);
          report.added++;
          report.skipped.push(ref);
        }
      });
    });
  };

  if (dry) {
    console.log(`[dry run] ${files.length} test files under ${testsDir}`);
    files.forEach(file => {
      const tests = parse(file);
      if (tests.length) console.log(`  ${path.basename(file)} → ${tests.length} cases`);
    });
    return;
  }

  db.tx(work);

  console.log(`${project.flag || ''} ${project.name}: ${report.files} files, ${report.suites.size} suites, ${report.groups} groups`);
  console.log(`cases: +${report.added} new, ${report.updated} updated`);
  if (report.skipped.length) {
    console.log(`\n${report.skipped.length} cases have no steps yet — open them in the app and fill in`);
    console.log(`  ${report.skipped.slice(0, 8).join(', ')}${report.skipped.length > 8 ? ' …' : ''}`);
  }
}

main();
