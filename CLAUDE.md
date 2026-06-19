# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small Node.js package that generates AWS RDS IAM authentication tokens, usable both as a global CLI (`rds-iam-auth`) and as a programmatic library (`require('rds-iam-auth')`). It wraps `@aws-sdk/rds-signer`.

## Commands

```bash
npm install        # install dependencies
npm i -g .          # install/reinstall this package globally as the `rds-iam-auth` CLI (must rerun after changing bin/lib/index.js for the global command to pick up changes)
rds-iam-auth --help # CLI usage
```

There is no build step, lint config, or test suite in this repo.

## Architecture

The package separates CLI concerns from logic so the token-generation code is reusable both as a CLI and as a library:

- `lib/get-rds-auth-token.js` — core logic. Exports `getRdsAuthToken({ host, user, region, port })`, which validates inputs, resolves the AWS region (falls back to `AWS_REGION` / `AWS_DEFAULT_REGION` env vars), and calls `@aws-sdk/rds-signer`'s `Signer.getAuthToken()`. `DEFAULT_PORT` is `5432` (Postgres).
- `bin/rds-iam-auth.js` — CLI entry point (has the shebang, referenced by `package.json`'s `bin` field). Hand-rolled arg parsing (no external CLI-parsing dependency) for `--host/-h`, `--user/-u`, `--region/-r`, `--port/-p`, `--help`. Calls into `lib/get-rds-auth-token.js` and prints the token to stdout, or prints usage/errors to stderr with a non-zero exit code.
- `index.js` — programmatic entry point (`package.json`'s `main`). Just re-exports `getRdsAuthToken` and `DEFAULT_PORT` from `lib/`.

AWS credentials themselves are resolved via the default AWS SDK v3 credential chain (env vars, shared config/credentials file, EC2/ECS/Lambda role, etc.) — this package only handles producing the IAM auth token, not credential configuration.

## Notes

- This is a Windows development environment. The Bash tool here is Git Bash; globally-installed npm CLIs (including this one) can fail under Git Bash specifically due to a stray `node`-named package shadowing the real Node binary in the global npm bin directory — this is an environment quirk unrelated to this package's code. Prefer PowerShell to verify the global CLI if Bash gives a confusing `command not found` error.
- npm is configured to use a SysCloud internal CodeArtifact registry (check `npm config get registry`), not the public npm registry. Publishing requires authenticating against that registry (e.g. `aws codeartifact login --tool npm ...`).
