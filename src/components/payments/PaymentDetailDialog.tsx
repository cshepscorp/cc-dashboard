import { useState } from 'react'
import type { Account, Payment } from '@/types'
import { useDeletePayment } from '@/hooks/useData'
import {
  formatCurrency, STATUS_LABELS, STATUS_VARIANTS,
  ACCOUNT_TYPE_LABELS, getDueDate,
} from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { X, ExternalLink, Pencil, Trash2, User } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  account: Account
  payment?: Payment
  month: string
  onEdit: () => void
}

export function PaymentDetailDialog({ open, onClose, account, payment, month, onEdit }: Props) {
  const remove = useDeletePayment()
  const [error, setError] = useState('')

  if (!open) return null

  const dueDate = getDueDate(account, month)

  const handleDelete = async () => {
    if (!payment?.id) return
    if (!window.confirm('Delete this payment record?')) return
    try {
      await remove.mutateAsync(payment.id)
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

        {/* Payment status row */}
        {payment && (
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_VARIANTS[payment.status]}`}>
              {STATUS_LABELS[payment.status]}
            </span>
            {account.promo_ends && (
              <span className="text-xs text-warning font-medium">
                0% ends {format(parseISO(account.promo_ends), 'MMM yyyy')}
              </span>
            )}
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Due date</p>
            <p className="font-medium">{format(dueDate, 'MMMM d')}</p>
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
              <p className="font-medium">{account.promo_apr}%</p>
            </div>
          )}

          {account.monthly_payment != null && (
            <div>
              <p className="text-xs text-muted-foreground">Monthly payment</p>
              <p className="font-medium">{formatCurrency(account.monthly_payment)}</p>
            </div>
          )}

          {payment?.amt_due != null && (
            <div>
              <p className="text-xs text-muted-foreground">Amount due</p>
              <p className="font-medium font-mono">{formatCurrency(payment.amt_due)}</p>
            </div>
          )}

          {payment?.amt_paid != null && (
            <div>
              <p className="text-xs text-muted-foreground">Amount paid</p>
              <p className="font-medium font-mono">{formatCurrency(payment.amt_paid)}</p>
            </div>
          )}

          {payment?.date_paid && (
            <div>
              <p className="text-xs text-muted-foreground">Date paid</p>
              <p className="font-medium">{payment.date_paid}</p>
            </div>
          )}

          {payment?.confirmation && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Confirmation #</p>
              <p className="font-medium font-mono text-xs break-all">{payment.confirmation}</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {(payment?.notes || account.notes) && (
          <div className="bg-muted/40 rounded-lg px-3 py-2 text-xs text-muted-foreground">
            {payment?.notes ?? account.notes}
          </div>
        )}

        {/* No payment logged yet */}
        {!payment && (
          <div className="text-sm text-muted-foreground text-center py-2">
            No payment logged for this month yet.
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        {/* Actions */}
        <div className="flex justify-between gap-2 pt-2 border-t">
          <div>
            {payment?.id && (
              <button
                onClick={handleDelete}
                disabled={remove.isPending}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
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
              {payment ? 'Edit payment' : 'Log payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
