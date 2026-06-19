const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const CLI_PATH = path.join(__dirname, '..', 'bin', 'rds-iam-auth.js');

function runCli(args) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], { encoding: 'utf8' });
}

test('--help prints usage and exits 0', () => {
  const result = runCli(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: rds-iam-auth/);
});

test('missing required arguments exits non-zero with an error', () => {
  const result = runCli([]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing required argument\(s\): host, user/);
});

test('missing user only', () => {
  const result = runCli(['--host', 'mydb.example.com']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing required argument\(s\): user/);
});

test('unknown argument exits non-zero with an error', () => {
  const result = runCli(['--bogus']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown argument: --bogus/);
});

test('invalid port exits non-zero with an error', () => {
  const result = runCli(['--host', 'mydb.example.com', '--user', 'myuser', '--port', 'abc']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Invalid port: abc/);
});
