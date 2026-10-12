# Multi-Tenant Security & AI Knowledge Isolation Plan (P2)

## 1. Overview & Objective
When onboarding multiple gaming operators onto Maximoos, a tenant accessing another operator's data or having the AI leak one casino's promotions/rules into another's response is an existential, contractual breach.

**Definition of Done:** Provable isolation at DB, Cache, and LLM layers — a tenant cannot read, query, or surface another tenant's data, backed by automated adversarial probes.

---

## 2. Layer-by-Layer Isolation Architecture

### A. Database (PostgreSQL) Row-Level Security (RLS)
- Every table includes a non-nullable `tenant_id` column.
- Policies enforce `USING (tenant_id = current_setting('app.current_tenant'))`.
- Unscoped queries cannot return rows across tenant boundaries.

### B. Redis Cache Partitioning
- Keys are strictly partitioned: `tenant:{tenant_id}:{resource_key}`.
- Shared / unscoped keys are forbidden.

### C. AI Context & Memory Isolation
- Retrieval-Augmented Generation (RAG) vector searches automatically inject a hard metadata filter: `tenant_id == active_tenant`.
- Custom prompt preambles and casino-specific business rules are dynamically loaded only for the verified active tenant.
- No cross-tenant learning or shared prompt history.

### D. RBAC & PII Masking
- Player emails, phone numbers, and payment tokens are dynamically redacted via masking middleware across all report paths.

---

## 3. Automated Adversarial Probes
- Synthetic automated tests simulate cross-tenant access attempts (`tenant_luckystart` -> `tenant_aurora`).
- Tests fail loudly if any probe returns anything other than `403 Forbidden` (`TenantIsolationViolationError`).
