import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== Supabase Configuration ===')
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key (first 10 chars):', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'missing')
console.log('Environment:', process.env.NODE_ENV)
console.log('=============================')

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    }
  }
)

// Test the connection with a simple query to users_view
export async function testSupabaseConnection() {
  console.log('=== Testing Supabase Connection ===')
  try {
    // First try a simple query to test the connection
    console.log('Attempting to query users_view...')
    const { data, error } = await supabase
      .from('users_view')
      .select('id, email, created_at')
      .limit(1)

    if (error) {
      console.error('Supabase query error:', error)
      return { 
        connected: false, 
        error: error.message,
        details: error
      }
    }

    console.log('Successfully connected to Supabase. Sample data:', data)
    return { 
      connected: true, 
      error: null,
      sampleData: data
    }
  } catch (error) {
    console.error('Supabase connection error:', error)
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    }
  }
}

// Function to get dashboard metrics
export async function getDashboardMetrics() {
  try {
    // Get active users count (users who have logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('users_view')
      .select('id')
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString())
      .not('last_sign_in_at', 'is', null);

    if (activeUsersError) throw activeUsersError;

    // Get recent payments
    const { data: recentPayments, error: paymentsError } = await supabase
      .from('payments_view')
      .select(`
        id,
        created_at,
        amount_cents,
        currency,
        action,
        success
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) throw paymentsError;

    // Get revenue metrics from api_reports
    const { data: revenueData, error: revenueError } = await supabase
      .from('api_reports')
      .select(`
        date,
        deposits_sum,
        cashouts_sum,
        ggr,
        ngr
      `)
      .order('date', { ascending: false })
      .limit(30);

    if (revenueError) throw revenueError;

    return {
      activeUsers: activeUsers?.length || 0,
      recentPayments,
      revenueData
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

// Players Report
export async function getPlayersData({ page = 1, pageSize = 10, searchQuery = '' }) {
  try {
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('users_view')
      .select(`
        id,
        email,
        created_at,
        last_sign_in_at,
        suspended,
        disabled,
        confirmed_at,
        tags,
        ctag
      `)
      .order('created_at', { ascending: false });

    // Add search if provided
    if (searchQuery) {
      query = query.or(`email.ilike.%${searchQuery}%,tags.ilike.%${searchQuery}%`);
    }

    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return { data, count };
  } catch (error) {
    console.error('Error fetching players data:', error);
    throw error;
  }
}

// Payments Report
export async function getPaymentsData({ 
  startDate, 
  endDate, 
  page = 1, 
  pageSize = 10,
  filters = {}
}) {
  try {
    let query = supabase
      .from('payments_view')
      .select(`
        id,
        created_at,
        finished_at,
        user_id,
        action,
        success,
        amount_cents,
        currency,
        account,
        payment_system_id,
        payment_code,
        tx
      `)
      .order('created_at', { ascending: false });

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply additional filters
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.success !== undefined) {
      query = query.eq('success', filters.success);
    }
    if (filters.currency) {
      query = query.eq('currency', filters.currency);
    }

    const offset = (page - 1) * pageSize;
    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return { data, count };
  } catch (error) {
    console.error('Error fetching payments data:', error);
    throw error;
  }
}

// Casino Games Report
export async function getCasinoGamesData({
  startDate,
  endDate,
  page = 1,
  pageSize = 10
}) {
  try {
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('casino_games_view')
      .select(`
        id,
        created_at,
        finished_at,
        account_id,
        game_id,
        bets_sum,
        payoff_sum,
        balance_before,
        balance_after,
        jackpot_win_cents
      `)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return { data, count };
  } catch (error) {
    console.error('Error fetching casino games data:', error);
    throw error;
  }
}

// Games Catalog
export async function getGamesCatalog({
  page = 1,
  pageSize = 10,
  filters = {}
}) {
  try {
    let query = supabase
      .from('a8r_games_view')
      .select(`
        id,
        title,
        provider,
        producer,
        category,
        devices,
        payout,
        jackpot,
        freespins,
        live,
        feature_group,
        released_at
      `)
      .order('title');

    if (filters.provider) {
      query = query.eq('provider', filters.provider);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const offset = (page - 1) * pageSize;
    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return { data, count };
  } catch (error) {
    console.error('Error fetching games catalog:', error);
    throw error;
  }
}

// Affiliate Reports
export async function getAffiliateReports({
  startDate,
  endDate,
  page = 1,
  pageSize = 10
}) {
  try {
    // Get income reports
    const { data: incomeData, error: incomeError } = await supabase
      .from('income_reports')
      .select(`
        id,
        date,
        partner_id,
        currency,
        partner_income
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (incomeError) throw incomeError;

    // Get traffic reports
    const { data: trafficData, error: trafficError } = await supabase
      .from('traffic_reports')
      .select(`
        id,
        date,
        foreign_partner_id,
        country,
        visits,
        clicks,
        registrations_count,
        deposits_count,
        ftd_count,
        cr,
        cd,
        cftd,
        rftd
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (trafficError) throw trafficError;

    // Get API reports
    const { data: apiData, error: apiError } = await supabase
      .from('api_reports')
      .select(`
        id,
        date,
        partner_id,
        currency,
        deposits_sum,
        cashouts_sum,
        ggr,
        ngr,
        clean_net_revenue,
        deposits_count,
        first_deposits_count,
        qualified_players_count,
        self_excluded_players_count
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (apiError) throw apiError;

    // Combine and process the data
    const combinedData = incomeData.map(income => {
      const traffic = trafficData.find(t => 
        t.foreign_partner_id === income.partner_id && 
        t.date.split('T')[0] === income.date.split('T')[0]
      );
      const api = apiData.find(a => 
        a.partner_id === income.partner_id && 
        a.date.split('T')[0] === income.date.split('T')[0]
      );

      return {
        ...income,
        traffic: traffic || null,
        api: api || null
      };
    });

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const paginatedData = combinedData.slice(offset, offset + pageSize);

    return {
      data: paginatedData,
      count: combinedData.length
    };
  } catch (error) {
    console.error('Error fetching affiliate reports:', error);
    throw error;
  }
}

// Get Bonus Data
export async function getBonusData({
  startDate,
  endDate,
  page = 1,
  pageSize = 10
}) {
  try {
    // Get bonus issues
    const { data: bonusData, error: bonusError } = await supabase
      .from('bonus_issues_view')
      .select(`
        id,
        created_at,
        account_id,
        title,
        status,
        amount_cents,
        amount_wager_cents,
        amount_locked_cents,
        valid_until,
        activated_at,
        finished_at,
        strategy
      `)
      .order('created_at', { ascending: false });

    if (bonusError) throw bonusError;

    // Get freespin issues
    const { data: freespinData, error: freespinError } = await supabase
      .from('freespin_issues_view')
      .select(`
        id,
        created_at,
        account_id,
        title,
        status,
        freespins_total,
        freespins_performed,
        win_amount_cents,
        valid_until,
        provider,
        games
      `)
      .order('created_at', { ascending: false });

    if (freespinError) throw freespinError;

    // Combine bonus and freespin data
    const combinedData = [
      ...bonusData.map(bonus => ({ ...bonus, type: 'bonus' })),
      ...freespinData.map(freespin => ({ ...freespin, type: 'freespin' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const paginatedData = combinedData.slice(offset, offset + pageSize);

    return {
      data: paginatedData,
      count: combinedData.length
    };
  } catch (error) {
    console.error('Error fetching bonus data:', error);
    throw error;
  }
}

// Test access to all views
export async function testAllViews() {
  console.log('=== Testing Access to All Views ===')
  const views = [
    'users_view',
    'payments_view',
    'casino_games_view',
    'a8r_games_view',
    'income_reports',
    'traffic_reports',
    'api_reports',
    'bonus_issues_view',
    'freespin_issues_view'
  ]

  const results = {}

  for (const view of views) {
    try {
      console.log(`Testing view: ${view}...`)
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .limit(1)

      if (error) {
        console.error(`Error accessing ${view}:`, error)
        results[view] = { success: false, error: error.message }
      } else {
        console.log(`Successfully accessed ${view}. Sample data:`, data)
        results[view] = { success: true, hasData: data && data.length > 0 }
      }
    } catch (error) {
      console.error(`Error testing ${view}:`, error)
      results[view] = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  return results
} 