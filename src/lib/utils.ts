import { format, addDays, differenceInDays, parseISO, setDate } from 'date-fns'
import type { Account, Payment, PaymentStatus, UpcomingPayment, PromoAlert, MonthSummary } from '@/types'

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`
  return formatCurrency(amount)
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/** Returns a Date for the due date of an account in a given month string 'YYYY-MM' */
export function getDueDate(account: Account, month: string): Date {
  const [year, mon] = month.split('-').map(Number)
  const d = new Date(year, mon - 1, 1)
  return setDate(d, Math.min(account.due_day, 28)) // cap at 28 to avoid month overflow
}

export function formatMonth(month: string): string {
  return format(parseISO(`${month}-01`), 'MMMM yyyy')
}

export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date())
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Unpaid',
  late: 'Late',
  autopay: 'Autopay',
  na: 'N/A',
}

export const STATUS_VARIANTS: Record<PaymentStatus, string> = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  late: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300',
  autopay: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  na: 'bg-muted text-muted-foreground',
}

// ─── Account type helpers ─────────────────────────────────────────────────────

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Credit Card',
  installment: 'Installment',
  personal: 'Personal',
  mortgage: 'Mortgage',
  auto_loan: 'Auto Loan',
}

// ─── Derived data ─────────────────────────────────────────────────────────────

export function getUpcomingPayments(
  accounts: Account[],
  payments: Payment[],
  month: string,
  withinDays = 14
): UpcomingPayment[] {
  const today = new Date()
  return accounts
    .filter(a => a.is_active && a.type !== 'mortgage')
    .map(account => {
      const dueDate = getDueDate(account, month)
      const days = differenceInDays(dueDate, today)
      const lastPayment = payments.find(
        p => p.account_id === account.id && p.month === month
      )
      return { account, due_date: dueDate, days_until_due: days, last_payment: lastPayment }
    })
    .filter(u => u.days_until_due >= 0 && u.days_until_due <= withinDays)
    .sort((a, b) => a.days_until_due - b.days_until_due)
}

export function getPromoAlerts(accounts: Account[]): PromoAlert[] {
  return accounts
    .filter(a => a.promo_ends && a.is_active)
    .map(a => ({
      account: a,
      days_until_expiry: daysUntil(a.promo_ends!),
      promo_ends: a.promo_ends!,
    }))
    .filter(a => a.days_until_expiry >= 0 && a.days_until_expiry <= 90)
    .sort((a, b) => a.days_until_expiry - b.days_until_expiry)
}

export function getMonthSummary(payments: Payment[], month: string): MonthSummary {
  const monthPayments = payments.filter(p => p.month === month && p.status !== 'na')
  return {
    month,
    total_paid: monthPayments.reduce((s, p) => s + (p.amt_paid ?? 0), 0),
    total_due: monthPayments.reduce((s, p) => s + (p.amt_due ?? 0), 0),
    paid_count: monthPayments.filter(p => p.status === 'paid' || p.status === 'autopay').length,
    unpaid_count: monthPayments.filter(p => p.status === 'unpaid').length,
    late_count: monthPayments.filter(p => p.status === 'late').length,
    partial_count: monthPayments.filter(p => p.status === 'partial').length,
  }
}

export function hasLatePayments(payments: Payment[]): boolean {
  return payments.some(p => p.status === 'late')
}
