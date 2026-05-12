import { useState } from 'react'
import type { Account, AccountType } from '@/types'
import { useUpsertAccount } from '@/hooks/useData'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  existingAccount?: Account
}

const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const ACCOUNT_TYPES: AccountType[] = ['credit_card', 'installment', 'personal', 'mortgage', 'auto_loan']

const TYPE_LABELS: Record<AccountType, string> = {
  credit_card: 'Credit Card',
  installment: 'Installment Plan',
  personal: 'Personal Loan',
  mortgage: 'Mortgage',
  auto_loan: 'Auto Loan',
}

export function AddAccountDialog({ open, onClose, existingAccount }: Props) {
  const upsert = useUpsertAccount()
  const [name, setName] = useState(existingAccount?.name ?? '')
  const [type, setType] = useState<AccountType>(existingAccount?.type ?? 'credit_card')
  const [last4, setLast4] = useState(existingAccount?.last4 ?? '')
  const [issuer, setIssuer] = useState(existingAccount?.issuer ?? '')
  const [dueDay, setDueDay] = useState(existingAccount?.due_day?.toString() ?? '1')
  const [apr, setApr] = useState(existingAccount?.apr?.toString() ?? '')
  const [promoApr, setPromoApr] = useState(existingAccount?.promo_apr?.toString() ?? '')
  const [promoEnds, setPromoEnds] = useState(existingAccount?.promo_ends ?? '')
  const [portalUrl, setPortalUrl] = useState(existingAccount?.portal_url ?? '')
  const [isPersonal, setIsPersonal] = useState(existingAccount?.is_personal ?? false)
  const [monthlyPayment, setMonthlyPayment] = useState(existingAccount?.monthly_payment?.toString() ?? '')
  const [payoffDate, setPayoffDate] = useState(existingAccount?.payoff_date ?? '')
  const [originalBalance, setOriginalBalance] = useState(existingAccount?.original_balance?.toString() ?? '')
  const [notes, setNotes] = useState(existingAccount?.notes ?? '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async () => {
    if (!name) { setError('Account name is required.'); return }
    if (!dueDay || parseInt(dueDay) < 1 || parseInt(dueDay) > 31) {
      setError('Due day must be between 1 and 31.')
      return
    }
    setError('')
    setIsLoading(true)

    try {
      const accountData: Partial<Account> & { id: string } = {
        id: existingAccount?.id ?? toSlug(name),
        name,
        type,
        last4: last4 || null,
        issuer: issuer || null,
        due_day: parseInt(dueDay),
        apr: apr ? parseFloat(apr) : null,
        promo_apr: promoApr !== '' ? parseFloat(promoApr) : null,
        promo_ends: promoEnds || null,
        portal_url: portalUrl || null,
        is_personal: isPersonal,
        is_active: true,
        monthly_payment: monthlyPayment ? parseFloat(monthlyPayment) : null,
        payoff_date: payoffDate || null,
        original_balance: originalBalance ? parseFloat(originalBalance) : null,
        notes: notes || null,
      }

      await upsert.mutateAsync(accountData)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border rounded-xl shadow-lg w-full max-w-2xl mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">
            {existingAccount ? 'Edit account' : 'Add account'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary" disabled={isLoading}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {/* Name & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Account name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Capital One Quicksilver"
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Type *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as AccountType)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              >
                {ACCOUNT_TYPES.map(t => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Last4 & Issuer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Last 4 digits</label>
              <input
                type="text"
                maxLength={4}
                value={last4}
                onChange={e => setLast4(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Issuer</label>
              <input
                type="text"
                value={issuer}
                onChange={e => setIssuer(e.target.value)}
                placeholder="e.g. Chase, Amex, Capital One"
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Due Day & APR */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Due day (1-31) *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={e => setDueDay(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">APR (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={apr}
                onChange={e => setApr(e.target.value)}
                placeholder="e.g. 24.99"
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Promo APR & Promo Ends */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Promo APR (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={promoApr}
                onChange={e => setPromoApr(e.target.value)}
                placeholder="e.g. 0 for 0% promo"
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Promo ends</label>
              <input
                type="date"
                value={promoEnds}
                onChange={e => setPromoEnds(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Portal URL */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Payment portal URL</label>
            <input
              type="url"
              value={portalUrl}
              onChange={e => setPortalUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
          </div>

          {/* Monthly Payment & Payoff Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Monthly payment</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monthlyPayment}
                onChange={e => setMonthlyPayment(e.target.value)}
                placeholder="e.g. 650.00"
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Payoff date</label>
              <input
                type="date"
                value={payoffDate}
                onChange={e => setPayoffDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Original Balance */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Original balance</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={originalBalance}
              onChange={e => setOriginalBalance(e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
          </div>

          {/* Is Personal Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-personal"
              checked={isPersonal}
              onChange={e => setIsPersonal(e.target.checked)}
              className="rounded border border-input"
              disabled={isLoading}
            />
            <label htmlFor="is-personal" className="text-xs text-muted-foreground font-medium cursor-pointer">
              Mark as personal loan (e.g. family loan)
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional notes…"
              rows={2}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-destructive font-medium">{error}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving…' : (existingAccount ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  )
}
