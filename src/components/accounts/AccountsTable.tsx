import { useState } from 'react'
import type { Account } from '@/types'
import { useDeactivateAccount } from '@/hooks/useData'
import { formatCurrency } from '@/lib/utils'
import { Edit2, Trash2, ExternalLink } from 'lucide-react'

interface Props {
  accounts: Account[]
  onEdit: (account: Account) => void
}

const TYPE_LABELS: Record<string, string> = {
  credit_card: '💳 Credit Card',
  installment: '📦 Installment',
  personal: '👥 Personal',
  mortgage: '🏠 Mortgage',
  auto_loan: '🚗 Auto Loan',
}

export function AccountsTable({ accounts, onEdit }: Props) {
  const deactivate = useDeactivateAccount()
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this account? It will be hidden from the dashboard.')) {
      return
    }
    setDeactivatingId(id)
    try {
      await deactivate.mutateAsync(id)
    } finally {
      setDeactivatingId(null)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
        No accounts yet. Create one to get started.
      </div>
    )
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">Account</th>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-right px-4 py-3 font-semibold">Due Day</th>
              <th className="text-left px-4 py-3 font-semibold">APR</th>
              <th className="text-left px-4 py-3 font-semibold">Monthly Payment</th>
              <th className="text-left px-4 py-3 font-semibold">Notes</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr key={account.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <div className="font-medium">{account.name}</div>
                    {account.last4 && (
                      <div className="text-xs text-muted-foreground">•••• {account.last4}</div>
                    )}
                    {account.issuer && (
                      <div className="text-xs text-muted-foreground">{account.issuer}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="inline-block bg-secondary px-2.5 py-1 rounded font-medium">
                    {TYPE_LABELS[account.type] || account.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{account.due_day}</td>
                <td className="px-4 py-3">
                  {account.promo_apr !== undefined && account.promo_apr !== null ? (
                    <div className="space-y-1">
                      <div className="text-xs text-orange-600 font-medium">
                        {account.promo_apr}%
                        {account.promo_ends && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (ends {new Date(account.promo_ends).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                      {account.apr && (
                        <div className="text-xs text-muted-foreground">{account.apr}% after</div>
                      )}
                    </div>
                  ) : account.apr ? (
                    <div>{account.apr}%</div>
                  ) : (
                    <div className="text-muted-foreground">—</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {account.monthly_payment ? (
                    <div>
                      <div>{formatCurrency(account.monthly_payment)}</div>
                      {account.payoff_date && (
                        <div className="text-xs text-muted-foreground">
                          Payoff: {new Date(account.payoff_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">—</div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="space-y-1">
                    {account.is_personal && (
                      <span className="inline-block bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-200 px-2 py-0.5 rounded text-xs font-medium">
                        Personal
                      </span>
                    )}
                    {account.notes && (
                      <div className="text-muted-foreground truncate max-w-xs" title={account.notes}>
                        {account.notes}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {account.portal_url && (
                      <a
                        href={account.portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-secondary"
                        title="Open payment portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onEdit(account)}
                      className="p-1 rounded hover:bg-secondary"
                      title="Edit account"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeactivate(account.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive hover:text-destructive disabled:opacity-50"
                      title="Deactivate account"
                      disabled={deactivatingId === account.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
