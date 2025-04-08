-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    username TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    country_code TEXT,
    currency TEXT DEFAULT 'USD',
    balance DECIMAL(15,2) DEFAULT 0.00,
    total_deposits DECIMAL(15,2) DEFAULT 0.00,
    total_withdrawals DECIMAL(15,2) DEFAULT 0.00,
    total_wagered DECIMAL(15,2) DEFAULT 0.00,
    total_winnings DECIMAL(15,2) DEFAULT 0.00
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    player_id UUID REFERENCES public.players(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet', 'win', 'bonus')),
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    reference_id TEXT,
    metadata JSONB
);

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    player_id UUID REFERENCES public.players(id) NOT NULL,
    game_id UUID REFERENCES public.games(id) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_wagered DECIMAL(15,2) DEFAULT 0.00,
    total_winnings DECIMAL(15,2) DEFAULT 0.00,
    session_duration INTEGER -- in seconds
);

-- Create dashboard_metrics view
CREATE OR REPLACE VIEW public.dashboard_metrics AS
SELECT 
    COUNT(DISTINCT p.id) as total_players,
    COUNT(DISTINCT CASE WHEN p.last_login >= NOW() - INTERVAL '30 days' THEN p.id END) as active_players,
    COALESCE(AVG(gs.session_duration), 0) as avg_session_time,
    ROUND(
        COUNT(DISTINCT CASE WHEN p.last_login >= NOW() - INTERVAL '30 days' THEN p.id END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT p.id), 0) * 100,
        2
    ) as retention_rate
FROM public.players p
LEFT JOIN public.game_sessions gs ON p.id = gs.player_id;

-- Create revenue_metrics view
CREATE OR REPLACE VIEW public.revenue_metrics AS
SELECT 
    DATE_TRUNC('month', t.created_at) as month,
    SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END) as total_payouts,
    SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) - 
    SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END) as net_revenue
FROM public.transactions t
WHERE t.status = 'completed'
GROUP BY DATE_TRUNC('month', t.created_at)
ORDER BY month DESC;

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous read access to players" ON public.players
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to transactions" ON public.transactions
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to games" ON public.games
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to game_sessions" ON public.game_sessions
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_last_login ON public.players(last_login);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON public.game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON public.game_sessions(game_id); 