import type { Account, Payment } from '@/types'
import {
  formatCurrency, STATUS_LABELS, STATUS_VARIANTS,
  ACCOUNT_TYPE_LABELS, getDueDate
} from '@/lib/utils'
import { format } from 'date-fns'
import { ExternalLink, User } from 'lucide-react'

interface Props {
  accounts: Account[]
  payments: Payment[]
  month: string
  onRowClick?: (account: Account, payment?: Payment) => void
}

export function PaymentTable({ accounts, payments, month, onRowClick }: Props) {
  const activeAccounts = accounts.filter(a => a.is_active)

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-sm font-medium">Payment details</h2>
        <span className="text-xs text-muted-foreground">{activeAccounts.length} accounts</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-2.5">Account</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-3 py-2.5">Type</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-3 py-2.5">Due</th>
              <th className="text-right text-xs text-muted-foreground font-medium px-3 py-2.5">Amount due</th>
              <th className="text-right text-xs text-muted-foreground font-medium px-3 py-2.5">Paid</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-3 py-2.5">Status</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-3 py-2.5">Notes</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {activeAccounts.map(account => {
              const payment = payments.find(p => p.account_id === account.id)
              const dueDate = getDueDate(account, month)

              return (
                <tr
                  key={account.id}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(account, payment)}
                >
                  {/* Account name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{account.name}</span>
                      {account.is_personal && (
                        <span title="Personal loan" className="text-purple-500">
                          <User className="w-3 h-3" />
                        </span>
                      )}
                      {account.last4 && (
                        <span className="text-xs text-muted-foreground">···{account.last4}</span>
                      )}
                    </div>
                    {account.promo_ends && (
                      <p className="text-[11px] text-warning mt-0.5">
                        0% ends {format(new Date(account.promo_ends), 'MMM yyyy')}
                      </p>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
                  </td>

                  {/* Due date */}
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {format(dueDate, 'MMM d')}
                  </td>

                  {/* Amount due */}
                  <td className="px-3 py-3 text-right font-mono text-sm">
                    {payment?.amt_due != null ? formatCurrency(payment.amt_due) : '—'}
                  </td>

                  {/* Paid */}
                  <td className="px-3 py-3 text-right font-mono text-sm">
                    {payment?.amt_paid != null ? formatCurrency(payment.amt_paid) : '—'}
                  </td>

                  {/* Status badge */}
                  <td className="px-3 py-3">
                    {payment ? (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_VARIANTS[payment.status]}`}
                      >
                        {STATUS_LABELS[payment.status]}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="px-3 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                    {payment?.notes ?? account.notes ?? ''}
                  </td>

                  {/* Pay now link */}
                  <td className="px-3 py-3">
                    {account.portal_url && account.portal_url !== '#' && (
                      <a
                        href={account.portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap"
                        title={`Pay ${account.name}`}
                        onClick={e => e.stopPropagation()}
                      >
                        Pay <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
