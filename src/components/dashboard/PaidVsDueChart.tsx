import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import type { Payment } from '@/types'
import { formatCurrencyShort, getMonthSummary } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

interface Props {
  payments: Payment[]
}

const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05']

export function PaidVsDueChart({ payments }: Props) {
  const chartData = MONTHS.map(month => {
    const summary = getMonthSummary(payments, month)
    return {
      month: format(parseISO(`${month}-01`), 'MMM'),
      Paid: Math.round(summary.total_paid),
      Due: Math.round(summary.total_due),
    }
  })

  return (
    <div className="rounded-xl border bg-card p-4 h-full">
      <h2 className="text-sm font-medium text-muted-foreground mb-4">Paid vs due — 2026</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatCurrencyShort}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip
            formatter={(val: number) => [`$${val.toLocaleString()}`, undefined]}
            contentStyle={{
              borderRadius: '8px',
              fontSize: '13px',
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--popover))',
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Legend
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          />
          <Bar dataKey="Paid" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Due" fill="#f97316" radius={[4, 4, 0, 0]} opacity={0.6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
