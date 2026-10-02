'use strict';

const store = require('../lib/store');
const { ok, fail, query, body, notAllowed } = require('./_respond');

const KINDS = { case: store.cases, suite: store.suites, group: store.groups };

module.exports = async function handler(req, res) {
  try {
    const params = query(req);
    const kind = params.get('kind') || 'case';
    const project = params.get('project');
    const id = params.get('id');
    const input = body(req);

    if (!KINDS[kind]) throw store.httpError(400, 'kind must be case, suite or group');

    if (req.method === 'POST') {
      if (!project) throw store.httpError(400, 'project is required');
      return ok(res, { [kind]: KINDS[kind].create(project, input) });
    }

    if (req.method === 'PUT') {
      if (!id) throw store.httpError(400, 'id is required');
      if (kind === 'case') return ok(res, { case: store.cases.update(Number(id), input) });
      if (!project) throw store.httpError(400, 'project is required');
      return ok(res, { [kind]: KINDS[kind].update(project, id, input) });
    }

    if (req.method === 'DELETE') {
      if (!id) throw store.httpError(400, 'id is required');
      if (kind === 'case') return ok(res, store.cases.remove(Number(id)));
      if (!project) throw store.httpError(400, 'project is required');
      return ok(res, KINDS[kind].remove(project, id));
    }

    return notAllowed(res, 'POST, PUT, DELETE');
  } catch (err) {
    return fail(res, err);
  }
};
