import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

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
const supabase = createClient<Database>(
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

export { supabase }

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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    // Get active users count (users who have logged in within last 30 days)
    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('users_view')
      .select('id')
      .gte('last_sign_in_at', thirtyDaysAgoStr)
      .not('last_sign_in_at', 'is', null);

    if (activeUsersError) throw activeUsersError;

    // Get recent successful payments
    const { data: recentPayments, error: paymentsError } = await supabase
      .from('payments_view')
      .select(`
        id,
        created_at,
        amount_cents,
        currency,
        action,
        success,
        user_id
      `)
      .eq('success', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) throw paymentsError;

    // Get daily payment totals
    const { data: dailyPayments, error: dailyPaymentsError } = await supabase
      .from('payments_view')
      .select(`
        created_at,
        action,
        amount_cents,
        currency
      `)
      .eq('success', true)
      .gte('created_at', thirtyDaysAgoStr)
      .order('created_at', { ascending: false });

    if (dailyPaymentsError) throw dailyPaymentsError;

    // Get casino game results
    const { data: gameResults, error: gameResultsError } = await supabase
      .from('casino_games_view')
      .select(`
        created_at,
        bet_amount,
        win_amount,
        user_id
      `)
      .gte('created_at', thirtyDaysAgoStr)
      .order('created_at', { ascending: false });

    if (gameResultsError) throw gameResultsError;

    // Process the data
    const processedData = processMetrics(dailyPayments, gameResults);

    return {
      activeUsers: activeUsers?.length || 0,
      recentPayments: recentPayments?.map(payment => ({
        ...payment,
        amount_cents: Number(payment.amount_cents)
      })) || [],
      revenueData: processedData
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

// Helper function to process metrics
function processMetrics(payments: any[], games: any[]) {
  const dailyMetrics: Record<string, {
    date: string;
    deposits_sum: number;
    cashouts_sum: number;
    ggr: number;
    ngr: number;
  }> = {};

  // Process payments
  payments.forEach(payment => {
    const date = new Date(payment.created_at).toISOString().split('T')[0];
    if (!dailyMetrics[date]) {
      dailyMetrics[date] = {
        date,
        deposits_sum: 0,
        cashouts_sum: 0,
        ggr: 0,
        ngr: 0
      };
    }

    const amount = Number(payment.amount_cents) || 0;
    if (payment.action === 'deposit') {
      dailyMetrics[date].deposits_sum += amount;
    } else if (payment.action === 'cashout') {
      dailyMetrics[date].cashouts_sum += amount;
    }
  });

  // Process game results
  games.forEach(game => {
    const date = new Date(game.created_at).toISOString().split('T')[0];
    if (!dailyMetrics[date]) {
      dailyMetrics[date] = {
        date,
        deposits_sum: 0,
        cashouts_sum: 0,
        ggr: 0,
        ngr: 0
      };
    }

    const betAmount = Number(game.bet_amount) || 0;
    const winAmount = Number(game.win_amount) || 0;
    dailyMetrics[date].ggr += betAmount - winAmount;
  });

  // Calculate NGR (GGR for now, since we don't have bonus data)
  Object.values(dailyMetrics).forEach(metric => {
    metric.ngr = metric.ggr; // In a real implementation, we would subtract bonuses here
  });

  // Convert to array and sort by date
  return Object.values(dailyMetrics)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Players Report
export async function getPlayersData({ page = 1, pageSize = 10, searchQuery = '' }) {
  try {
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('users_view')
      .select('*')
      .order('created_at', { ascending: false });

    // Add search if provided
    if (searchQuery) {
      query = query.or(`email.ilike.%${searchQuery}%,tags.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query.range(offset, offset + pageSize - 1);
    const countQuery = await query.select('id');

    if (error) throw error;

    return { data, count: countQuery.data?.length || 0 };
  } catch (error) {
    console.error('Error fetching players data:', error);
    throw error;
  }
}

interface GetCasinoGamesDataParams {
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
}

interface GetGamesCatalogParams {
  page?: number;
  pageSize?: number;
  filters: {
    provider?: string;
    category?: string;
  };
}

export async function getCasinoGamesData({
  startDate,
  endDate,
  page = 1,
  pageSize = 10
}: GetCasinoGamesDataParams) {
  try {
    const offset = (page - 1) * pageSize;
    let query = supabase
      .from('game_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { data, error } = await query.range(offset, offset + pageSize - 1);
    const countQuery = await query.select('id');

    if (error) throw error;

    return {
      data: data?.map(session => ({
        ...session,
        bet_amount_cents: Number(session.bet_amount_cents),
        win_amount_cents: Number(session.win_amount_cents)
      })) || [],
      count: countQuery.data?.length || 0,
      error: null
    };
  } catch (error) {
    console.error('Error fetching casino games data:', error);
    return {
      data: [],
      count: 0,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}

export async function getGamesCatalog({
  page = 1,
  pageSize = 10,
  filters
}: GetGamesCatalogParams) {
  try {
    let query = supabase
      .from('a8r_games_view')
      .select('*')
      .order('title');

    if (filters?.provider) {
      query = query.eq('provider', filters.provider);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const offset = (page - 1) * pageSize;
    const { data, error } = await query.range(offset, offset + pageSize - 1);
    const countQuery = await query.select('id');

    if (error) throw error;

    return { data, count: countQuery.data?.length || 0 };
  } catch (error) {
    console.error('Error fetching games catalog:', error);
    throw error;
  }
}

interface GetPaymentsDataParams {
  startDate: string
  endDate: string
  page?: number
  pageSize?: number
  filters?: {
    action?: string
    success?: boolean
    currency?: string
  }
}

export async function getPaymentsData({
  startDate,
  endDate,
  page = 1,
  pageSize = 10,
  filters = {}
}: GetPaymentsDataParams) {
  try {
    const offset = (page - 1) * pageSize;
    let query = supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.success !== undefined) {
      query = query.eq('success', filters.success);
    }
    if (filters.currency) {
      query = query.eq('currency', filters.currency);
    }

    const { data, error } = await query.range(offset, offset + pageSize - 1);
    const countQuery = await query.select('id');

    if (error) throw error;

    return {
      data: data?.map(payment => ({
        ...payment,
        amount_cents: Number(payment.amount_cents)
      })) || [],
      count: countQuery.data?.length || 0,
      error: null
    };
  } catch (error) {
    console.error('Error fetching payments data:', error);
    return {
      data: [],
      count: 0,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}

interface GetAffiliateReportsParams {
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
}

interface IncomeReport {
  id: string;
  date: string;
  partner_id: string;
  currency: string;
  partner_income: number;
}

interface TrafficReport {
  id: string;
  date: string;
  foreign_partner_id: string;
  country: string;
  visits: number;
  clicks: number;
  registrations_count: number;
  deposits_count: number;
  ftd_count: number;
  cr: number;
  cd: number;
  cftd: number;
  rftd: number;
}

interface ApiReport {
  id: string;
  date: string;
  partner_id: string;
  currency: string;
  deposits_sum: number;
  cashouts_sum: number;
  ggr: number;
  ngr: number;
  clean_net_revenue: number;
  deposits_count: number;
  first_deposits_count: number;
  qualified_players_count: number;
  self_excluded_players_count: number;
}

interface CombinedReport extends IncomeReport {
  traffic: TrafficReport | null;
  api: ApiReport | null;
}

export async function getAffiliateReports({
  startDate,
  endDate,
  page = 1,
  pageSize = 10
}: GetAffiliateReportsParams) {
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
    const combinedData = (incomeData || []).map((income: IncomeReport) => {
      const traffic = (trafficData || []).find((t: TrafficReport) => 
        t.foreign_partner_id === income.partner_id && 
        t.date.split('T')[0] === income.date.split('T')[0]
      );
      const api = (apiData || []).find((a: ApiReport) => 
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

interface BonusIssue {
  id: string
  created_at: string
  account_id: string
  title: string
  status: string
  amount_cents: number
  amount_wager_cents: number
  amount_locked_cents: number
  valid_until: string
  activated_at: string | null
  finished_at: string | null
  strategy: string
}

interface FreespinIssue {
  id: string
  created_at: string
  account_id: string
  title: string
  status: string
  freespins_total: number
  freespins_performed: number
  win_amount_cents: number
  valid_until: string
  provider: string
  games: string[]
}

interface GetBonusDataParams {
  startDate: string
  endDate: string
  page?: number
  pageSize?: number
}

interface GetBonusDataResponse {
  data: Array<BonusIssue | FreespinIssue>
  count: number
}

// Get Bonus Data
export async function getBonusData(params: GetBonusDataParams): Promise<GetBonusDataResponse> {
  const { startDate, endDate, page = 1, pageSize = 10 } = params
  
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
      .gte('created_at', startDate)
      .lte('created_at', endDate)
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
      .gte('created_at', startDate)
      .lte('created_at', endDate)
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

interface TestResults {
  [key: string]: {
    success: boolean;
    error?: string;
    hasData?: boolean;
  };
}

export async function testAllViews(): Promise<TestResults> {
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

  const results: TestResults = {}

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

export async function getAvailableTables() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) throw error;
    return data?.map(table => table.table_name) || [];
  } catch (error) {
    console.error('Error fetching available tables:', error);
    return [];
  }
} 