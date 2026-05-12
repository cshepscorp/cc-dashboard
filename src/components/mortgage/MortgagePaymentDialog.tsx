import { useState } from 'react'
import type { Account, MortgagePayment } from '@/types'
import { useUpsertMortgagePayment, useDeleteMortgagePayment } from '@/hooks/useData'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  account: Account
  month: string
  existingPayment?: MortgagePayment
  lastPayment?: MortgagePayment
}

export function MortgagePaymentDialog({ open, onClose, account, month, existingPayment, lastPayment }: Props) {
  const upsert = useUpsertMortgagePayment()
  const remove = useDeleteMortgagePayment()

  const [principal, setPrincipal] = useState(existingPayment?.principal?.toString() ?? lastPayment?.principal?.toString() ?? '')
  const [extraPrincipal, setExtraPrincipal] = useState(existingPayment?.extra_principal?.toString() ?? '')
  const [interest, setInterest] = useState(existingPayment?.interest?.toString() ?? lastPayment?.interest?.toString() ?? '')
  const [escrow, setEscrow] = useState(existingPayment?.escrow?.toString() ?? lastPayment?.escrow?.toString() ?? '')
  const [datePaid, setDatePaid] = useState(existingPayment?.date_paid ?? `${month}-01`)
  const [notes, setNotes] = useState(existingPayment?.notes ?? '')
  const [error, setError] = useState('')

  if (!open) return null

  const total =
    (parseFloat(principal) || 0) +
    (parseFloat(extraPrincipal) || 0) +
    (parseFloat(interest) || 0) +
    (parseFloat(escrow) || 0)

  const handleSubmit = async () => {
    setError('')
    try {
      await upsert.mutateAsync({
        ...(existingPayment?.id ? { id: existingPayment.id } : {}),
        account_id: account.id,
        month,
        principal: principal ? parseFloat(principal) : null,
        extra_principal: extraPrincipal ? parseFloat(extraPrincipal) : null,
        interest: interest ? parseFloat(interest) : null,
        escrow: escrow ? parseFloat(escrow) : null,
        total_paid: total || null,
        date_paid: datePaid || null,
        notes: notes || null,
      })
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    }
  }

  const handleDelete = async () => {
    if (!existingPayment?.id) return
    if (!window.confirm('Delete this mortgage payment?')) return
    try {
      await remove.mutateAsync({ id: existingPayment.id, accountId: account.id })
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    }
  }

  const isPending = upsert.isPending || remove.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
      <div className="bg-card border rounded-t-2xl md:rounded-xl shadow-lg w-full max-w-md mx-0 md:mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">
            {existingPayment ? 'Edit payment' : 'Log payment'} — {account.name}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!existingPayment && lastPayment && (
          <p className="text-xs text-muted-foreground">Pre-filled from {lastPayment.month}. Adjust as needed.</p>
        )}

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Principal</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={principal}
                onChange={e => setPrincipal(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Interest</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={interest}
                onChange={e => setInterest(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Escrow</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={escrow}
                onChange={e => setEscrow(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Extra principal</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00 (optional)"
              value={extraPrincipal}
              onChange={e => setExtraPrincipal(e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {total > 0 && (
            <div className="px-3 py-2 rounded-md bg-muted/40 text-sm flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

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
