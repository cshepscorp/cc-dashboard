import type { Account, Payment, PromoAlert } from '@/types'
import { format, parseISO } from 'date-fns'
import { AlertTriangle, Clock } from 'lucide-react'

interface Props {
  accounts: Account[]
  payments: Payment[]
  month: string
  promoAlerts: PromoAlert[]
  onLatePaymentClick?: (account: Account, payment: Payment) => void
}

export function AlertStrip({ accounts, payments, month, promoAlerts, onLatePaymentClick }: Props) {
  const latePayments = payments.filter(
    p => p.status === 'late' && p.month === month
  )

  if (latePayments.length === 0 && promoAlerts.length === 0) return null

  const findAccount = (id: string) => accounts.find(a => a.id === id)

  return (
    <div className="space-y-2">
      {latePayments.map(p => {
        const account = findAccount(p.account_id)
        const clickable = !!onLatePaymentClick && !!account
        return (
          <div
            key={p.id ?? p.account_id}
            onClick={() => clickable && onLatePaymentClick(account!, p)}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm ${clickable ? 'cursor-pointer hover:bg-destructive/10 transition-colors' : ''}`}
          >
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-foreground">
              <strong>Late payment</strong> — {account?.name ?? p.account_id},{' '}
              {format(parseISO(`${p.month}-01`), 'MMMM yyyy')}.
              {p.notes && ` ${p.notes}`}
              {clickable && <span className="ml-2 text-xs text-destructive underline">Edit</span>}
            </span>
          </div>
        )
      })}
      {promoAlerts.map(alert => (
        <div
          key={alert.account.id}
          className="flex items-start gap-3 px-4 py-3 rounded-lg border border-warning/30 bg-warning/5 text-sm"
        >
          <Clock className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <span className="text-foreground">
            <strong>{alert.account.name}</strong> — 0% promo interest ends{' '}
            {format(parseISO(alert.promo_ends), 'MMMM d, yyyy')}{' '}
            ({alert.days_until_expiry} days).
          </span>
        </div>
      ))}
    </div>
  )
}