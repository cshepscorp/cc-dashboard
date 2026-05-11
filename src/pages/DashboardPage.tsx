import { useState } from 'react'
import { useAccounts } from '@/hooks/useData'
import { useAllPayments } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { DEMO_ACCOUNTS } from '@/data/accounts.demo'
import { REAL_ACCOUNTS } from '@/data/accounts.real'
import { SEED_PAYMENTS } from '@/data/payments.seed'
import { currentMonth, formatMonth, getMonthSummary, getUpcomingPayments, getPromoAlerts } from '@/lib/utils'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { AlertStrip } from '@/components/dashboard/AlertStrip'
import { PaidVsDueChart } from '@/components/dashboard/PaidVsDueChart'
import { UpcomingDue } from '@/components/dashboard/UpcomingDue'
import { PaymentTable } from '@/components/payments/PaymentTable'
import { AddPaymentDialog } from '@/components/payments/AddPaymentDialog'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'

export function DashboardPage() {
  const { isOwner } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const [addPaymentOpen, setAddPaymentOpen] = useState(false)

  // Use live Supabase data for owner, fallback to seed for demo
  const { data: liveAccounts } = useAccounts()
  const { data: livePayments } = useAllPayments()

  const accounts = isOwner ? (liveAccounts ?? REAL_ACCOUNTS) : DEMO_ACCOUNTS
  const allPayments = isOwner ? (livePayments ?? SEED_PAYMENTS as any) : (SEED_PAYMENTS as any)

  const monthPayments = allPayments.filter((p: any) => p.month === selectedMonth)
  const summary = getMonthSummary(allPayments, selectedMonth)
  const upcoming = getUpcomingPayments(accounts, allPayments, selectedMonth)
  const promoAlerts = getPromoAlerts(accounts)

  const prevMonth = () => {
    const d = subMonths(parseISO(`${selectedMonth}-01`), 1)
    setSelectedMonth(format(d, 'yyyy-MM'))
  }
  const nextMonth = () => {
    const d = addMonths(parseISO(`${selectedMonth}-01`), 1)
    setSelectedMonth(format(d, 'yyyy-MM'))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">{formatMonth(selectedMonth)}</h1>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setAddPaymentOpen(true)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log payment
        </button>
      </div>

      {/* Summary metric cards */}
      <SummaryCards summary={summary} />

      {/* Alert strip */}
      <AlertStrip
        accounts={accounts}
        payments={allPayments}
        month={selectedMonth}
        promoAlerts={promoAlerts}
      />

      {/* Two-column: upcoming + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UpcomingDue upcoming={upcoming} />
        </div>
        <div className="lg:col-span-2">
          <PaidVsDueChart payments={allPayments} />
        </div>
      </div>

      {/* Payment table */}
      <PaymentTable
        accounts={accounts}
        payments={monthPayments}
        month={selectedMonth}
      />

      <AddPaymentDialog
        open={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
        accounts={accounts}
        month={selectedMonth}
      />
    </div>
  )
}
