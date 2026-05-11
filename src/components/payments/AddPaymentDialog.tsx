import { useState } from 'react'
import type { Account, Payment, PaymentStatus } from '@/types'
import { useUpsertPayment } from '@/hooks/useData'
import { STATUS_LABELS } from '@/lib/utils'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  accounts: Account[]
  month: string
  existingPayment?: Payment
}

const STATUSES: PaymentStatus[] = ['paid', 'partial', 'unpaid', 'late', 'autopay', 'na']

export function AddPaymentDialog({ open, onClose, accounts, month, existingPayment }: Props) {
  const upsert = useUpsertPayment()
  const [accountId, setAccountId] = useState(existingPayment?.account_id ?? '')
  const [amtDue, setAmtDue] = useState(existingPayment?.amt_due?.toString() ?? '')
  const [amtPaid, setAmtPaid] = useState(existingPayment?.amt_paid?.toString() ?? '')
  const [datePaid, setDatePaid] = useState(existingPayment?.date_paid ?? '')
  const [status, setStatus] = useState<PaymentStatus>(existingPayment?.status ?? 'unpaid')
  const [confirmation, setConfirmation] = useState(existingPayment?.confirmation ?? '')
  const [notes, setNotes] = useState(existingPayment?.notes ?? '')
  const [error, setError] = useState('')

  if (!open) return null

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
          {/* Account */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Account</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select account…</option>
              {accounts.filter(a => a.is_active).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

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

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={upsert.isPending}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {upsert.isPending ? 'Saving…' : 'Save payment'}
          </button>
        </div>
      </div>
    </div>
  )
}
