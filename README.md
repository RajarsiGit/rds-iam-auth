# rds-iam-auth

Generate AWS RDS IAM authentication tokens, usable both as a CLI and as a library. Wraps [`@aws-sdk/rds-signer`](https://www.npmjs.com/package/@aws-sdk/rds-signer).

## Install

### As a global CLI (from the registry)

The `-g` flag is required to use `rds-iam-auth` as a CLI command — without it, npm installs locally and won't put the command on your `PATH`.

```bash
npm i -g rds-iam-auth
```

This installs the `rds-iam-auth` command on your `PATH`, usable from any directory. Requires npm to be pointed at the registry this package is published to (`npm config get registry`), and that you're authenticated against it if it's a private registry.

### As a library dependency (from the registry)

```bash
npm install rds-iam-auth
```

Adds it to your project's `package.json` so you can `require('rds-iam-auth')` (see [Programmatic usage](#programmatic-usage) below). Same registry/authentication requirements as above.

### From source (local development)

```bash
npm install
```

To test changes as the global CLI without publishing:

```bash
npm i -g .
```

Rerun `npm i -g .` after any code change to pick it up in the globally installed command.

## CLI usage

```bash
rds-iam-auth --host <endpoint> --user <username> [--region <region>] [--port <port>]
```

| Flag | Alias | Required | Description |
| --- | --- | --- | --- |
| `--host` | `-h` | yes | RDS instance endpoint |
| `--user` | `-u` | yes | Database username |
| `--region` | `-r` | no | AWS region. Falls back to `AWS_REGION` / `AWS_DEFAULT_REGION` env vars |
| `--port` | `-p` | no | Database port. Defaults to `5432` (Postgres) |
| `--help` | | | Show usage |

Example:

```bash
rds-iam-auth --host mydb.abc123.us-east-1.rds.amazonaws.com --user myuser --region us-east-1
```

The generated token is printed to stdout. Errors and usage text go to stderr, with a non-zero exit code on failure.

AWS credentials are resolved via the default AWS SDK v3 credential chain (environment variables, shared config/credentials file, EC2/ECS/Lambda role, etc.) — this package only generates the IAM auth token, it does not configure AWS credentials itself.

## Programmatic usage

```js
const { getRdsAuthToken } = require('rds-iam-auth');

const token = await getRdsAuthToken({
  host: 'mydb.abc123.us-east-1.rds.amazonaws.com',
  user: 'myuser',
  region: 'us-east-1', // optional, falls back to AWS_REGION / AWS_DEFAULT_REGION
  port: 5432,          // optional, defaults to 5432
});
```

## Project structure

- `lib/get-rds-auth-token.js` — core logic (`getRdsAuthToken`, `DEFAULT_PORT`)
- `bin/rds-iam-auth.js` — CLI entry point
- `index.js` — programmatic entry point, re-exports from `lib/`

## Notes

- On Windows, if the globally installed CLI fails under Git Bash with a confusing error, try PowerShell or cmd.exe instead — this is an environment quirk unrelated to this package.
