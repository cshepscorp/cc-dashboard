// ─── Account Types ────────────────────────────────────────────────────────────

export type AccountType =
  | 'credit_card'
  | 'installment'
  | 'personal'
  | 'mortgage'
  | 'auto_loan'

export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'late' | 'autopay' | 'na'

export interface Account {
  id: string
  name: string
  type: AccountType
  last4?: string | null
  issuer?: string | null   // Chase, Amex, Capital One, etc.
  due_day: number          // day of month (1–31)
  credit_limit?: number | null
  current_balance?: number | null
  apr?: number | null      // annual percentage rate e.g. 24.99
  promo_apr?: number | null // 0 for 0% promos
  promo_ends?: string | null // ISO date string e.g. '2026-07-01'
  portal_url?: string | null
  is_personal: boolean     // e.g. loan from parents
  is_active: boolean
  notes?: string | null
  // installment / loan specific
  monthly_payment?: number | null // fixed payment amount
  payoff_date?: string | null     // ISO date string
  original_balance?: number | null
  created_at?: string
}

// ─── Payment Entry ────────────────────────────────────────────────────────────

export interface Payment {
  id: string
  account_id: string
  month: string            // 'YYYY-MM' e.g. '2026-05'
  amt_due?: number
  amt_paid?: number
  date_paid?: string       // ISO date or free text
  status: PaymentStatus
  confirmation?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

// ─── Joined / Derived Types ───────────────────────────────────────────────────

export interface PaymentWithAccount extends Payment {
  account: Account
}

export interface MonthSummary {
  month: string            // 'YYYY-MM'
  total_paid: number
  total_due: number
  paid_count: number
  unpaid_count: number
  late_count: number
  partial_count: number
}

export interface UpcomingPayment {
  account: Account
  due_date: Date
  days_until_due: number
  last_payment?: Payment
}

export interface PromoAlert {
  account: Account
  days_until_expiry: number
  promo_ends: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string
  email: string
  is_owner: boolean        // true = real data, false = demo mode
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type ViewMode = 'real' | 'demo'

export interface FilterState {
  month: string
  type?: AccountType
  status?: PaymentStatus
  search?: string
}
