import { useState } from 'react'
import type { Account, Payment, PaymentStatus } from '@/types'
import { useUpsertPayment, useDeletePayment } from '@/hooks/useData'
import { STATUS_LABELS, getDueDate } from '@/lib/utils'
import { format } from 'date-fns'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  accounts: Account[]
  month: string
  defaultAccount?: Account
  existingPayment?: Payment
}

const STATUSES: PaymentStatus[] = ['paid', 'partial', 'unpaid', 'late', 'autopay', 'na']
const FIXED_PAYMENT_TYPES = new Set(['installment', 'personal', 'auto_loan', 'mortgage'])

function initialAmtDue(existingPayment?: Payment, defaultAccount?: Account): string {
  if (existingPayment?.amt_due != null) return existingPayment.amt_due.toString()
  if (defaultAccount?.monthly_payment && FIXED_PAYMENT_TYPES.has(defaultAccount.type)) {
    return defaultAccount.monthly_payment.toString()
  }
  return ''
}

function initialAmtPaid(existingPayment?: Payment, defaultAccount?: Account): string {
  if (existingPayment?.amt_paid != null) return existingPayment.amt_paid.toString()
  if (defaultAccount?.is_autopay && defaultAccount?.monthly_payment) {
    return defaultAccount.monthly_payment.toString()
  }
  return ''
}

function initialStatus(existingPayment?: Payment, defaultAccount?: Account): PaymentStatus {
  if (existingPayment?.status) return existingPayment.status
  if (defaultAccount?.is_autopay) return 'autopay'
  return 'unpaid'
}

function initialDatePaid(existingPayment?: Payment, defaultAccount?: Account, month?: string): string {
  if (existingPayment?.date_paid) return existingPayment.date_paid
  if (defaultAccount?.is_autopay && month) {
    return format(getDueDate(defaultAccount, month), 'yyyy-MM-dd')
  }
  return ''
}

export function AddPaymentDialog({ open, onClose, accounts, month, defaultAccount, existingPayment }: Props) {
  const upsert = useUpsertPayment()
  const remove = useDeletePayment()

  const [accountId, setAccountId] = useState(defaultAccount?.id ?? existingPayment?.account_id ?? '')
  const [amtDue, setAmtDue] = useState(initialAmtDue(existingPayment, defaultAccount))
  const [amtPaid, setAmtPaid] = useState(initialAmtPaid(existingPayment, defaultAccount))
  const [datePaid, setDatePaid] = useState(initialDatePaid(existingPayment, defaultAccount, month))
  const [status, setStatus] = useState<PaymentStatus>(initialStatus(existingPayment, defaultAccount))
  const [confirmation, setConfirmation] = useState(existingPayment?.confirmation ?? '')
  const [notes, setNotes] = useState(existingPayment?.notes ?? '')
  const [error, setError] = useState('')

  if (!open) return null

  const handleAccountChange = (id: string) => {
    setAccountId(id)
    const acct = accounts.find(a => a.id === id)
    if (acct) {
      if (!amtDue && acct.monthly_payment && FIXED_PAYMENT_TYPES.has(acct.type)) {
        setAmtDue(acct.monthly_payment.toString())
      }
      if (!amtPaid && acct.is_autopay && acct.monthly_payment) {
        setAmtPaid(acct.monthly_payment.toString())
      }
      if (acct.is_autopay) {
        setStatus('autopay')
        if (!datePaid) setDatePaid(format(getDueDate(acct, month), 'yyyy-MM-dd'))
      }
    }
  }

  const handleSubmit = async () => {
    if (!accountId) { setError('Please select an account.'); return }
    setError('')
    try {
      await upsert.mutateAsync({
        ...(existingPayment?.id ? { id: existingPayment.id } : {}),
        account_id: accountId,
        month,
        amt_due: amtDue ? parseFloat(amtDue) : undefined,
        amt_paid: amtPaid ? parseFloat(amtPaid) : undefined,
        date_paid: datePaid || undefined,
        status,
        confirmation: confirmation || undefined,
        notes: notes || undefined,
      })
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    }
  }

  const handleDelete = async () => {
    if (!existingPayment?.id) return
    if (!window.confirm('Delete this payment record?')) return
    try {
      await remove.mutateAsync(existingPayment.id)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    }
  }

  const isPending = upsert.isPending || remove.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border rounded-xl shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">
            {existingPayment ? 'Edit payment' : 'Log payment'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {/* Account — locked when opened from a row, selectable from the Log button */}
          {defaultAccount ? (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Account</label>
              <div className="px-3 py-2 border rounded-md bg-muted/40 text-foreground text-sm font-medium">
                {defaultAccount.name}
                {defaultAccount.last4 && (
                  <span className="text-muted-foreground font-normal ml-1">···{defaultAccount.last4}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Account</label>
              <select
                value={accountId}
                onChange={e => handleAccountChange(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select account…</option>
                {accounts.filter(a => a.is_active).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Amount due</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amtDue}
                onChange={e => setAmtDue(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Amount paid</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amtPaid}
                onChange={e => setAmtPaid(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Date paid + status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Date paid</label>
              <input
                type="date"
                value={datePaid}
                onChange={e => setDatePaid(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as PaymentStatus)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Confirmation #</label>
            <input
              type="text"
              placeholder="Optional"
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Notes</label>
            <textarea
              placeholder="Optional"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex justify-between gap-2 pt-2">
          {existingPayment?.id ? (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {upsert.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
