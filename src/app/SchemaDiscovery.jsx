
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Database, Table2, ChevronRight, DownloadCloud, Copy, Check, Key, ExternalLink, ChevronDown } from 'lucide-react';
import { MetricsData } from "@/api/entities";

export default function SchemaDiscovery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("tables");
  const [copied, setCopied] = useState(false);
  const [expandedTable, setExpandedTable] = useState(null);
  
  const databaseSchema = {
    players: {
      description: "Player accounts and demographic information",
      tables: [
        {
          name: "users",
          description: "Main user accounts table",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "email", type: "varchar(255)", description: "User email address", nullable: false },
            { name: "full_name", type: "varchar(255)", description: "Full name", nullable: true },
            { name: "nickname", type: "varchar(100)", description: "User nickname for display", nullable: true },
            { name: "password_hash", type: "varchar(255)", description: "Hashed password", nullable: false },
            { name: "country", type: "varchar(2)", description: "Country code (ISO 3166-1)", nullable: true },
            { name: "city", type: "varchar(100)", description: "City", nullable: true },
            { name: "address", type: "varchar(255)", description: "Street address", nullable: true },
            { name: "postal_code", type: "varchar(20)", description: "Postal/ZIP code", nullable: true },
            { name: "phone_number", type: "varchar(20)", description: "Phone number", nullable: true },
            { name: "date_of_birth", type: "date", description: "Date of birth", nullable: true },
            { name: "gender", type: "varchar(10)", description: "Gender", nullable: true },
            { name: "language", type: "varchar(5)", description: "Preferred language", nullable: true },
            { name: "timezone", type: "varchar(50)", description: "Timezone", nullable: true },
            { name: "registration_date", type: "timestamp", description: "Registration date", nullable: false },
            { name: "last_login_date", type: "timestamp", description: "Last login date", nullable: true },
            { name: "status", type: "varchar(20)", description: "Account status (active, suspended, etc.)", nullable: false },
            { name: "referral_code", type: "varchar(50)", description: "Personal referral code", nullable: true },
            { name: "referrer_id", type: "integer", description: "ID of user who referred this user", nullable: true },
            { name: "is_verified", type: "boolean", description: "Email verification status", nullable: false },
            { name: "verification_date", type: "timestamp", description: "When email was verified", nullable: true }
          ]
        },
        {
          name: "user_documents",
          description: "KYC document uploads",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "document_type", type: "varchar(50)", description: "Type of document (passport, driving license, etc.)", nullable: false },
            { name: "file_url", type: "varchar(255)", description: "URL to stored document", nullable: false },
            { name: "upload_date", type: "timestamp", description: "When document was uploaded", nullable: false },
            { name: "verification_status", type: "varchar(20)", description: "Verification status", nullable: false },
            { name: "verified_date", type: "timestamp", description: "When document was verified", nullable: true },
            { name: "verified_by", type: "integer", description: "Admin who verified document", nullable: true },
            { name: "rejection_reason", type: "text", description: "Reason for rejection", nullable: true }
          ]
        },
        {
          name: "user_preferences",
          description: "User preferences and settings",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "marketing_email", type: "boolean", description: "Permission for marketing emails", nullable: false },
            { name: "marketing_sms", type: "boolean", description: "Permission for marketing SMS", nullable: false },
            { name: "marketing_push", type: "boolean", description: "Permission for push notifications", nullable: false },
            { name: "newsletter", type: "boolean", description: "Newsletter subscription", nullable: false },
            { name: "two_factor_auth", type: "boolean", description: "Two-factor authentication enabled", nullable: false }
          ]
        },
        {
          name: "responsible_gaming_limits",
          description: "Self-imposed player limits",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "limit_type", type: "varchar(50)", description: "Type of limit (deposit, loss, wager, time)", nullable: false },
            { name: "limit_period", type: "varchar(20)", description: "Period (daily, weekly, monthly)", nullable: false },
            { name: "amount", type: "decimal(15,2)", description: "Limit amount", nullable: true },
            { name: "time_minutes", type: "integer", description: "Time limit in minutes", nullable: true },
            { name: "created_date", type: "timestamp", description: "When limit was set", nullable: false },
            { name: "effective_date", type: "timestamp", description: "When limit becomes active", nullable: false },
            { name: "status", type: "varchar(20)", description: "Status of the limit", nullable: false }
          ]
        },
        {
          name: "user_sessions",
          description: "User login sessions",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "session_token", type: "varchar(255)", description: "Unique session token", nullable: false },
            { name: "ip_address", type: "varchar(45)", description: "IP address", nullable: false },
            { name: "user_agent", type: "text", description: "Browser user agent", nullable: true },
            { name: "device_type", type: "varchar(50)", description: "Device type", nullable: true },
            { name: "os", type: "varchar(50)", description: "Operating system", nullable: true },
            { name: "browser", type: "varchar(50)", description: "Browser", nullable: true },
            { name: "login_time", type: "timestamp", description: "Login time", nullable: false },
            { name: "logout_time", type: "timestamp", description: "Logout time", nullable: true },
            { name: "is_active", type: "boolean", description: "Whether session is still active", nullable: false }
          ]
        }
      ]
    },
    payments: {
      description: "Financial transactions and payment methods",
      tables: [
        {
          name: "payment_methods",
          description: "Available payment methods",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "name", type: "varchar(100)", description: "Payment method name", nullable: false },
            { name: "payment_system", type: "varchar(50)", description: "Payment system (PayPal, Visa, etc.)", nullable: false },
            { name: "method_type", type: "varchar(20)", description: "Type (card, e-wallet, etc.)", nullable: false },
            { name: "min_deposit_cents", type: "integer", description: "Minimum deposit in cents", nullable: false },
            { name: "max_deposit_cents", type: "integer", description: "Maximum deposit in cents", nullable: false },
            { name: "min_withdrawal_cents", type: "integer", description: "Minimum withdrawal in cents", nullable: false },
            { name: "max_withdrawal_cents", type: "integer", description: "Maximum withdrawal in cents", nullable: false },
            { name: "deposit_fee_percent", type: "decimal(5,2)", description: "Deposit fee percentage", nullable: false },
            { name: "withdrawal_fee_percent", type: "decimal(5,2)", description: "Withdrawal fee percentage", nullable: false },
            { name: "deposit_processing_time", type: "varchar(50)", description: "Typical deposit processing time", nullable: true },
            { name: "withdrawal_processing_time", type: "varchar(50)", description: "Typical withdrawal processing time", nullable: true },
            { name: "is_active", type: "boolean", description: "Whether method is active", nullable: false },
            { name: "countries_allowed", type: "text", description: "Comma-separated country codes where allowed", nullable: true },
            { name: "countries_blocked", type: "text", description: "Comma-separated country codes where blocked", nullable: true },
            { name: "image_url", type: "varchar(255)", description: "Payment method logo URL", nullable: true }
          ]
        },
        {
          name: "user_payment_methods",
          description: "User saved payment methods",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "payment_method_id", type: "integer", description: "Reference to payment_methods.id", nullable: false },
            { name: "token", type: "varchar(255)", description: "Tokenized payment information", nullable: false },
            { name: "last_four", type: "varchar(4)", description: "Last four digits for cards", nullable: true },
            { name: "expiry_date", type: "varchar(7)", description: "Expiry date for cards (MM/YYYY)", nullable: true },
            { name: "account_holder", type: "varchar(255)", description: "Name of account holder", nullable: true },
            { name: "is_default", type: "boolean", description: "Whether this is the default method", nullable: false },
            { name: "added_date", type: "timestamp", description: "When method was added", nullable: false },
            { name: "last_used_date", type: "timestamp", description: "When method was last used", nullable: true }
          ]
        },
        {
          name: "deposits",
          description: "Deposit transactions",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "user_payment_method_id", type: "integer", description: "Reference to user_payment_methods.id", nullable: true },
            { name: "amount_cents", type: "integer", description: "Amount in cents", nullable: false },
            { name: "currency", type: "varchar(3)", description: "Currency code", nullable: false },
            { name: "status", type: "varchar(20)", description: "Transaction status", nullable: false },
            { name: "transaction_id", type: "varchar(255)", description: "External transaction ID", nullable: true },
            { name: "created_date", type: "timestamp", description: "When deposit was initiated", nullable: false },
            { name: "completed_date", type: "timestamp", description: "When deposit was completed", nullable: true },
            { name: "fee_cents", type: "integer", description: "Fee amount in cents", nullable: false },
            { name: "ip_address", type: "varchar(45)", description: "IP address", nullable: true },
            { name: "user_agent", type: "text", description: "Browser user agent", nullable: true },
            { name: "decline_reason", type: "varchar(50)", description: "Reason for decline if failed", nullable: true },
            { name: "is_first_deposit", type: "boolean", description: "Whether this is the user's first deposit", nullable: false }
          ]
        },
        {
          name: "withdrawals",
          description: "Withdrawal transactions",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "user_payment_method_id", type: "integer", description: "Reference to user_payment_methods.id", nullable: true },
            { name: "amount_cents", type: "integer", description: "Amount in cents", nullable: false },
            { name: "currency", type: "varchar(3)", description: "Currency code", nullable: false },
            { name: "status", type: "varchar(20)", description: "Transaction status", nullable: false },
            { name: "transaction_id", type: "varchar(255)", description: "External transaction ID", nullable: true },
            { name: "created_date", type: "timestamp", description: "When withdrawal was requested", nullable: false },
            { name: "approved_date", type: "timestamp", description: "When withdrawal was approved", nullable: true },
            { name: "completed_date", type: "timestamp", description: "When withdrawal was completed", nullable: true },
            { name: "fee_cents", type: "integer", description: "Fee amount in cents", nullable: false },
            { name: "ip_address", type: "varchar(45)", description: "IP address", nullable: true },
            { name: "approved_by", type: "integer", description: "Admin who approved withdrawal", nullable: true },
            { name: "rejection_reason", type: "varchar(255)", description: "Reason for rejection if declined", nullable: true }
          ]
        },
        {
          name: "exchange_rates",
          description: "Currency exchange rates",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "from_currency", type: "varchar(3)", description: "Source currency code", nullable: false },
            { name: "to_currency", type: "varchar(3)", description: "Target currency code", nullable: false },
            { name: "rate", type: "decimal(20,10)", description: "Exchange rate", nullable: false },
            { name: "date", type: "date", description: "Date of rate", nullable: false },
            { name: "source", type: "varchar(50)", description: "Source of rate data", nullable: false }
          ]
        }
      ]
    },
    gaming: {
      description: "Game transactions and behaviors",
      tables: [
        {
          name: "games",
          description: "Game catalog",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "name", type: "varchar(255)", description: "Game name", nullable: false },
            { name: "provider", type: "varchar(100)", description: "Game provider", nullable: false },
            { name: "type", type: "varchar(50)", description: "Game type", nullable: false },
            { name: "category", type: "varchar(50)", description: "Game category", nullable: false },
            { name: "thumbnail_url", type: "varchar(255)", description: "Thumbnail image URL", nullable: true },
            { name: "rtp", type: "decimal(5,2)", description: "Return to player percentage", nullable: true },
            { name: "volatility", type: "varchar(20)", description: "Volatility level", nullable: true },
            { name: "min_bet_cents", type: "integer", description: "Minimum bet in cents", nullable: false },
            { name: "max_bet_cents", type: "integer", description: "Maximum bet in cents", nullable: false },
            { name: "has_jackpot", type: "boolean", description: "Whether game has jackpot", nullable: false },
            { name: "has_free_spins", type: "boolean", description: "Whether game has free spins feature", nullable: false },
            { name: "release_date", type: "date", description: "Game release date", nullable: true },
            { name: "is_active", type: "boolean", description: "Whether game is active", nullable: false },
            { name: "popularity", type: "integer", description: "Popularity ranking", nullable: true },
            { name: "features", type: "text", description: "Comma-separated game features", nullable: true },
            { name: "themes", type: "text", description: "Comma-separated game themes", nullable: true }
          ]
        },
        {
          name: "game_rounds",
          description: "Individual game rounds played",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "game_id", type: "integer", description: "Reference to games.id", nullable: false },
            { name: "session_id", type: "varchar(255)", description: "Game session identifier", nullable: false },
            { name: "round_id", type: "varchar(255)", description: "Round identifier from provider", nullable: false },
            { name: "bet_cents", type: "integer", description: "Bet amount in cents", nullable: false },
            { name: "win_cents", type: "integer", description: "Win amount in cents", nullable: false },
            { name: "net_cents", type: "integer", description: "Net result in cents (win-bet)", nullable: false },
            { name: "currency", type: "varchar(3)", description: "Currency code", nullable: false },
            { name: "start_time", type: "timestamp", description: "When round started", nullable: false },
            { name: "end_time", type: "timestamp", description: "When round ended", nullable: true },
            { name: "is_free_spin", type: "boolean", description: "Whether this was a free spin", nullable: false },
            { name: "is_bonus_round", type: "boolean", description: "Whether this was a bonus round", nullable: false },
            { name: "is_jackpot_win", type: "boolean", description: "Whether this was a jackpot win", nullable: false },
            { name: "jackpot_win_cents", type: "integer", description: "Jackpot win amount in cents", nullable: true },
            { name: "balance_before_cents", type: "integer", description: "Balance before round in cents", nullable: false },
            { name: "balance_after_cents", type: "integer", description: "Balance after round in cents", nullable: false },
            { name: "game_data", type: "json", description: "Additional game-specific data", nullable: true },
            { name: "ip_address", type: "varchar(45)", description: "IP address", nullable: true },
            { name: "device_type", type: "varchar(50)", description: "Device type", nullable: true }
          ]
        },
        {
          name: "game_sessions",
          description: "Game playing sessions",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "start_time", type: "timestamp", description: "When session started", nullable: false },
            { name: "end_time", type: "timestamp", description: "When session ended", nullable: true },
            { name: "ip_address", type: "varchar(45)", description: "IP address", nullable: true },
            { name: "device_type", type: "varchar(50)", description: "Device type", nullable: true },
            { name: "os", type: "varchar(50)", description: "Operating system", nullable: true },
            { name: "browser", type: "varchar(50)", description: "Browser", nullable: true },
            { name: "total_wager_cents", type: "integer", description: "Total amount wagered in cents", nullable: false },
            { name: "total_win_cents", type: "integer", description: "Total amount won in cents", nullable: false },
            { name: "net_result_cents", type: "integer", description: "Net result in cents (win-wager)", nullable: false },
            { name: "currency", type: "varchar(3)", description: "Currency code", nullable: false },
            { name: "rounds_played", type: "integer", description: "Number of rounds played", nullable: false },
            { name: "games_played", type: "integer", description: "Number of different games played", nullable: false }
          ]
        },
        {
          name: "jackpots",
          description: "Jackpot configurations and current values",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "name", type: "varchar(100)", description: "Jackpot name", nullable: false },
            { name: "type", type: "varchar(50)", description: "Jackpot type (progressive, fixed, etc.)", nullable: false },
            { name: "current_value_cents", type: "bigint", description: "Current jackpot value in cents", nullable: false },
            { name: "seed_value_cents", type: "bigint", description: "Initial jackpot value in cents", nullable: false },
            { name: "increment_rate", type: "decimal(5,2)", description: "Rate at which jackpot increases", nullable: false },
            { name: "last_won_date", type: "timestamp", description: "When jackpot was last won", nullable: true },
            { name: "last_won_by", type: "integer", description: "User ID of last winner", nullable: true },
            { name: "last_won_amount_cents", type: "bigint", description: "Last won amount in cents", nullable: true },
            { name: "linked_games", type: "text", description: "Comma-separated list of game IDs", nullable: true },
            { name: "currency", type: "varchar(3)", description: "Currency code", nullable: false },
            { name: "is_active", type: "boolean", description: "Whether jackpot is active", nullable: false }
          ]
        }
      ]
    },
    bonuses: {
      description: "Bonuses, promotions, and player rewards",
      tables: [
        {
          name: "bonus_templates",
          description: "Bonus and promotion templates",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "name", type: "varchar(255)", description: "Bonus name", nullable: false },
            { name: "type", type: "varchar(50)", description: "Bonus type", nullable: false },
            { name: "description", type: "text", description: "Description", nullable: true },
            { name: "amount_type", type: "varchar(20)", description: "Percentage or fixed amount", nullable: false },
            { name: "amount", type: "decimal(15,2)", description: "Bonus amount or percentage", nullable: false },
            { name: "max_amount", type: "decimal(15,2)", description: "Maximum bonus amount", nullable: true },
            { name: "wagering_requirement", type: "decimal(5,2)", description: "Wagering requirement multiplier", nullable: false },
            { name: "expiry_days", type: "integer", description: "Days until bonus expires", nullable: false },
            { name: "min_deposit", type: "decimal(15,2)", description: "Minimum deposit to qualify", nullable: true },
            { name: "bonus_code", type: "varchar(50)", description: "Bonus code", nullable: true },
            { name: "is_first_deposit_only", type: "boolean", description: "First deposit only", nullable: false },
            { name: "is_recurring", type: "boolean", description: "Whether bonus can be claimed multiple times", nullable: false },
            { name: "start_date", type: "timestamp", description: "When promotion starts", nullable: true },
            { name: "end_date", type: "timestamp", description: "When promotion ends", nullable: true },
            { name: "countries_allowed", type: "text", description: "Comma-separated country codes", nullable: true },
            { name: "payment_methods_allowed", type: "text", description: "Comma-separated payment method IDs", nullable: true },
            { name: "is_active", type: "boolean", description: "Whether bonus is active", nullable: false },
            { name: "created_by", type: "integer", description: "Admin who created bonus", nullable: false },
            { name: "created_date", type: "timestamp", description: "Creation date", nullable: false }
          ]
        },
        {
          name: "bonus_issues",
          description: "Instances of bonuses issued to players",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "bonus_template_id", type: "integer", description: "Reference to bonus_templates.id", nullable: false },
            { name: "amount_cents", type: "integer", description: "Bonus amount in cents", nullable: false },
            { name: "currency", type: "varchar(3)", description: "Currency code", nullable: false },
            { name: "wager_requirement_cents", type: "integer", description: "Required wagering in cents", nullable: false },
            { name: "wager_completed_cents", type: "integer", description: "Completed wagering in cents", nullable: false },
            { name: "status", type: "varchar(20)", description: "Bonus status", nullable: false },
            { name: "activation_date", type: "timestamp", description: "When bonus was activated", nullable: false },
            { name: "expiry_date", type: "timestamp", description: "When bonus expires", nullable: false },
            { name: "completed_date", type: "timestamp", description: "When wagering was completed", nullable: true },
            { name: "canceled_date", type: "timestamp", description: "When bonus was canceled", nullable: true },
            { name: "forfeited_date", type: "timestamp", description: "When bonus was forfeited", nullable: true },
            { name: "related_deposit_id", type: "integer", description: "Reference to deposits.id", nullable: true },
            { name: "issued_by", type: "integer", description: "Admin who issued bonus", nullable: true },
            { name: "is_automatically_issued", type: "boolean", description: "Whether issued automatically", nullable: false },
            { name: "balance_cents", type: "integer", description: "Current bonus balance in cents", nullable: false },
            { name: "locked_amount_cents", type: "integer", description: "Locked real money in cents", nullable: false },
            { name: "won_amount_cents", type: "integer", description: "Amount won from bonus in cents", nullable: false }
          ]
        },
        {
          name: "free_spins",
          description: "Free spins issued to players",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "bonus_issue_id", type: "integer", description: "Reference to bonus_issues.id", nullable: true },
            { name: "game_id", type: "integer", description: "Reference to games.id", nullable: true },
            { name: "spins_count", type: "integer", description: "Number of free spins", nullable: false },
            { name: "spins_used", type: "integer", description: "Number of spins used", nullable: false },
            { name: "spin_value_cents", type: "integer", description: "Value per spin in cents", nullable: false },
            { name: "status", type: "varchar(20)", description: "Status of free spins", nullable: false },
            { name: "activation_date", type: "timestamp", description: "When free spins were activated", nullable: false },
            { name: "expiry_date", type: "timestamp", description: "When free spins expire", nullable: false },
            { name: "wager_requirement", type: "decimal(5,2)", description: "Wagering requirement multiplier", nullable: false },
            { name: "accumulated_winnings_cents", type: "integer", description: "Accumulated winnings in cents", nullable: false },
            { name: "currency", type: "varchar(3)", description: "Currency code", nullable: false },
            { name: "created_date", type: "timestamp", description: "Creation date", nullable: false }
          ]
        },
        {
          name: "loyalty_points",
          description: "Player loyalty points transactions",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "transaction_type", type: "varchar(50)", description: "Type of transaction", nullable: false },
            { name: "points", type: "integer", description: "Number of points", nullable: false },
            { name: "balance_before", type: "integer", description: "Points balance before", nullable: false },
            { name: "balance_after", type: "integer", description: "Points balance after", nullable: false },
            { name: "reference_id", type: "integer", description: "Related transaction ID", nullable: true },
            { name: "created_date", type: "timestamp", description: "Transaction date", nullable: false },
            { name: "description", type: "varchar(255)", description: "Transaction description", nullable: true }
          ]
        }
      ]
    },
    marketing: {
      description: "Marketing campaigns and affiliate tracking",
      tables: [
        {
          name: "campaigns",
          description: "Marketing campaigns",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "name", type: "varchar(255)", description: "Campaign name", nullable: false },
            { name: "type", type: "varchar(50)", description: "Campaign type", nullable: false },
            { name: "description", type: "text",  description: "Campaign description", nullable: true },
            { name: "budget_cents", type: "integer", description: "Campaign budget in cents", nullable: true },
            { name: "spent_cents", type: "integer", description: "Amount spent in cents", nullable: false },
            { name: "start_date", type: "timestamp", description: "Campaign start date", nullable: false },
            { name: "end_date", type: "timestamp", description: "Campaign end date", nullable: true },
            { name: "status", type: "varchar(20)", description: "Campaign status", nullable: false },
            { name: "target_geo", type: "text", description: "Target countries", nullable: true },
            { name: "target_platform", type: "varchar(50)", description: "Target platform", nullable: true },
            { name: "tracking_code", type: "varchar(100)", description: "Campaign tracking code", nullable: false },
            { name: "created_by", type: "integer", description: "Admin who created campaign", nullable: false },
            { name: "created_date", type: "timestamp", description: "Creation date", nullable: false }
          ]
        },
        {
          name: "affiliates",
          description: "Affiliate partners",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "name", type: "varchar(255)", description: "Affiliate name", nullable: false },
            { name: "email", type: "varchar(255)", description: "Contact email", nullable: false },
            { name: "tracking_code", type: "varchar(100)", description: "Affiliate tracking code", nullable: false },
            { name: "commission_type", type: "varchar(50)", description: "Commission type", nullable: false },
            { name: "commission_rate", type: "decimal(5,2)", description: "Commission rate", nullable: false },
            { name: "min_payout_cents", type: "integer", description: "Minimum payout in cents", nullable: false },
            { name: "balance_cents", type: "integer", description: "Current balance in cents", nullable: false },
            { name: "currency", type: "varchar(3)", description: "Currency code", nullable: false },
            { name: "status", type: "varchar(20)", description: "Affiliate status", nullable: false },
            { name: "website", type: "varchar(255)", description: "Affiliate website", nullable: true },
            { name: "onboarding_date", type: "timestamp", description: "When affiliate was onboarded", nullable: false }
          ]
        },
        {
          name: "affiliate_clicks",
          description: "Affiliate referral tracking",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "affiliate_id", type: "integer", description: "Reference to affiliates.id", nullable: false },
            { name: "tracking_code", type: "varchar(100)", description: "Tracking code used", nullable: false },
            { name: "ip_address", type: "varchar(45)", description: "Visitor IP address", nullable: false },
            { name: "user_agent", type: "text", description: "Browser user agent", nullable: true },
            { name: "referrer_url", type: "varchar(255)", description: "Referrer URL", nullable: true },
            { name: "landing_page", type: "varchar(255)", description: "Landing page URL", nullable: false },
            { name: "created_date", type: "timestamp", description: "Click timestamp", nullable: false },
            { name: "converted_user_id", type: "integer", description: "User ID if converted", nullable: true },
            { name: "conversion_date", type: "timestamp", description: "When click converted", nullable: true }
          ]
        },
        {
          name: "affiliate_commissions",
          description: "Affiliate commission entries",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "affiliate_id", type: "integer", description: "Reference to affiliates.id", nullable: false },
            { name: "user_id", type: "integer", description: "Reference to users.id", nullable: false },
            { name: "type", type: "varchar(50)", description: "Commission type", nullable: false },
            { name: "amount_cents", type: "integer", description: "Commission amount in cents", nullable: false },
            { name: "status", type: "varchar(20)", description: "Commission status", nullable: false },
            { name: "currency", type: "varchar(3)", description: "Currency code", nullable: false },
            { name: "reference_id", type: "integer", description: "Related transaction ID", nullable: true },
            { name: "created_date", type: "timestamp", description: "Creation date", nullable: false },
            { name: "paid_date", type: "timestamp", description: "When commission was paid", nullable: true }
          ]
        },
        {
          name: "marketing_notifications",
          description: "Marketing notification templates and logs",
          primary_key: "id",
          columns: [
            { name: "id", type: "integer", description: "Primary key", nullable: false },
            { name: "type", type: "varchar(50)", description: "Notification type", nullable: false },
            { name: "name", type: "varchar(255)", description: "Template name", nullable: false },
            { name: "subject", type: "varchar(255)", description: "Notification subject", nullable: false },
            { name: "content", type: "text", description: "Notification content", nullable: false },
            { name: "variables", type: "json", description: "Template variables", nullable: true },
            { name: "campaign_id", type: "integer", description: "Reference to campaigns.id", nullable: true },
            { name: "schedule_type", type: "varchar(50)", description: "How notification is scheduled", nullable: false },
            { name: "trigger_event", type: "varchar(50)", description: "Event that triggers notification", nullable: true },
            { name: "is_active", type: "boolean", description: "Whether template is active", nullable: false },
            { name: "created_by", type: "integer", description: "Admin who created template", nullable: false },
            { name: "created_date", type: "timestamp", description: "Creation date", nullable: false }
          ]
        }
      ]
    }
  };

  const [flatColumns, flatTables] = React.useMemo(() => {
    let allColumns = [];
    let allTables = [];
    
    Object.entries(databaseSchema).forEach(([domain, domainData]) => {
      domainData.tables.forEach(table => {
        allTables.push({
          name: table.name,
          domain: domain,
          description: table.description
        });
        
        table.columns.forEach(column => {
          allColumns.push({
            domain: domain,
            table: table.name,
            name: column.name,
            type: column.type,
            description: column.description,
            nullable: column.nullable
          });
        });
      });
    });
    
    return [allColumns, allTables];
  }, [databaseSchema]);
  
  const filteredColumns = React.useMemo(() => {
    if (!searchTerm) return flatColumns;
    const term = searchTerm.toLowerCase();
    return flatColumns.filter(col => 
      col.name.toLowerCase().includes(term) ||
      col.table.toLowerCase().includes(term) ||
      col.domain.toLowerCase().includes(term) ||
      col.description.toLowerCase().includes(term)
    );
  }, [flatColumns, searchTerm]);
  
  const filteredTables = React.useMemo(() => {
    if (!searchTerm) return flatTables;
    const term = searchTerm.toLowerCase();
    return flatTables.filter(table => 
      table.name.toLowerCase().includes(term) ||
      table.domain.toLowerCase().includes(term) ||
      table.description.toLowerCase().includes(term)
    );
  }, [flatTables, searchTerm]);

  const copySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(databaseSchema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportSchema = () => {
    const exportData = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      database_name: "iGaming Analytics Platform",
      domains: {}
    };

    Object.entries(databaseSchema).forEach(([domain, domainData]) => {
      exportData.domains[domain] = {
        description: domainData.description,
        tables: domainData.tables.map(table => ({
          name: table.name,
          description: table.description,
          primary_key: table.primary_key,
          columns: table.columns.map(column => ({
            name: column.name,
            type: column.type,
            description: column.description,
            nullable: column.nullable,
            is_primary_key: table.primary_key === column.name,
            constraints: deriveConstraints(column)
          })),
          indexes: deriveIndexes(table),
          relationships: deriveRelationships(table, domain)
        }))
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `database-schema-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const deriveConstraints = (column) => {
    const constraints = [];
    
    if (!column.nullable) {
      constraints.push("NOT NULL");
    }

    if (column.type.includes('varchar')) {
      const match = column.type.match(/varchar\((\d+)\)/);
      if (match) {
        constraints.push(`MAX LENGTH(${match[1]})`);
      }
    }

    if (column.type === 'date' || column.type === 'timestamp') {
      constraints.push("TEMPORAL");
    }

    if (column.name.endsWith('_id') && column.name !== 'id') {
      const referencedTable = column.name.replace('_id', '');
      constraints.push(`FOREIGN KEY REFERENCE(${referencedTable}.id)`);
    }

    return constraints;
  };

  const deriveIndexes = (table) => {
    const indexes = [];
    
    indexes.push({
      name: `pk_${table.name}`,
      type: "PRIMARY KEY",
      columns: [table.primary_key],
      unique: true
    });

    table.columns.forEach(column => {
      if (column.name.endsWith('_id') && column.name !== table.primary_key) {
        indexes.push({
          name: `idx_${table.name}_${column.name}`,
          type: "BTREE",
          columns: [column.name],
          unique: false
        });
      }

      if (['status', 'type', 'date', 'created_date'].includes(column.name)) {
        indexes.push({
          name: `idx_${table.name}_${column.name}`,
          type: "BTREE",
          columns: [column.name],
          unique: false
        });
      }
    });

    return indexes;
  };

  const deriveRelationships = (table, currentDomain) => {
    const relationships = [];

    table.columns.forEach(column => {
      if (column.name.endsWith('_id') && column.name !== 'id') {
        const referencedTable = column.name.replace('_id', '');
        
        let referencedDomain = null;
        Object.entries(databaseSchema).forEach(([domain, domainData]) => {
          if (domainData.tables.some(t => t.name === referencedTable)) {
            referencedDomain = domain;
          }
        });

        if (referencedDomain) {
          relationships.push({
            type: "FOREIGN KEY",
            from: {
              domain: currentDomain,
              table: table.name,
              column: column.name
            },
            to: {
              domain: referencedDomain,
              table: referencedTable,
              column: 'id'
            }
          });
        }
      }
    });

    return relationships;
  };

  const handleTableClick = (tableName) => {
    if (expandedTable === tableName) {
      setExpandedTable(null);
    } else {
      setExpandedTable(tableName);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Database Schema</h1>
            <p className="text-gray-500">
              Browse and search database structure and relationships
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search tables and columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full md:w-[300px]"
              />
            </div>
            
            <Button variant="outline" onClick={copySchema}>
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Schema"}
            </Button>
            
            <Button onClick={exportSchema}>
              <DownloadCloud className="h-4 w-4 mr-2" />
              Export Schema
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tables" className="flex items-center gap-1">
              <Table2 className="h-4 w-4" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="columns" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Columns
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tables">
            <Card>
              <CardHeader>
                <CardTitle>Database Tables</CardTitle>
                <CardDescription>
                  Found {filteredTables.length} tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {Object.entries(databaseSchema).map(([domain, domainData]) => (
                      <div key={domain} className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Database className="h-5 w-5 text-gray-500" />
                          {domain.charAt(0).toUpperCase() + domain.slice(1)}
                          <Badge variant="outline" className="ml-2">
                            {domainData.tables.length} tables
                          </Badge>
                        </h3>
                        
                        <div className="grid gap-3">
                          {domainData.tables.map(table => (
                            <Collapsible
                              key={table.name}
                              open={expandedTable === table.name}
                              onOpenChange={() => handleTableClick(table.name)}
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                  <div className="flex items-center gap-3">
                                    <Table2 className="h-5 w-5 text-gray-500" />
                                    <div>
                                      <h4 className="font-medium text-gray-900">{table.name}</h4>
                                      <p className="text-sm text-gray-500">{table.description}</p>
                                    </div>
                                  </div>
                                  {expandedTable === table.name ? (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-2 pl-11">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Column</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Nullable</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {table.columns.map(column => (
                                        <TableRow key={column.name}>
                                          <TableCell className="font-medium">
                                            {column.name}
                                            {table.primary_key === column.name && (
                                              <Badge variant="outline" className="ml-2">
                                                <Key className="h-3 w-3 mr-1" />
                                                PK
                                              </Badge>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                                              {column.type}
                                            </code>
                                          </TableCell>
                                          <TableCell className="text-gray-600">
                                            {column.description}
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant={column.nullable ? "outline" : "secondary"}>
                                              {column.nullable ? "NULL" : "NOT NULL"}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="columns">
            <Card>
              <CardHeader>
                <CardTitle>Database Columns</CardTitle>
                <CardDescription>
                  Found {filteredColumns.length} columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Column</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Nullable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredColumns.map((column, i) => (
                        <TableRow key={`${column.table}-${column.name}-${i}`}>
                          <TableCell className="font-medium">
                            {column.domain}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Table2 className="h-4 w-4 text-gray-500" />
                              {column.table}
                            </div>
                          </TableCell>
                          <TableCell>{column.name}</TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                              {column.type}
                            </code>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {column.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant={column.nullable ? "outline" : "secondary"}>
                              {column.nullable ? "NULL" : "NOT NULL"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
