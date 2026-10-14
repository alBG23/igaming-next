# Data Accuracy: Implemented Behavior and Operator Guide

## What is currently implemented

The dashboard and its server routes consume protected backend data-accuracy APIs; they no longer manufacture financial values, parity claims, local findings, or healing results.

- `GET /api/data-accuracy/status` loads the backend cross-source comparison, persisted findings, QA-loop configuration, and recent loop runs. A missing backend configuration, unavailable service, or authorization error is surfaced rather than replaced with sample data.
- `POST /api/data-accuracy/reconcile?days=7` runs a read-only comparison for the last seven fully closed UTC days and requests backend discrepancy alerts. `days` must be an integer from 1 to 90.
- `GET /api/data-accuracy/parity-proof?days=7` proxies the backend's evidence report. The report is based on operator-supplied `bo_snapshot` values and exposes observed comparisons, gaps, missing values, coverage, and an evidence fingerprint. No-overlap is `UNVERIFIED`; unsupported provider/metric coverage is not implied.
- `POST /api/data-accuracy/autofix?on=true|false` forwards the existing backend operator switch. The backend's master remediation configuration and operator switch jointly gate automation. The UI disables the switch when the backend loop or master setting is disabled.
- `POST /api/data-accuracy/heal` is retired with HTTP 410. Individual frontend-triggered healing is intentionally unavailable; findings and risk-gated remediation remain under backend controls.
- `GET|POST /api/cron/data-reconciliation` is retired with HTTP 410. Scheduling is owned by the backend QA loop (`QA_LOOP_INTERVAL_MINUTES`; `0` disables the loop), not a mock Next.js cron route.

The current independent source is the operator-supplied Back Office snapshot. The comparator handles GGR, NGR, bonuses, deposits, and cashouts in native currency; affiliate commissions and other integrations are not claimed as covered. Comparison tolerance is currently 1%.

## Data flow and access

The Next.js server helper in `src/lib/data-accuracy/backend.ts` requires `NEXT_PUBLIC_API_URL`, forwards the incoming `ls_session` cookie and `Authorization` header, disables caching, and applies a request timeout. The backend endpoints enforce admin access. Do not add credentials to frontend code or environment files. A 401/403 indicates access must be resolved through the existing login/admin flow; a 503 indicates missing configuration or an unavailable backend.

The dashboard presents:

- observed match rate only when comparisons exist; otherwise it says **Unverified**;
- comparison/gap coverage and persisted open findings;
- source, application, and delta values per date/metric/currency;
- the backend loop status and operator auto-fix switch;
- a downloadable parity report that retains the backend's exact status and coverage.

It does not claim a universal 100% accuracy score or independently attest data it did not compare.

## GSD Core in this repository

GSD Core is vendored locally in `.github/gsd-core/` (version recorded in `.github/gsd-core/VERSION`). The installer adds repository Copilot configuration, GSD workflows/skills/references/templates, hooks, scripts, a manifest, install state, and a GSD section in `AGENTS.md`. The repository-local profile is Core and the Copilot-compatible setup is intended to work without a runtime network install.

Use the matching installed workflow/skill under `.github/skills/gsd-*` for an explicitly requested GSD operation. The generated `AGENTS.md` section describes command routing. Run GSD commands from this repository root so generated paths and state stay repository-local. Review `.github/gsd-file-manifest.json` and `git status` before committing; keep generated project data and environment files out of commits unless the task explicitly requires them.

## Verification

From `igaming-next/`:

```bash
npm run test:unit
npm run check:interactive
npm run type-check
npm run lint
npm run build
```

The unit suite includes focused tests for the data-accuracy server proxy: required configuration, forwarded admin context, no-store behavior, upstream status/body preservation, and explicit backend failures. The focused browser spec is `tests/e2e/data-accuracy.spec.ts`; it verifies the retired cron semantics, status API authorization/error behavior, and that the dashboard does not expose direct healing or claim fabricated parity.

For the full project preflight, run `./prod.sh --check-only` from the workspace root when its required local services/configuration are available. After code changes, run `graphify update .` from this repository root if Graphify is installed.

## Known operating limits

- The Back Office snapshot must be loaded independently before parity can be verified.
- Snapshot ingest remains operator-owned; this implementation does not invent or schedule a provider ingestion job.
- The frontend is not the remediation engine. Backend master settings, operator pause switch, and backend safety checks remain authoritative.
- Run history and findings may require backend database tables and valid admin authentication.
