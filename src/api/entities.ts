export interface CohortData {
  ftd_month: string;
  cohort_size: number;
  affiliate_id: string;
  affiliate_name: string;
  stag: string;
  brand: string;
  month_number: number;
  deposits_amount: number;
  ngr: number;
  unique_depositors: number;
  marketing_spend: number;
}

export interface PlayerData {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  lastLoginDate: string;
  totalDeposits: number;
  totalWithdrawals: number;
  netValue: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface GameData {
  id: string;
  name: string;
  category: string;
  provider: string;
  totalBets: number;
  totalWins: number;
  rtp: number;
  popularity: number;
}

export interface TransactionData {
  id: string;
  playerId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  method: string;
} 