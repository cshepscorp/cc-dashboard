import { useState } from 'react'
import { useAccounts, useAllPayments, useAutoCreateAutopayPayments } from '@/hooks/useData'
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
import { PaymentDetailDialog } from '@/components/payments/PaymentDetailDialog'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'

export function DashboardPage() {
  const { isOwner } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const [detailOpen, setDetailOpen] = useState(false)
  const [addPaymentOpen, setAddPaymentOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<typeof accounts[0] | undefined>()
  const [selectedPayment, setSelectedPayment] = useState<(typeof allPayments)[0] | undefined>()

  // Use live Supabase data for owner, fallback to seed for demo
  const { data: liveAccounts } = useAccounts()
  const { data: livePayments } = useAllPayments()

  const accounts = isOwner ? (liveAccounts ?? REAL_ACCOUNTS) : DEMO_ACCOUNTS
  const allPayments = isOwner ? (livePayments ?? SEED_PAYMENTS as any) : (SEED_PAYMENTS as any)

  useAutoCreateAutopayPayments(accounts, allPayments, selectedMonth, isOwner)

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
        onLatePaymentClick={(account, payment) => {
          setSelectedAccount(account)
          setSelectedPayment(payment)
          setAddPaymentOpen(true)
        }}
      />

      {/* Payment table — primary interaction */}
      <PaymentTable
        accounts={accounts}
        payments={monthPayments}
        month={selectedMonth}
        onRowClick={(account, payment) => {
          setSelectedAccount(account)
          setSelectedPayment(payment)
          setDetailOpen(true)
        }}
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

      {/* Detail card — opens on row click, edit button transitions to edit form */}
      {selectedAccount && (
        <PaymentDetailDialog
          key={`detail-${selectedAccount.id}`}
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false)
            setSelectedAccount(undefined)
            setSelectedPayment(undefined)
          }}
          account={selectedAccount}
          payment={selectedPayment}
          month={selectedMonth}
          onEdit={() => {
            setDetailOpen(false)
            setAddPaymentOpen(true)
          }}
        />
      )}

      <AddPaymentDialog
        key={selectedAccount?.id ?? 'global'}
        open={addPaymentOpen}
        onClose={() => {
          setAddPaymentOpen(false)
          setSelectedAccount(undefined)
          setSelectedPayment(undefined)
        }}
        accounts={accounts}
        month={selectedMonth}
        defaultAccount={selectedAccount}
        existingPayment={selectedPayment}
      />
    </div>
  )
}
