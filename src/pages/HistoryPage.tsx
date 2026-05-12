import { useState, useMemo } from 'react'
import { useAllPayments, useAccounts } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { SEED_PAYMENTS } from '@/data/payments.seed'
import { REAL_ACCOUNTS } from '@/data/accounts.real'
import { DEMO_ACCOUNTS } from '@/data/accounts.demo'
import {
  formatCurrency, formatMonth, STATUS_LABELS, STATUS_VARIANTS, ACCOUNT_TYPE_LABELS,
} from '@/lib/utils'
import type { PaymentStatus } from '@/types'

const ALL_STATUSES: PaymentStatus[] = ['paid', 'partial', 'unpaid', 'late', 'autopay', 'na']

export function HistoryPage() {
  const { isOwner } = useAuth()
  const { data: livePayments } = useAllPayments()
  const { data: liveAccounts } = useAccounts()

  const accounts = isOwner ? (liveAccounts ?? REAL_ACCOUNTS) : DEMO_ACCOUNTS
  const allPayments = isOwner ? (livePayments ?? SEED_PAYMENTS as any) : (SEED_PAYMENTS as any)

  const [accountFilter, setAccountFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    return allPayments.filter((p: any) => {
      if (accountFilter && p.account_id !== accountFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      return true
    })
  }, [allPayments, accountFilter, statusFilter])

  // Group by month, sorted most recent first
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const p of filtered) {
      if (!map[p.month]) map[p.month] = []
      map[p.month].push(p)
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const totalPaid = useMemo(
    () => filtered.reduce((sum: number, p: any) => sum + (p.amt_paid ?? 0), 0),
    [filtered]
  )

  const findAccount = (id: string) => accounts.find(a => a.id === id)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Payment history</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full payment history across all accounts.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={accountFilter}
          onChange={e => setAccountFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        {(accountFilter || statusFilter) && (
          <button
            onClick={() => { setAccountFilter(''); setStatusFilter('') }}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-sm text-muted-foreground self-center">
          {filtered.length} records · {formatCurrency(totalPaid)} paid
        </span>
      </div>

      {/* Grouped by month */}
      {grouped.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
          No payments found.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([month, payments]) => {
            const monthTotal = payments.reduce((s: number, p: any) => s + (p.amt_paid ?? 0), 0)
            const nonNa = payments.filter((p: any) => p.status !== 'na')

            return (
              <div key={month} className="rounded-xl border bg-card overflow-hidden">
                {/* Month header */}
                <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{formatMonth(month)}</h2>
                  <span className="text-xs text-muted-foreground">
                    {nonNa.length} payments · {formatCurrency(monthTotal)} paid
                  </span>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Account</th>
                        <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Type</th>
                        <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Amount due</th>
                        <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Amount paid</th>
                        <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Status</th>
                        <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Date paid</th>
                        <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p: any, i: number) => {
                        const account = findAccount(p.account_id)
                        return (
                          <tr
                            key={p.id ?? i}
                            className={`border-b last:border-0 ${p.status === 'na' ? 'opacity-40' : ''}`}
                          >
                            <td className="px-4 py-2.5">
                              <div className="font-medium">{account?.name ?? p.account_id}</div>
                              {account?.last4 && (
                                <div className="text-xs text-muted-foreground">···{account.last4}</div>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                              {account ? (ACCOUNT_TYPE_LABELS[account.type] ?? account.type) : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono">
                              {p.amt_due != null ? formatCurrency(p.amt_due) : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono">
                              {p.amt_paid != null ? formatCurrency(p.amt_paid) : '—'}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_VARIANTS[p.status as PaymentStatus]}`}>
                                {STATUS_LABELS[p.status as PaymentStatus]}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                              {p.date_paid ?? '—'}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">
                              {p.notes ?? ''}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y">
                  {payments.map((p: any, i: number) => {
                    const account = findAccount(p.account_id)
                    return (
                      <div
                        key={p.id ?? i}
                        className={`flex items-center gap-3 px-4 py-3 ${p.status === 'na' ? 'opacity-40' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {account?.name ?? p.account_id}
                            {account?.last4 && (
                              <span className="text-xs text-muted-foreground ml-1">···{account.last4}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {p.amt_paid != null && (
                              <span className="text-[11px] text-muted-foreground">
                                Paid {formatCurrency(p.amt_paid)}
                              </span>
                            )}
                            {p.date_paid && (
                              <span className="text-[11px] text-muted-foreground">· {p.date_paid}</span>
                            )}
                          </div>
                          {p.notes && (
                            <div className="text-[11px] text-muted-foreground truncate mt-0.5">{p.notes}</div>
                          )}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_VARIANTS[p.status as PaymentStatus]}`}>
                          {STATUS_LABELS[p.status as PaymentStatus]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
