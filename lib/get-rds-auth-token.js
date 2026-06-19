const { Signer } = require('@aws-sdk/rds-signer');

const DEFAULT_PORT = 5432;

async function getRdsAuthToken({ host, user, region, port = DEFAULT_PORT }) {
  if (!host) {
    throw new Error('"host" is required');
  }
  if (!user) {
    throw new Error('"user" is required');
  }

  const resolvedRegion = region || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  if (!resolvedRegion) {
    throw new Error('No region provided. Pass "region" or set AWS_REGION/AWS_DEFAULT_REGION.');
  }

  const signer = new Signer({
    hostname: host,
    port,
    username: user,
    region: resolvedRegion,
  });

  return signer.getAuthToken();
}

module.exports = { getRdsAuthToken, DEFAULT_PORT };
