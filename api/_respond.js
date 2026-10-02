'use strict';

const send = (res, code, body) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const ok = (res, body) => send(res, 200, { ok: true, ...body });

const fail = (res, err) => send(res, err && err.status ? err.status : 500, {
  ok: false,
  error: String((err && err.message) || err),
});

const query = req => new URL(req.url, 'http://localhost').searchParams;

const body = req => (req.body && typeof req.body === 'object' ? req.body : {});

const notAllowed = (res, allow) => {
  res.setHeader('Allow', allow);
  return send(res, 405, { ok: false, error: 'method not allowed' });
};

module.exports = { send, ok, fail, query, body, notAllowed };
