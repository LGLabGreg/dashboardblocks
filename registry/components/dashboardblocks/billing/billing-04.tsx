'use client'

import {
  formatCurrency,
  getRevenueMetrics,
} from '@/registry/components/dashboardblocks/billing'
import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatValue,
  formatStatValue,
} from '@/registry/components/dashboardblocks/stat-group'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RevenueSnapshot {
  /** Paying customers at the end of the period. */
  customers: number
  mrr: number
  /** Trailing twelve months, as a fraction: 1.08 is 108%. */
  netRevenueRetention: number
}

interface Billing4Props {
  /** @default 'USD' */
  currency?: string
  current: RevenueSnapshot
  description: string
  previous: RevenueSnapshot
  title: string
}

const exampleProps: Billing4Props = {
  current: { customers: 1_284, mrr: 201_530, netRevenueRetention: 1.124 },
  description: 'September compared with August',
  previous: { customers: 1_203, mrr: 182_400, netRevenueRetention: 1.098 },
  title: 'Revenue',
}

const Billing4 = (props: Billing4Props) => {
  const { currency = 'USD', current, description, previous, title } = props
  const now = getRevenueMetrics(current)
  const before = getRevenueMetrics(previous)
  const money = (value: number) => formatCurrency(value, { currency, fractionDigits: 0 })

  const metrics: (StatMetric & { hint: string })[] = [
    {
      formatter: money,
      hint: 'Monthly recurring revenue',
      key: 'mrr',
      label: 'MRR',
      previous: previous.mrr,
      value: current.mrr,
    },
    {
      formatter: (value) => formatCurrency(value, { compact: true, currency }),
      hint: 'MRR × 12',
      key: 'arr',
      label: 'ARR',
      previous: before.arr,
      value: now.arr,
    },
    {
      formatter: (value) => formatCurrency(value, { currency, fractionDigits: 2 }),
      hint: `Per customer, across ${current.customers.toLocaleString('en-US')}`,
      key: 'arpu',
      label: 'ARPU',
      previous: before.arpu,
      value: now.arpu,
    },
    {
      changeType: 'points',
      formatter: (value) => `${value.toFixed(1)}%`,
      hint: 'Net revenue retention, trailing 12 months',
      key: 'nrr',
      label: 'NRR',
      previous: Math.round(previous.netRevenueRetention * 1000) / 10,
      value: Math.round(current.netRevenueRetention * 1000) / 10,
    },
  ]

  return (
    <Card className='@container gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <StatGroup className='grid-cols-2 @2xl:grid-cols-4'>
        {metrics.map((metric) => (
          <Stat key={metric.key} className='p-4 @xl:p-6'>
            <StatLabel className='truncate text-xs @xl:text-sm'>{metric.label}</StatLabel>
            <StatValue className='text-xl tabular-nums @xl:text-2xl'>
              {formatStatValue(metric)}
            </StatValue>
            <StatChange metric={metric} />
            <dd className='text-muted-foreground mt-1 text-xs'>{metric.hint}</dd>
          </Stat>
        ))}
      </StatGroup>
    </Card>
  )
}

export { Billing4, exampleProps as billing4ExampleProps, type Billing4Props }
