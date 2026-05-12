import { useState } from 'react'
import { useAccounts, useMortgagePayments, useAutoCreateMortgagePayments } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { REAL_ACCOUNTS } from '@/data/accounts.real'
import { formatCurrency, currentMonth } from '@/lib/utils'
import { MortgagePaymentDialog } from '@/components/mortgage/MortgagePaymentDialog'
import type { Account, MortgagePayment } from '@/types'
import { Plus, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'

function formatMonthLabel(month: string) {
  return format(parseISO(`${month}-01`), 'MMM yyyy')
}

interface MortgageSectionProps {
  account: Account
  payments: MortgagePayment[]
  isOwner: boolean
}

function MortgageSection({ account, payments, isOwner }: MortgageSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<MortgagePayment | undefined>()

  const lastPayment = payments[0]

  const totalPrincipal = payments.reduce((s, p) => s + (p.principal ?? 0) + (p.extra_principal ?? 0), 0)
  const totalInterest = payments.reduce((s, p) => s + (p.interest ?? 0), 0)
  const totalEscrow = payments.reduce((s, p) => s + (p.escrow ?? 0), 0)
  const totalExtra = payments.reduce((s, p) => s + (p.extra_principal ?? 0), 0)
  const estimatedRemaining =
    account.original_balance != null ? account.original_balance - totalPrincipal : null

  const openAdd = () => {
    setSelectedPayment(undefined)
    setDialogOpen(true)
  }

  const openEdit = (p: MortgagePayment) => {
    setSelectedPayment(p)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{account.name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {[account.issuer, account.last4 ? `···${account.last4}` : null, account.apr != null ? `${account.apr}% APR` : null]
              .filter(Boolean).join(' · ')}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Original loan</p>
          <p className="text-base font-semibold">
            {account.original_balance != null
              ? formatCurrency(account.original_balance)
              : <span className="text-muted-foreground text-sm">Not set</span>}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Est. remaining</p>
          <p className="text-base font-semibold">
            {estimatedRemaining != null ? formatCurrency(estimatedRemaining) : <span className="text-muted-foreground text-sm">—</span>}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Principal paid</p>
          <p className="text-base font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(totalPrincipal)}
          </p>
          {totalExtra > 0 && (
            <p className="text-xs text-green-600/70 dark:text-green-400/70">{formatCurrency(totalExtra)} extra</p>
          )}
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Interest paid</p>
          <p className="text-base font-semibold text-muted-foreground">
            {formatCurrency(totalInterest)}
          </p>
        </div>
      </div>

      {/* Payment history */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-medium text-sm">Payment history</h3>
          <span className="text-xs text-muted-foreground">{payments.length} payments</span>
        </div>

        {payments.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No payments logged yet.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Month</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Principal</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Extra</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Interest</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Escrow</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Total</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date paid</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => isOwner && openEdit(p)}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium">{formatMonthLabel(p.month)}</td>
                      <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                        {p.principal != null ? formatCurrency(p.principal) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600/70 dark:text-green-400/70">
                        {p.extra_principal != null && p.extra_principal > 0 ? formatCurrency(p.extra_principal) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {p.interest != null ? formatCurrency(p.interest) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {p.escrow != null ? formatCurrency(p.escrow) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {p.total_paid != null ? formatCurrency(p.total_paid) : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.date_paid ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/20">
                    <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Totals</td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(payments.reduce((s, p) => s + (p.principal ?? 0), 0))}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-green-600/70 dark:text-green-400/70">
                      {totalExtra > 0 ? formatCurrency(totalExtra) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-muted-foreground">
                      {formatCurrency(totalInterest)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-muted-foreground">
                      {formatCurrency(totalEscrow)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold">
                      {formatCurrency(totalPrincipal + totalInterest + totalEscrow)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y">
              {payments.map(p => (
                <button
                  key={p.id}
                  onClick={() => isOwner && openEdit(p)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{formatMonthLabel(p.month)}</p>
                    <p className="text-xs text-muted-foreground">{p.date_paid ?? 'No date'}</p>
                    {p.extra_principal != null && p.extra_principal > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">+{formatCurrency(p.extra_principal)} extra</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right space-y-0.5">
                      <p className="text-sm font-medium">{p.total_paid != null ? formatCurrency(p.total_paid) : '—'}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {p.principal != null ? `${formatCurrency(p.principal)} principal` : ''}
                      </p>
                    </div>
                    {isOwner && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {dialogOpen && (
        <MortgagePaymentDialog
          key={selectedPayment?.id ?? `new-${account.id}-${currentMonth()}`}
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false)
            setSelectedPayment(undefined)
          }}
          account={account}
          month={selectedPayment?.month ?? currentMonth()}
          existingPayment={selectedPayment}
          lastPayment={selectedPayment ? undefined : lastPayment}
        />
      )}
    </div>
  )
}

export function MortgagePage() {
  const { isOwner } = useAuth()
  const { data: liveAccounts } = useAccounts()
  const accounts = isOwner ? (liveAccounts ?? REAL_ACCOUNTS) : REAL_ACCOUNTS
  const mortgageAccounts = accounts.filter(a => a.type === 'mortgage' && a.is_active)

  const { data: allMortgagePayments = [] } = useMortgagePayments()

  useAutoCreateMortgagePayments(accounts, allMortgagePayments, isOwner)

  if (mortgageAccounts.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-xl font-semibold">Mortgage</h1>
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
          No active mortgage accounts found.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <h1 className="text-xl font-semibold">Mortgage</h1>
      {mortgageAccounts.map(account => {
        const payments = allMortgagePayments
          .filter(p => p.account_id === account.id)
          .sort((a, b) => b.month.localeCompare(a.month))
        return (
          <MortgageSection
            key={account.id}
            account={account}
            payments={payments}
            isOwner={isOwner}
          />
        )
      })}
    </div>
  )
}
