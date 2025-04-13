# Database Documentation

## Overview
This document describes the database schema for the igaming platform, including table structures, relationships, and key metrics.

## Tables

### Users and Accounts
- `users_view`: User authentication and basic information
- `profiles_view`: Extended user profile information
- `accounts_view`: User account balances and status
- `players`: Player-specific information and statistics

### Payments and Financials
- `payments_view`: All payment transactions
  - Fields: id, user_id, amount_cents, currency, status, created_at, payment_system_id
- `payment_systems_view`: Available payment methods
- `balance_corrections_view`: Manual balance adjustments
- `revenue_metrics`: Aggregated revenue data
  - Fields: month, total_revenue, total_payouts, net_revenue
- `income_reports`: Partner income tracking
  - Fields: date, partner_id, currency, partner_income

### Gaming
- `casino_games_view`: Casino game catalog
- `a8r_games_view`: A8R game catalog
- `casino_modifications_view`: Game modifications and settings
- `tournament_players_view`: Tournament participation

### Bonuses and Promotions
- `bonus_issues_view`: Bonus campaigns and distributions
- `freespin_issues_view`: Free spin promotions

### Reporting and Analytics
- `dashboard_metrics`: Key performance indicators
- `api_reports`: API integration reports
- `traffic_reports`: Traffic and conversion metrics
  - Fields: date, foreign_partner_id, country, visits, clicks, registrations_count, deposits_count, ftd_count

## Key Metrics

### Dashboard Metrics
- Active Users (30-day)
- Total Revenue
- Net Revenue
- Success Rate
- Average Transaction Value

### Affiliate Metrics
- Partner Income
- Traffic Quality
- Conversion Rates
- Player Value

### Payment Metrics
- Transaction Volume
- Success Rate
- Payment Method Distribution
- Currency Distribution

### Acquisition Metrics
- New Users
- Registration Sources
- First Deposit Rate
- Cost per Acquisition

### Cohort Analysis
- Retention Rates
- Lifetime Value
- Churn Analysis
- Revenue per User 