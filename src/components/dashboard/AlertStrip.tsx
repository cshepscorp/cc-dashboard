import type { Account, Payment, PromoAlert } from '@/types'
import { format, parseISO } from 'date-fns'
import { AlertTriangle, Clock } from 'lucide-react'

interface Props {
  accounts: Account[]
  payments: Payment[]
  month: string
  promoAlerts: PromoAlert[]
}

export function AlertStrip({ accounts, payments, month, promoAlerts }: Props) {
  const latePayments = payments.filter(
    p => p.status === 'late' && p.month === month
  )

  if (latePayments.length === 0 && promoAlerts.length === 0) return null

  const accountName = (id: string) =>
    accounts.find(a => a.id === id)?.name ?? id

  return (
    <div className="space-y-2">
      {latePayments.map(p => (
        <div
          key={p.id ?? p.account_id}
          className="flex items-start gap-3 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm"
        >
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <span className="text-foreground">
            <strong>Late payment</strong> — {accountName(p.account_id)},{' '}
            {format(parseISO(`${p.month}-01`), 'MMMM yyyy')}.
            {p.notes && ` ${p.notes}`}
          </span>
        </div>
      ))}
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