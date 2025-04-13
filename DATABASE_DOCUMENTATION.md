# 🗄️ iGaming Database Documentation

## 🔑 Core Concepts

### Player Identity Structure
- `user_id`: Primary identifier for players
- `account_id`: Sub-identifier for currency accounts
  - One player can have multiple accounts (one per currency)
  - Each account represents a different currency balance

### Key Metrics
- **GGR (Gross Gaming Revenue)**
  - Formula: Bets - Wins
  - Source: `casino_games_view`
- **NGR (Net Gaming Revenue)**
  - Formula: GGR - Bonuses
  - Source: Combined from GGR and bonus data

## 📊 Core Tables & Views

### 1. Player Management
#### `users_view`
- Primary view for player information
- **Key Fields:**
  - `id`: Unique player identifier
  - `tags`: User categorization/labels
  - `updated_at`: Last record update
  - `last_sign_in_at`: Last login timestamp
  - `email`: User email
  - `locked_at`: Account lock timestamp
  - `created_at`: Account creation date
  - `with_duplicates`: Duplicate account flag
  - `suspended`: Account suspension status
  - `disabled`: Account disable status
  - `confirmed_at`: Email confirmation date
  - `psp_trusted_level`: Payment provider trust level
  - `ctag`: Campaign tracking tag

### 2. Financial Transactions
#### `payments_view`
- Tracks all financial transactions
- **Key Fields:**
  - `user_id`: Player identifier
  - `action`: Transaction type (deposit/cashout)
  - `amount_cents`: Transaction amount in cents
  - `currency`: Transaction currency
  - `success`: Transaction status (true/false)
  - `created_at`: Transaction initiation
  - `finished_at`: Transaction completion
  - `updated_at`: Record update time
  - `commission_amount_cents`: Processor fees
  - `network_fee_cents`: Crypto network fees (if applicable)

### 3. Gaming Activity
#### `casino_games_view`
- Tracks individual betting activity
- **Key Fields:**
  - `user_id`: Player identifier
  - Bet amounts and outcomes
  - Game session data

#### `a8r_games_view`
- Game catalog and characteristics
- Organized by provider
- Contains game specifications and details

### 4. Payment Systems
#### `payment_systems_view`
- Payment method hierarchy
- Parent-child relationship for payment systems
- Supports multiple payment methods per system

### 5. Limits & Controls
#### `user_limits_view`
- Player-imposed restrictions
- **Types of Limits:**
  - Self-exclusion (SE) - temporary or permanent
  - Daily/monthly/total deposit limits
  - Betting limits
  - Time-based restrictions

### 6. Reports & Analytics
#### `traffic_reports`
- Comprehensive traffic metrics
- Performance tracking data

#### `api_reports`
- Affiliate system (Affilka) data
- Aggregated by affiliate (s_tag)
- Performance and commission tracking

### 7. Administrative
#### `balance_corrections_view`
- Manual balance adjustments
- **Key Fields:**
  - `user_id`: Target player
  - `account_id`: Specific currency account
  - `amount_cents`: Correction amount (positive/negative)
  - Reason codes and admin tracking

## 🔄 Common Queries

### 1. Revenue Calculations
```sql
-- GGR Calculation
SELECT 
    user_id,
    SUM(bet_amount) - SUM(win_amount) as ggr
FROM casino_games_view
GROUP BY user_id;

-- Payment Success Rate
SELECT 
    DATE(created_at) as date,
    action,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_transactions
FROM payments_view
GROUP BY DATE(created_at), action;
```

## ⚠️ Important Notes

1. **Currency Handling**
   - All monetary values stored in cents
   - Players can have multiple currency accounts
   - Exchange rates tracked separately

2. **Transaction States**
   - Created: Transaction initiated
   - Finished: Transaction completed
   - Updated: Record modified
   - Success flag indicates final status

3. **Player Restrictions**
   - Self-imposed limits
   - Regulatory restrictions
   - Multiple limit types supported

4. **Data Relationships**
   - user_id → account_id (1:many)
   - account_id → currency (1:1)
   - user_id → transactions (1:many)

## 🔄 Update History
- Initial documentation: [Current Date]
- Last updated: [Current Date] 