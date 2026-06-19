#!/usr/bin/env node

const { getRdsAuthToken, DEFAULT_PORT } = require('../lib/get-rds-auth-token');

const USAGE = `Usage: rds-iam-auth --host <endpoint> --user <username> [--region <region>] [--port <port>]

Options:
  --host, -h <endpoint>   RDS instance endpoint (required)
  --user, -u <username>   Database username (required)
  --region, -r <region>   AWS region (optional, defaults to AWS_REGION/AWS_DEFAULT_REGION env var)
  --port, -p <port>       Database port (optional, defaults to ${DEFAULT_PORT})
  --help                  Show this help message

AWS credentials are resolved via the default AWS SDK credential chain
(environment variables, shared config/credentials file, EC2/ECS/Lambda role, etc).
`;

function parseArgs(argv) {
  const args = { port: DEFAULT_PORT };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--host':
      case '-h':
        args.host = argv[++i];
        break;
      case '--user':
      case '-u':
        args.user = argv[++i];
        break;
      case '--region':
      case '-r':
        args.region = argv[++i];
        break;
      case '--port':
      case '-p': {
        const value = argv[++i];
        const port = Number(value);
        if (!Number.isInteger(port) || port <= 0) {
          throw new Error(`Invalid port: ${value}`);
        }
        args.port = port;
        break;
      }
      case '--help':
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`Error: ${err.message}\n`);
    console.error(USAGE);
    process.exit(1);
  }

  if (args.help) {
    console.log(USAGE);
    return;
  }

  const missing = ['host', 'user'].filter((key) => !args[key]);
  if (missing.length > 0) {
    console.error(`Error: missing required argument(s): ${missing.join(', ')}\n`);
    console.error(USAGE);
    process.exit(1);
  }

  try {
    const token = await getRdsAuthToken(args);
    console.log(token);
  } catch (err) {
    console.error(`Error generating RDS auth token: ${err.message}`);
    process.exit(1);
  }
}

main();
