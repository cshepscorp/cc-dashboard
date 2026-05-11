import type { MonthSummary } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, AlertCircle, Clock, TrendingDown } from 'lucide-react'

interface Props {
  summary: MonthSummary
}

export function SummaryCards({ summary }: Props) {
  const cards = [
    {
      label: 'Total paid',
      value: formatCurrency(summary.total_paid),
      sub: `of ${formatCurrency(summary.total_due)} due`,
      icon: TrendingDown,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Accounts paid',
      value: `${summary.paid_count}`,
      sub: 'fully paid or autopay',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Partial / unpaid',
      value: `${summary.partial_count + summary.unpaid_count}`,
      sub: 'need attention',
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
    {
      label: 'Late payments',
      value: `${summary.late_count}`,
      sub: summary.late_count > 0 ? 'action required' : 'all clear',
      icon: AlertCircle,
      color: summary.late_count > 0
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground',
      bg: summary.late_count > 0
        ? 'bg-red-50 dark:bg-red-950/30'
        : 'bg-muted',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div
          key={card.label}
          className="rounded-xl border bg-card p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <div className={`p-1.5 rounded-md ${card.bg}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl font-semibold">{card.value}</p>
          <p className="text-xs text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
