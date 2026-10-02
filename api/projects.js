'use strict';

const store = require('../lib/store');
const { ok, fail, query, body, notAllowed } = require('./_respond');

module.exports = async function handler(req, res) {
  try {
    const params = query(req);
    const id = params.get('id');
    const input = body(req);

    if (req.method === 'GET') {
      if (id && params.get('tree')) return ok(res, store.projects.tree(id));
      if (id) return ok(res, { project: store.projects.get(id) });
      return ok(res, { projects: store.projects.list() });
    }

    if (req.method === 'POST') return ok(res, { project: store.projects.create(input) });

    if (req.method === 'PUT') {
      if (!id) throw store.httpError(400, 'id is required');
      return ok(res, { project: store.projects.update(id, input) });
    }

    if (req.method === 'DELETE') {
      if (!id) throw store.httpError(400, 'id is required');
      return ok(res, store.projects.remove(id));
    }

    return notAllowed(res, 'GET, POST, PUT, DELETE');
  } catch (err) {
    return fail(res, err);
  }
};
