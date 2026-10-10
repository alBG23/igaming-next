-- ==============================================================================
-- Complete Supabase Database Schema for Bright iGaming Platform
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/omeuslijjxsqnkevybmv/sql
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users View / Table
CREATE TABLE IF NOT EXISTS public.users_view (
    id BIGINT PRIMARY KEY,
    disabled BOOLEAN DEFAULT false,
    email VARCHAR(255),
    tags VARCHAR(255),
    with_duplicates BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    locked_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    ctag TEXT,
    psp_trusted_level TEXT,
    suspended BOOLEAN DEFAULT false
);

-- 3. Payments View / Table
CREATE TABLE IF NOT EXISTS public.payments_view (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(255) DEFAULT 'deposit',
    processing BOOLEAN DEFAULT false,
    payment_system_id BIGINT,
    psp_system VARCHAR(255),
    amount_cents BIGINT DEFAULT 0,
    currency VARCHAR(255) DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    finished_at TIMESTAMP WITH TIME ZONE,
    success BOOLEAN DEFAULT true,
    payment_system VARCHAR(100)
);

-- 4. Revenue Metrics View
CREATE OR REPLACE VIEW public.revenue_metrics AS
SELECT 
    ROW_NUMBER() OVER () as id,
    DATE_TRUNC('month', created_at) as month,
    created_at,
    SUM(CASE WHEN action = 'deposit' AND success = true THEN amount_cents ELSE 0 END) / 100.0 as total_revenue,
    SUM(CASE WHEN action = 'withdrawal' AND success = true THEN amount_cents ELSE 0 END) / 100.0 as total_payouts,
    (SUM(CASE WHEN action = 'deposit' AND success = true THEN amount_cents ELSE 0 END) - 
     SUM(CASE WHEN action = 'withdrawal' AND success = true THEN amount_cents ELSE 0 END)) / 100.0 as net_revenue
FROM public.payments_view
GROUP BY DATE_TRUNC('month', created_at), created_at
ORDER BY created_at DESC;

-- 5. Casino Games View
CREATE TABLE IF NOT EXISTS public.casino_games_view (
    id BIGINT PRIMARY KEY,
    account_id BIGINT,
    balance_before BIGINT DEFAULT 0,
    bonus_issue_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    finished_at TIMESTAMP WITH TIME ZONE,
    balance_after BIGINT DEFAULT 0,
    bets_sum BIGINT DEFAULT 0,
    payoff_sum BIGINT DEFAULT 0,
    game_id BIGINT,
    exchange_rate_id BIGINT,
    jackpot_win_cents BIGINT DEFAULT 0
);

-- 6. Games Catalog (a8r_games_view)
CREATE TABLE IF NOT EXISTS public.a8r_games_view (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    variation VARCHAR(255),
    producer VARCHAR(255),
    released_at DATE,
    recalled_at DATE,
    category VARCHAR(255),
    live BOOLEAN DEFAULT false,
    hd BOOLEAN DEFAULT false,
    jackpot BOOLEAN DEFAULT false,
    freespins BOOLEAN DEFAULT false,
    accumulating BOOLEAN DEFAULT false,
    feature_group VARCHAR(255),
    devices TEXT[],
    multiplier NUMERIC,
    payout NUMERIC
);

-- 7. Traffic Reports
CREATE TABLE IF NOT EXISTS public.traffic_reports (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    foreign_partner_id VARCHAR(255),
    country VARCHAR(10),
    visits INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    registrations_count INTEGER DEFAULT 0,
    deposits_count INTEGER DEFAULT 0,
    ftd_count INTEGER DEFAULT 0,
    cr NUMERIC DEFAULT 0,
    cd NUMERIC DEFAULT 0,
    cftd NUMERIC DEFAULT 0,
    rftd NUMERIC DEFAULT 0
);

-- 8. Income Reports
CREATE TABLE IF NOT EXISTS public.income_reports (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    partner_id VARCHAR(255),
    partner_name VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'EUR',
    partner_income NUMERIC DEFAULT 0
);

-- 9. API Reports (Affilka)
CREATE TABLE IF NOT EXISTS public.api_reports (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    partner_id VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'EUR',
    deposits_sum NUMERIC DEFAULT 0,
    cashouts_sum NUMERIC DEFAULT 0,
    ggr NUMERIC DEFAULT 0,
    ngr NUMERIC DEFAULT 0,
    clean_net_revenue NUMERIC DEFAULT 0,
    deposits_count INTEGER DEFAULT 0,
    first_deposits_count INTEGER DEFAULT 0,
    qualified_players_count INTEGER DEFAULT 0,
    self_excluded_players_count INTEGER DEFAULT 0
);

-- 10. Affiliates View
CREATE TABLE IF NOT EXISTS public.affiliates_view (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    budget NUMERIC DEFAULT 0,
    spent NUMERIC DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr NUMERIC DEFAULT 0,
    cpc NUMERIC DEFAULT 0,
    cpa NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. Player Cohorts Table
CREATE TABLE IF NOT EXISTS public.player_cohorts (
    id SERIAL PRIMARY KEY,
    cohort_date DATE NOT NULL,
    player_count INTEGER DEFAULT 0,
    retention_d1 NUMERIC DEFAULT 0,
    retention_d7 NUMERIC DEFAULT 0,
    retention_d30 NUMERIC DEFAULT 0,
    retention_d90 NUMERIC DEFAULT 0,
    avg_first_deposit NUMERIC DEFAULT 0,
    avg_lifetime_value NUMERIC DEFAULT 0,
    conversion_rate NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 13. Player Value Metrics & Trends
CREATE TABLE IF NOT EXISTS public.player_value_metrics (
    id SERIAL PRIMARY KEY,
    total_players INTEGER DEFAULT 0,
    avg_ltv NUMERIC DEFAULT 0,
    churn_rate NUMERIC DEFAULT 0,
    active_rate NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.player_value_trend (
    id SERIAL PRIMARY KEY,
    month VARCHAR(20) NOT NULL,
    value NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 14. Players Table
CREATE TABLE IF NOT EXISTS public.players (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_sign_in_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 15. Dashboard Metrics View
CREATE OR REPLACE VIEW public.dashboard_metrics AS
SELECT 
    COUNT(DISTINCT id) as total_players,
    COUNT(DISTINCT CASE WHEN last_sign_in_at >= NOW() - INTERVAL '30 days' THEN id END) as active_players,
    0 as avg_session_time,
    ROUND(
        COUNT(DISTINCT CASE WHEN last_sign_in_at >= NOW() - INTERVAL '30 days' THEN id END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT id), 0) * 100,
        2
    ) as retention_rate
FROM public.users_view;

-- ==============================================================================
-- 16. Grant PostgREST API Permissions (MANDATORY FOR SUPABASE)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- ==============================================================================
-- 17. Seed Sample Data (Prevents Blank Dashboards)
-- ==============================================================================
INSERT INTO public.users_view (id, email, created_at, last_sign_in_at)
VALUES 
    (101, 'player1@bright.io', NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day'),
    (102, 'player2@bright.io', NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),
    (103, 'player3@bright.io', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 hours'),
    (104, 'player4@bright.io', NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days'),
    (105, 'player5@bright.io', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.affiliates_view (id, name)
VALUES 
    (1, 'TopAffiliate Global'),
    (2, 'AlphaPartners')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payments_view (id, user_id, action, amount_cents, currency, success, payment_system, created_at)
VALUES 
    (1001, 101, 'deposit', 5000, 'EUR', true, 'Visa', NOW() - INTERVAL '14 days'),
    (1002, 102, 'deposit', 12000, 'EUR', true, 'Mastercard', NOW() - INTERVAL '19 days'),
    (1003, 103, 'deposit', 3500, 'EUR', true, 'Crypto', NOW() - INTERVAL '4 days'),
    (1004, 101, 'withdrawal', 2000, 'EUR', true, 'BankTransfer', NOW() - INTERVAL '7 days'),
    (1005, 105, 'deposit', 10000, 'EUR', true, 'Visa', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.traffic_reports (date, foreign_partner_id, country, visits, clicks, registrations_count, deposits_count, ftd_count)
VALUES 
    (CURRENT_DATE - INTERVAL '5 days', 'AlphaPartners', 'DE', 1200, 350, 45, 20, 15),
    (CURRENT_DATE - INTERVAL '4 days', 'TopAffiliate', 'GB', 950, 280, 30, 18, 12),
    (CURRENT_DATE - INTERVAL '3 days', 'AlphaPartners', 'FR', 1500, 420, 55, 25, 20),
    (CURRENT_DATE - INTERVAL '2 days', 'Organic', 'CA', 600, 150, 20, 10, 8),
    (CURRENT_DATE - INTERVAL '1 day', 'TopAffiliate', 'DE', 1100, 310, 40, 22, 17)
ON CONFLICT DO NOTHING;

INSERT INTO public.income_reports (date, partner_id, partner_name, currency, partner_income)
VALUES 
    (CURRENT_DATE - INTERVAL '5 days', '1', 'TopAffiliate Global', 'EUR', 450.00),
    (CURRENT_DATE - INTERVAL '3 days', '2', 'AlphaPartners', 'EUR', 720.50),
    (CURRENT_DATE - INTERVAL '1 day', '1', 'TopAffiliate Global', 'EUR', 610.00)
ON CONFLICT DO NOTHING;

INSERT INTO public.player_cohorts (cohort_date, player_count, retention_d1, retention_d7, retention_d30, retention_d90, avg_first_deposit, avg_lifetime_value, conversion_rate)
VALUES 
    (CURRENT_DATE - INTERVAL '60 days', 120, 45.5, 28.3, 18.0, 12.5, 45.0, 160.0, 35.0),
    (CURRENT_DATE - INTERVAL '30 days', 180, 52.0, 32.1, 22.4, 15.0, 55.0, 195.0, 42.0),
    (CURRENT_DATE - INTERVAL '15 days', 210, 58.2, 36.5, 25.0, 0, 60.0, 140.0, 48.0)
ON CONFLICT DO NOTHING;

INSERT INTO public.player_value_metrics (total_players, avg_ltv, churn_rate, active_rate)
VALUES (515, 185.50, 14.2, 68.5)
ON CONFLICT DO NOTHING;

INSERT INTO public.player_value_trend (month, value)
VALUES 
    ('May', 12000),
    ('Jun', 14500),
    ('Jul', 17200),
    ('Aug', 19800),
    ('Sep', 23400),
    ('Oct', 26100)
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
