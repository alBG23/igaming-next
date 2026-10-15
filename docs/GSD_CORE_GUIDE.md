# GSD Core in igaming-next

## Implemented

This repository vendors **GSD Core 1.16.0** locally under `.github/gsd-core/`
with Copilot integration and the Core profile. It introduces no app runtime
package and does not download workflow files during application execution.

Checked-in additions include:

- the version-pinned `.github/gsd-core/` runtime, workflow definitions,
  templates, and reference material;
- eight local skill entry points under `.github/skills/`: help, new-project,
  phase, discuss-phase, plan-phase, execute-phase, surface, and update;
- `.github/copilot-instructions.md`, a GSD-managed `AGENTS.md` section,
  integration hooks, and helper scripts;
- `.github/.gsd-profile`, `.github/gsd-install-state.json`, and
  `.github/gsd-file-manifest.json` for profile selection, migration state, and
  managed-file tracking.

GSD is an authoring workflow only; it does not alter Next.js runtime behavior,
add CI jobs, configure deployment, or change environment values.

## Using GSD

Open Copilot Chat in this repository and invoke one of the installed skills,
such as `/gsd-help`, `/gsd-new-project`, `/gsd-phase`, or `/gsd-plan-phase`.
The local GSD instructions route explicit `/gsd-*` requests to the matching
skill file under `.github/skills/`. Keep the chat rooted in `igaming-next`;
the backend repository has an independent GSD installation and state.

To review or update the integration, inspect `.github/gsd-file-manifest.json`
and `.github/gsd-install-state.json` first. Review generated diffs and retain
any unrelated working-tree changes. Use a disposable feature branch for
workflow experiments.

## Test and inspect the install

From `igaming-next/`, verify the pinned version and local entry points:

```bash
cat .github/gsd-core/VERSION
find .github/skills -maxdepth 1 -type d -name 'gsd-*' -print
node -e "const m=require('./.github/gsd-file-manifest.json'); console.log('Manifest entries:', Object.keys(m.files).length)"
```

In Copilot Chat, invoke `/gsd-help` and confirm it resolves to the local skill
in `.github/skills/gsd-help`. For an end-to-end workflow smoke test, use a
disposable branch, ask for a narrowly scoped plan, and inspect `git status
--short` before accepting generated edits. Do not use GSD to write environment
files or real secrets.

## Validate the accompanying data-accuracy integration

The dashboard now proxies protected backend comparison, parity-proof, finding,
and loop endpoints. The evidence source is the operator-supplied Back Office
snapshot; absence of comparison overlap is reported as unverified. Direct UI
healing and the frontend cron implementation are retired; backend QA-loop
settings and remediation safeguards remain authoritative. See
`DATA_ACCURACY_PLAN.md` for scope, endpoints, and operating limits.

Run the focused application checks:

```bash
npm run test:unit
npm run check:interactive
npm run type-check
npm run lint
```

The unit runner includes tests for backend URL fail-fast behavior, forwarding
of the session cookie and authorization header, disabled caching, preserving
backend errors, and explicit unavailable responses. The browser spec is
`tests/e2e/data-accuracy.spec.ts`; its backend smoke checks accept only evidence,
access-denied, or explicit unavailable responses, not HTTP 500. Run the
production bundle with `npm run build`; use the workspace
`./prod.sh --check-only` for the complete preflight when the required local
services are available.
