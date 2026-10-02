'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const ROUTES = {
  '/api/projects': require('./api/projects'),
  '/api/cases': require('./api/cases'),
  '/api/statuses': require('./api/statuses'),
  '/api/overview': require('./api/overview'),
};

const PORT = Number(process.env.PORT) || 8787;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1e6) reject(new Error('body too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (_) { resolve({}); }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const file = path.resolve(ROOT, rel);

  if (!file.startsWith(ROOT + path.sep) || rel.startsWith('db/')) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.statusCode = 404;
      return res.end('Not found');
    }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  const route = ROUTES[pathname.replace(/\/$/, '')];
  if (route) {
    try { req.body = await readBody(req); } catch (_) { req.body = {}; }
    return route(req, res);
  }
  if (pathname.startsWith('/api/')) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok: false, error: `no route for ${pathname}` }));
  }
  return serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  const db = require('./lib/db');
  const store = require('./lib/store');
  const projects = store.projects.list();

  console.log(`Crocobet test cases → http://localhost:${PORT}`);
  console.log(`db: ${db.FILE}`);
  if (!projects.length) {
    console.log('no projects yet — run: node scripts/seed-from-data.js');
  } else {
    projects.forEach(p => console.log(`  ${p.flag || '•'} ${p.name} (${p.id}) — ${p.cases} cases`));
  }
});
