'use strict';

const store = require('../lib/store');
const { ok, fail, notAllowed } = require('./_respond');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') return notAllowed(res, 'GET');
    return ok(res, { projects: store.overview() });
  } catch (err) {
    return fail(res, err);
  }
};
