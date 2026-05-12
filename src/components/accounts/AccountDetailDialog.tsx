import { useState } from 'react'
import type { Account } from '@/types'
import { useDeactivateAccount } from '@/hooks/useData'
import { formatCurrency, ACCOUNT_TYPE_LABELS } from '@/lib/utils'
import { X, Pencil, Trash2, ExternalLink, User } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  account: Account
  onEdit: () => void
}

export function AccountDetailDialog({ open, onClose, account, onEdit }: Props) {
  const deactivate = useDeactivateAccount()
  const [error, setError] = useState('')

  if (!open) return null

  const handleDeactivate = async () => {
    if (!window.confirm(`Deactivate ${account.name}? It will be hidden from the dashboard.`)) return
    try {
      await deactivate.mutateAsync(account.id)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-card border rounded-t-2xl sm:rounded-xl shadow-lg w-full sm:max-w-md mx-0 sm:mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-semibold text-base">{account.name}</h2>
              {account.is_personal && (
                <span title="Personal loan" className="text-purple-500">
                  <User className="w-3.5 h-3.5" />
                </span>
              )}
              {account.last4 && (
                <span className="text-xs text-muted-foreground">···{account.last4}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
              {account.issuer ? ` · ${account.issuer}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Due day</p>
            <p className="font-medium">{account.due_day}{account.due_day === 1 ? 'st' : account.due_day === 2 ? 'nd' : account.due_day === 3 ? 'rd' : 'th'} of month</p>
          </div>

          {account.apr != null && (
            <div>
              <p className="text-xs text-muted-foreground">APR</p>
              <p className="font-medium">{account.apr}%</p>
            </div>
          )}

          {account.promo_apr != null && (
            <div>
              <p className="text-xs text-muted-foreground">Promo APR</p>
              <p className="font-medium text-orange-600">{account.promo_apr}%</p>
            </div>
          )}

          {account.promo_ends && (
            <div>
              <p className="text-xs text-muted-foreground">Promo ends</p>
              <p className="font-medium">{new Date(account.promo_ends).toLocaleDateString()}</p>
            </div>
          )}

          {account.monthly_payment != null && (
            <div>
              <p className="text-xs text-muted-foreground">Monthly payment</p>
              <p className="font-medium">{formatCurrency(account.monthly_payment)}</p>
            </div>
          )}

          {account.original_balance != null && (
            <div>
              <p className="text-xs text-muted-foreground">Original balance</p>
              <p className="font-medium">{formatCurrency(account.original_balance)}</p>
            </div>
          )}

          {account.payoff_date && (
            <div>
              <p className="text-xs text-muted-foreground">Payoff date</p>
              <p className="font-medium">{new Date(account.payoff_date).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {account.notes && (
          <div className="bg-muted/40 rounded-lg px-3 py-2 text-xs text-muted-foreground">
            {account.notes}
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        {/* Actions */}
        <div className="flex justify-between gap-2 pt-2 border-t">
          <button
            onClick={handleDeactivate}
            disabled={deactivate.isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Deactivate
          </button>
          <div className="flex gap-2">
            {account.portal_url && account.portal_url !== '#' && (
              <a
                href={account.portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border hover:bg-secondary transition-colors"
              >
                Pay <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
