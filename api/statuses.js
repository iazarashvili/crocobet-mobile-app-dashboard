'use strict';

const store = require('../lib/store');
const { ok, fail, query, body, notAllowed } = require('./_respond');

const reply = (res, project, map) => ok(res, {
  backend: store.backend,
  project,
  count: Object.keys(map).length,
  statuses: map,
});

module.exports = async function handler(req, res) {
  try {
    const params = query(req);
    const input = body(req);
    const project = params.get('project') || input.project;
    if (!project) throw store.httpError(400, 'project is required');

    if (req.method === 'GET') {
      if (params.get('history')) return ok(res, { history: store.statuses.history(project, params.get('limit')) });
      return reply(res, project, store.statuses.all(project));
    }

    if (req.method === 'PUT') return reply(res, project, store.statuses.set(project, input.ref, input.status));

    return notAllowed(res, 'GET, PUT');
  } catch (err) {
    return fail(res, err);
  }
};
