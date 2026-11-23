const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

test('inline page scripts are valid JavaScript', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .filter((script) => script.trim());

  assert.ok(scripts.length > 0);
  scripts.forEach((script) => new vm.Script(script));
});

test('ambience section contains a single video element', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const ambience = html.match(/<section class="ambience"[\s\S]*?<\/section>/i)?.[0];

  assert.ok(ambience);
  assert.equal((ambience.match(/<video\b/gi) || []).length, 1);
});
