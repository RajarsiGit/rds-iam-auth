# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small Node.js package that generates AWS RDS IAM authentication tokens, usable both as a global CLI (`rds-iam-auth`) and as a programmatic library (`require('rds-iam-auth')`). It wraps `@aws-sdk/rds-signer`.

## Commands

```bash
npm install        # install dependencies
npm i -g .          # install/reinstall this package globally as the `rds-iam-auth` CLI (must rerun after changing bin/lib/index.js for the global command to pick up changes)
rds-iam-auth --help # CLI usage
npm test            # run the test suite (node's built-in test runner, node --test)
```

There is no build step or lint config in this repo. Tests use Node's built-in `node:test` runner (no test framework dependency) — see `test/`.

## Architecture

The package separates CLI concerns from logic so the token-generation code is reusable both as a CLI and as a library:

- `lib/get-rds-auth-token.js` — core logic. Exports `getRdsAuthToken({ host, user, region, port })`, which validates inputs, resolves the AWS region (falls back to `AWS_REGION` / `AWS_DEFAULT_REGION` env vars), and calls `@aws-sdk/rds-signer`'s `Signer.getAuthToken()`. `DEFAULT_PORT` is `5432` (Postgres).
- `bin/rds-iam-auth.js` — CLI entry point (has the shebang, referenced by `package.json`'s `bin` field). Hand-rolled arg parsing (no external CLI-parsing dependency) for `--host/-h`, `--user/-u`, `--region/-r`, `--port/-p`, `--help`. Calls into `lib/get-rds-auth-token.js` and prints the token to stdout, or prints usage/errors to stderr with a non-zero exit code.
- `index.js` — programmatic entry point (`package.json`'s `main`). Just re-exports `getRdsAuthToken` and `DEFAULT_PORT` from `lib/`.
- `test/get-rds-auth-token.test.js` — unit tests for `lib/get-rds-auth-token.js`'s validation logic (missing `host`/`user`, missing region). Doesn't cover the actual `Signer.getAuthToken()` call, since that needs real AWS credentials/network — that part is `@aws-sdk/rds-signer`'s responsibility, not ours.
- `test/cli.test.js` — black-box tests for `bin/rds-iam-auth.js` that spawn it as a child process and assert on stdout/stderr/exit code for `--help`, missing/unknown args, and invalid `--port`. Doesn't exercise the success path for the same reason as above.

AWS credentials themselves are resolved via the default AWS SDK v3 credential chain (env vars, shared config/credentials file, EC2/ECS/Lambda role, etc.) — this package only handles producing the IAM auth token, not credential configuration.

## CI / Publishing

`.github/workflows/publish.yml` runs on every push to `main`: a `test` job (`npm ci && npm test`) gates a `publish` job. The publish job only runs `npm publish` if the current `package.json` version isn't already on the registry (so pushes without a version bump are a no-op, not a failure) — bump the version yourself before pushing to release. This workflow publishes to the **public npmjs.org registry** (`registry-url: https://registry.npmjs.org` in the workflow, auth via an `NPM_TOKEN` repo secret), which is separate from the local dev registry note below.

## Notes

- This is a Windows development environment. The Bash tool here is Git Bash; globally-installed npm CLIs (including this one) can fail under Git Bash specifically due to a stray `node`-named package shadowing the real Node binary in the global npm bin directory — this is an environment quirk unrelated to this package's code. Prefer PowerShell to verify the global CLI if Bash gives a confusing `command not found` error.
- Locally, npm is configured to use a SysCloud internal CodeArtifact registry (check `npm config get registry`), not the public npm registry. Manual/local publishing requires authenticating against that registry (e.g. `aws codeartifact login --tool npm ...`). This is unrelated to the GitHub Actions publish workflow above, which targets the public npmjs.org registry instead.
