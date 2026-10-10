# Next.js Frontend Development Rules

1. **Do NOT Modify Environment Values or Files Unless Explicitly Requested**:
   - Never edit, overwrite, add, or clear `.env`, `.env.local`, or any env variables unless the user explicitly requests it.

2. **Preserve Fail-Fast `throw new Error` for Missing Environment Variables**:
   - Do NOT remove, bypass, or swallow `throw new Error(...)` checks that validate required environment variables (e.g. `if (!supabaseUrl) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')`).

3. **No Hardcoded Environment Values or Secrets**:
   - Never hardcode URLs (`http://localhost:3000`, `http://localhost:3001`, database connection strings, API keys) into source code.
   - Use `process.env.NEXT_PUBLIC_APP_URL`, `process.env.NEXT_PUBLIC_API_URL`, and `process.env.DATABASE_URL`.

