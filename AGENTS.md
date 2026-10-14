# Next.js Frontend Development Rules

1. **Do NOT Modify Environment Values or Files Unless Explicitly Requested**:
   - Never edit, overwrite, add, or clear `.env`, `.env.local`, or any env variables unless the user explicitly requests it.

2. **Preserve Fail-Fast `throw new Error` for Missing Environment Variables**:
   - Do NOT remove, bypass, or swallow `throw new Error(...)` checks that validate required environment variables (e.g. `if (!supabaseUrl) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')`).

3. **No Hardcoded Environment Values or Secrets**:
   - Never hardcode URLs (`http://localhost:3000`, `http://localhost:3001`, database connection strings, API keys) into source code.
   - Use `process.env.NEXT_PUBLIC_APP_URL`, `process.env.NEXT_PUBLIC_API_URL`, and `process.env.DATABASE_URL`.

4. **Always Verify URLs Before Providing Links**:
   - Never provide deployment, external, or service links without first checking that they respond and work (no 404s/errors). Only suggest links that are confirmed active.

5. **Cost Optimization & Free Tier Policy**:
   - Strictly configure cloud services for the Free tier (`plan: free`, 0 cost). Never use paid plans/addons unless requested. Reuse single free database instances via `DATABASE_URL` (`sync: false`).

6. **CI & GitHub Actions Build Verification**:
   - Verify CI builds succeed after push. Supply non-secret build-time placeholders in CI workflows so env checks pass during static build steps, and use `export const dynamic = 'force-dynamic'` on dynamic API routes.

7. **Always Provide Clickable Markdown Links**:
   - Always format URLs as clickable markdown links, especially [igaming-postgres-dev Dashboard](https://dashboard.render.com/d/dpg-db4cj4ijnfac73av4i40-a) and Render creation pages.

8. **Feature Interactivity & Usability Policy (MANDATORY)**:
   - All buttons, modals, dropdowns, filters, and controls must have functional handlers and do something when clicked.
   - Dummy buttons and empty callbacks (`onClick={() => {}}`) are prohibited.
   - Enforce with `npm run check:interactive` and in `check-build`.

9. **Verification Before Suggesting Fixes Policy (MANDATORY)**:
   - Always run, execute, and verify fixes locally before presenting or suggesting them for review.
   - Run type checks, linters, pre-commit checks, or relevant test suites to ensure the solution passes cleanly.
   - Never speculate or suggest an untested fix. Verify it first, confirm it works, and only then present for review.

10. **Production PR Pre-Flight Verification (`./prod.sh`) (MANDATORY)**:
    - Run `./prod.sh` to validate secret scanning, button interactivity (100%), TypeScript (`tsc --noEmit`), ESLint, and Next.js bundle builds (`next build`) before PRs.

11. **PR-Only Policy for Production (`main`) (MANDATORY)**:
    - NEVER commit or push directly to `main`.
    - Always create a dedicated branch (e.g. `feature/*`, `fix/*`), verify with `./prod.sh`, and merge to `main` exclusively via GitHub Pull Requests.

<!-- GSD Configuration — managed by gsd-core installer -->
# Instructions for GSD

- Use the gsd-core skill when the user asks for GSD or uses a `gsd-*` command.
- Treat `/gsd-...` or `gsd-...` as command invocations and load the matching file from `.github/skills/gsd-*`.
- When a command says to spawn a subagent, prefer a matching custom agent from `.github/agents`.
- Do not apply GSD workflows unless the user explicitly asks for them.
- After completing any `gsd-*` command (or any deliverable it triggers: feature, bug fix, tests, docs, etc.), ALWAYS: (1) offer the user the next step by prompting via `ask_user`; repeat this feedback loop until the user explicitly indicates they are done.
<!-- /GSD Configuration -->
