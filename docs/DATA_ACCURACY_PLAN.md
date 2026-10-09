# Data Accuracy & Continuous Reconciliation Architecture (P1)

## Executive Summary
In an iGaming analytics platform, operators make revenue share, payment processing, and player retention decisions based on reported numbers. One inaccurate NGR or deposit figure causes permanent loss of trust.

This document outlines the end-to-end plan to:
1. **Check and validate** platform data invariants.
2. **Constantly compare** local aggregated data against authoritative Sources of Truth (Softswiss, Affilka, Back Office).
3. **Dispatch proactive alerts** with SLA aging and recovery auto-closing.
4. **Auto-heal discrepancies safely** without risking data loss or masking upstream issues.

---

## 1. The Plan to Check

### A. Core Invariants (Write-Time Contracts)
- **Net Gaming Revenue (NGR) Identity**:
  $$\text{NGR} = \text{GGR} - \text{Total Bonuses} + \text{Net Corrections} \quad (\epsilon \le 0.01)$$
- **Subunit Multi-Currency Divisors**:
  - Fiat (EUR, USD, CAD, AUD): $\div 100$
  - Standard Crypto (BTC, LTC, DOGE): $\div 10^8$
  - Ethereum (ETH): $\div 10^9$ (ETH subunit scale has burned systems before)
- **Non-Negative Constraints**: Counts of deposits, withdrawals, players, and game rounds must strictly be $\ge 0$.

### B. Closed Days vs. Live Days Rule
- **Live Day (Today)**: Transactions, wager rounds, and deposits are *actively accruing*. Live comparisons against static snapshots inevitably diverge due to timing offsets. Today's metrics are labelled **Provisional / Live Accruing**.
- **Closed Days ($T-1$ and older)**: Financial books are closed and immutable. Closed days must tie **to the cent** against the external Source of Truth.

---

## 2. Constantly Compare vs. Source of Truth (SoT)

### Hierarchy of Sources of Truth
1. **Primary Gaming & Transaction Truth**: Softswiss Replica DB (`payments_view`, `accounts_view`, `casino_games_view_with_currency`).
2. **Attribution & Affiliate Truth**: Affilka API & `api_reports` (`user_id_in_casino`, `partner_id`).
3. **External Independent Anchor**: Operator Back Office (BO) KPI reports.

### Comparison Schedule & Engine
- **Intraday Reconciliation**: Automated cron job (`/api/cron/data-reconciliation`) running hourly over trailing 7 days.
- **Deep Nightly Verification**: Comprehensive 30-day window scan comparing all currency slices.
- **Divergence Metrics**:
  $$\text{Variance \%} = \frac{|\text{Prebuilt} - \text{Source}|}{\max(|\text{Source}|, 1)} \times 100$$
  - **Match**: Variance $< 0.1\%$
  - **Drift**: $0.1\% \le \text{Variance} \le 1.0\%$
  - **Mismatch**: Variance $> 1.0\%$

---

## 3. Alerting & Watchdog System

### A. Multi-Channel Alert Delivery
- **Telegram Bot Webhook**: High-priority alert channel for analytics engineers.
- **Slack Alert Channel**: Team incident visibility.
- **Incident Digest**: Multiple discrepancies within a single run are batched into a single formatted digest to prevent alert fatigue.

### B. SLA Aging & Escalation
- **Critical Mismatch SLA**: 4 Hours. If unresolved, the watchdog re-escalates with high urgency.
- **Warning Drift SLA**: 24 Hours.
- **Auto-Close on Recovery**: When subsequent runs confirm numbers now match the Source of Truth, the finding is marked `AUTO_CLOSED_RECOVERED` and an automated all-clear notification is sent.

---

## 4. Healing Engine: When Possible & Not Risky

Auto-healing must be **surgical, non-destructive, and risk-gated**. Blindly rebuilding can paper over real upstream replication failures.

### The Risk Assessment Matrix

| Condition | Classification | Action | Rationale |
|---|---|---|---|
| Prebuilt $<$ Source, Source $> 0$ | **SAFE_AUTO_HEAL** | Rebuild slice from source | Additive & restorative; restores missing transactions |
| Outdated Logic Version ($v < HEAD$) | **SAFE_AUTO_HEAL** | Re-run with HEAD logic | Self-corrects known bugs fixed in recent commits |
| Prebuilt $>$ Source, Source $\approx 0$ | **RISKY_MANUAL_REVIEW** | Quarantine + Alert | Source may be experiencing replication outage; rebuilding would wipe valid data |
| High Variance ($>€5,000$ or $>15\%$) | **RISKY_MANUAL_REVIEW** | Quarantine + Alert | Delta is too large for automated intervention |
| Live Window (Today) | **BLOCKED_LIVE_WINDOW** | Hold / Skip | Accruing day; healing would freeze unfinished state |
| Destructive Operation (Drop/Delete) | **FORBIDDEN** | Block | Deletions are never performed by automated healers |

### Safety Circuit Breakers
- **Daily Heal Budget**: Maximum 5 date-slices healed per run.
- **Monetary Delta Cap**: Maximum €10,000 total variance adjustment per run.
- **Master Kill-Switch**: Operator can pause automated healing instantly from Admin UI.
- **Audit Logging**: Every heal action writes to an immutable audit ledger with before/after timestamps and delta.

---

## 5. Endpoints & UI Interface

- `GET /api/cron/data-reconciliation`: Scheduled background reconciler & healer.
- `GET/POST /api/data-accuracy/reconcile`: Trigger manual or scheduled reconciliation pass.
- `POST /api/data-accuracy/heal`: Execute guarded safe auto-healing.
- `GET /api/data-accuracy/status`: Real-time system health, discrepancy list, and audit logs.
- `Admin UI > Data Accuracy Tab` & `/data-accuracy`: Unified visual management console.
