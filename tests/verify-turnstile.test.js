const assert = require('node:assert/strict');
const { test } = require('node:test');
const handler = require('../api/verify-turnstile');
const configHandler = require('../api/turnstile-config');

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

function configureEnvironment(t, hostname = 'chez-soso.vercel.app') {
  const previous = {
    secret: process.env.TURNSTILE_SECRET_KEY,
    hostname: process.env.TURNSTILE_HOSTNAME,
    environment: process.env.VERCEL_ENV
  };
  process.env.TURNSTILE_SECRET_KEY = 'test-secret';
  process.env.TURNSTILE_HOSTNAME = hostname;
  process.env.VERCEL_ENV = 'production';
  t.after(() => {
    if (previous.secret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = previous.secret;
    if (previous.hostname === undefined) delete process.env.TURNSTILE_HOSTNAME;
    else process.env.TURNSTILE_HOSTNAME = previous.hostname;
    if (previous.environment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous.environment;
  });
}

function createRequest(overrides = {}) {
  return {
    method: 'POST',
    headers: { origin: 'https://chez-soso.vercel.app' },
    body: { action: 'order', token: 'valid-test-token' },
    ...overrides
  };
}

test('rejects methods other than POST', async () => {
  const response = createResponse();
  await handler(createRequest({ method: 'GET' }), response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'POST');
});

test('does not expose an empty site key when Turnstile is not configured', async (t) => {
  const previous = process.env.TURNSTILE_SITE_KEY;
  delete process.env.TURNSTILE_SITE_KEY;
  t.after(() => {
    if (previous === undefined) delete process.env.TURNSTILE_SITE_KEY;
    else process.env.TURNSTILE_SITE_KEY = previous;
  });

  const response = createResponse();
  configHandler({ method: 'GET' }, response);

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error, 'turnstile-not-configured');
});

test('does not expose a site key when server-only verification settings are missing', async (t) => {
  const previous = {
    siteKey: process.env.TURNSTILE_SITE_KEY,
    secret: process.env.TURNSTILE_SECRET_KEY,
    hostname: process.env.TURNSTILE_HOSTNAME
  };
  process.env.TURNSTILE_SITE_KEY = 'test-site-key';
  delete process.env.TURNSTILE_SECRET_KEY;
  process.env.TURNSTILE_HOSTNAME = 'chez-soso.vercel.app';
  t.after(() => {
    if (previous.siteKey === undefined) delete process.env.TURNSTILE_SITE_KEY;
    else process.env.TURNSTILE_SITE_KEY = previous.siteKey;
    if (previous.secret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = previous.secret;
    if (previous.hostname === undefined) delete process.env.TURNSTILE_HOSTNAME;
    else process.env.TURNSTILE_HOSTNAME = previous.hostname;
  });

  const response = createResponse();
  configHandler({ method: 'GET' }, response);

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error, 'turnstile-not-configured');
});

test('rejects a token request from an untrusted origin before calling Siteverify', async (t) => {
  configureEnvironment(t);
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('Siteverify must not be called for an untrusted origin.');
  };
  t.after(() => { global.fetch = originalFetch; });

  const response = createResponse();
  await handler(createRequest({ headers: { origin: 'https://attacker.example' } }), response);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, 'invalid-origin');
});

test('allows HTTP localhost only in Vercel development with a matching hostname', async (t) => {
  configureEnvironment(t, 'localhost');
  process.env.VERCEL_ENV = 'development';
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      success: true,
      action: 'order',
      hostname: 'localhost'
    })
  });
  t.after(() => {
    global.fetch = originalFetch;
  });

  const response = createResponse();
  await handler(createRequest({ headers: { origin: 'http://localhost:3000' } }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('accepts a Turnstile token only when its action and hostname match', async (t) => {
  configureEnvironment(t);
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(new URLSearchParams(options.body).get('secret'), 'test-secret');
    assert.equal(new URLSearchParams(options.body).get('response'), 'valid-test-token');
    return {
      ok: true,
      json: async () => ({
        success: true,
        action: 'order',
        hostname: 'chez-soso.vercel.app'
      })
    };
  };
  t.after(() => { global.fetch = originalFetch; });

  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('rejects a successful Siteverify response for a different action', async (t) => {
  configureEnvironment(t);
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      success: true,
      action: 'reservation',
      hostname: 'chez-soso.vercel.app'
    })
  });
  t.after(() => { global.fetch = originalFetch; });

  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, 'verification-rejected');
});

test('rejects a successful Siteverify response for a different hostname', async (t) => {
  configureEnvironment(t);
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      success: true,
      action: 'order',
      hostname: 'attacker.example'
    })
  });
  t.after(() => { global.fetch = originalFetch; });

  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, 'verification-rejected');
});
