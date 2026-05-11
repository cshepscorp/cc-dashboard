import type { UpcomingPayment } from '@/types'
import { STATUS_LABELS, STATUS_VARIANTS } from '@/lib/utils'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'

interface Props {
  upcoming: UpcomingPayment[]
}

export function UpcomingDue({ upcoming }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 h-full">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Due in the next 14 days</h2>
      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Nothing due in the next 14 days.
        </p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map(({ account, due_date, days_until_due, last_payment }) => (
            <li
              key={account.id}
              className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium truncate">{account.name}</p>
                  {account.is_personal && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 shrink-0">
                      personal
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Due {format(due_date, 'MMM d')} · {days_until_due === 0 ? 'today' : `${days_until_due}d`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {last_payment && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_VARIANTS[last_payment.status]}`}
                  >
                    {STATUS_LABELS[last_payment.status]}
                  </span>
                )}
                {account.portal_url && account.portal_url !== '#' && (
                  <a
                    href={account.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title={`Pay ${account.name}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
