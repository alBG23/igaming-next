export interface Database {
  public: {
    Tables: {
      income_reports: {
        Row: {
          id: number
          date: string
          partner_id: number
          currency: string
          partner_income: number
        }
        Insert: {
          id?: number
          date: string
          partner_id: number
          currency: string
          partner_income: number
        }
      }
      traffic_reports: {
        Row: {
          id: number
          date: string
          foreign_partner_id: number
          country: string
          clicks: number
          visits: number
          registrations_count: number
          ftd_count: number
          deposits_count: number
          cr: number
          cftd: number
          cd: number
          rftd: number | null
        }
        Insert: {
          id?: number
          date: string
          foreign_partner_id: number
          country: string
          clicks: number
          visits: number
          registrations_count: number
          ftd_count: number
          deposits_count: number
          cr: number
          cftd: number
          cd: number
          rftd?: number
        }
      }
      api_reports: {
        Row: {
          id: number
          partner_id: number
          date: string
          player_id: number
          user_id_in_casino: number
          player_country: string
          registrations_count: number
          currency: string
          qualified_players_count: number
          prequalified_players_count: number
          self_excluded_players_count: number
          first_deposits_count: number
          first_deposits_sum: number
          deposits_count: number
          deposits_sum: number
          cashouts_count: number
          cashouts_sum: number
          ggr: number
          bonus_issues_sum: number
          additional_deductions_sum: number
          real_ngr: number
          ngr: number
          clean_net_revenue: number
          net_deposits: number
          campaign_id: number
          strategy: string
        }
        Insert: {
          id?: number
          partner_id: number
          date: string
          player_id: number
          user_id_in_casino: number
          player_country: string
          registrations_count: number
          currency: string
          qualified_players_count: number
          prequalified_players_count: number
          self_excluded_players_count: number
          first_deposits_count: number
          first_deposits_sum: number
          deposits_count: number
          deposits_sum: number
          cashouts_count: number
          cashouts_sum: number
          ggr: number
          bonus_issues_sum: number
          additional_deductions_sum: number
          real_ngr: number
          ngr: number
          clean_net_revenue: number
          net_deposits: number
          campaign_id: number
          strategy: string
        }
      }
      dashboard_metrics: {
        Row: {
          id: string
          created_at: string
          total_players: number
          active_players: number
          avg_session_time: number
          retention_rate: number
        }
        Insert: {
          id?: string
          created_at?: string
          total_players: number
          active_players: number
          avg_session_time: number
          retention_rate: number
        }
      }
      revenue_metrics: {
        Row: {
          id: string
          created_at: string
          month: string
          total_revenue: number
          total_payouts: number
          net_revenue: number
        }
        Insert: {
          id?: string
          created_at?: string
          month: string
          total_revenue: number
          total_payouts: number
          net_revenue: number
        }
      }
    }
    Views: {
      users_view: {
        Row: {
          id: number
          disabled: boolean | null
          email: string | null
          tags: string | null
          with_duplicates: boolean | null
          created_at: string | null
          updated_at: string | null
          locked_at: string | null
          last_sign_in_at: string | null
          confirmed_at: string | null
        }
      }
      payments_view: {
        Row: {
          id: number
          user_id: number | null
          action: string | null
          processing: boolean | null
          amount_cents: number | null
          currency: string | null
          created_at: string | null
          updated_at: string | null
          finished_at: string | null
          success: boolean | null
        }
      }
    }
  }
} 