import type { Account } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { ExternalLink, ChevronRight } from 'lucide-react'

interface Props {
  accounts: Account[]
  onRowClick: (account: Account) => void
}

const TYPE_LABELS: Record<string, string> = {
  credit_card: 'Credit Card',
  installment: 'Installment',
  personal: 'Personal',
  mortgage: 'Mortgage',
  auto_loan: 'Auto Loan',
}

export function AccountsTable({ accounts, onRowClick }: Props) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
        No accounts yet. Create one to get started.
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Account</th>
              <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Type</th>
              <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Due day</th>
              <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">APR</th>
              <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Monthly payment</th>
              <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Notes</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr
                key={account.id}
                className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => onRowClick(account)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{account.name}</div>
                  {account.last4 && <div className="text-xs text-muted-foreground">···{account.last4}</div>}
                  {account.issuer && <div className="text-xs text-muted-foreground">{account.issuer}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {TYPE_LABELS[account.type] ?? account.type}
                </td>
                <td className="px-4 py-3 text-right text-sm">{account.due_day}</td>
                <td className="px-4 py-3 text-sm">
                  {account.promo_apr != null ? (
                    <div>
                      <span className="text-orange-600 font-medium">{account.promo_apr}% promo</span>
                      {account.promo_ends && (
                        <div className="text-xs text-muted-foreground">
                          ends {new Date(account.promo_ends).toLocaleDateString()}
                        </div>
                      )}
                      {account.apr != null && (
                        <div className="text-xs text-muted-foreground">{account.apr}% after</div>
                      )}
                    </div>
                  ) : account.apr != null ? (
                    <span>{account.apr}%</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {account.monthly_payment != null ? (
                    <div>
                      <div>{formatCurrency(account.monthly_payment)}</div>
                      {account.payoff_date && (
                        <div className="text-xs text-muted-foreground">
                          Payoff {new Date(account.payoff_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">
                  {account.is_personal && <span className="text-purple-500 mr-1">Personal ·</span>}
                  {account.notes}
                </td>
                <td className="px-4 py-3">
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y">
        {accounts.map(account => (
          <div
            key={account.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 active:bg-muted/30 transition-colors cursor-pointer"
            onClick={() => onRowClick(account)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-sm">{account.name}</span>
                {account.last4 && (
                  <span className="text-xs text-muted-foreground">···{account.last4}</span>
                )}
                {account.is_personal && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                    Personal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground">
                  {TYPE_LABELS[account.type] ?? account.type}
                </span>
                <span className="text-[11px] text-muted-foreground">· Due {account.due_day}</span>
                {account.promo_apr != null ? (
                  <span className="text-[11px] text-orange-600 font-medium">· {account.promo_apr}% promo</span>
                ) : account.apr != null ? (
                  <span className="text-[11px] text-muted-foreground">· {account.apr}% APR</span>
                ) : null}
                {account.monthly_payment != null && (
                  <span className="text-[11px] text-muted-foreground">
                    · {formatCurrency(account.monthly_payment)}/mo
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
