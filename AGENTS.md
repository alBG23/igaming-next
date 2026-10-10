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

