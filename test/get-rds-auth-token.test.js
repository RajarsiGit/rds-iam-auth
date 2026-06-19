const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getRdsAuthToken, DEFAULT_PORT } = require('../lib/get-rds-auth-token');

test('DEFAULT_PORT is 5432', () => {
  assert.equal(DEFAULT_PORT, 5432);
});

test('throws when host is missing', async () => {
  await assert.rejects(
    () => getRdsAuthToken({ user: 'myuser', region: 'us-east-1' }),
    /"host" is required/
  );
});

test('throws when user is missing', async () => {
  await assert.rejects(
    () => getRdsAuthToken({ host: 'mydb.example.com', region: 'us-east-1' }),
    /"user" is required/
  );
});

test('throws when no region is provided and no env var is set', async (t) => {
  const prevRegion = process.env.AWS_REGION;
  const prevDefaultRegion = process.env.AWS_DEFAULT_REGION;
  delete process.env.AWS_REGION;
  delete process.env.AWS_DEFAULT_REGION;
  t.after(() => {
    if (prevRegion !== undefined) process.env.AWS_REGION = prevRegion;
    if (prevDefaultRegion !== undefined) process.env.AWS_DEFAULT_REGION = prevDefaultRegion;
  });

  await assert.rejects(
    () => getRdsAuthToken({ host: 'mydb.example.com', user: 'myuser' }),
    /No region provided/
  );
});
