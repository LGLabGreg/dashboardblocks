'use client'

import { getRevenueMetrics } from '@/registry/components/dashboardblocks/billing'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatValue,
  formatStatValue,
  getStatPlaceholders,
} from '@/registry/components/dashboardblocks/stat-group'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'

interface RevenueSnapshot {
  customers: number
  mrr: number
  /** Trailing twelve months, as a fraction: 1.08 is 108%. */
  netRevenueRetention: number
}

interface Billing4Props extends BlockStateProps {
  /** Follows each previous value. @default 'last month' */
  comparison?: string
  /** @default 'USD' */
  currency?: string
  /** Leave out to show the empty state. */
  current?: RevenueSnapshot
  description: string
  previous?: RevenueSnapshot
  title: string
}

const exampleProps: Billing4Props = {
  comparison: 'in August',
  current: { customers: 1_284, mrr: 201_530, netRevenueRetention: 1.124 },
  description:
    'September 2026. 81 more customers than August, each paying a little more.',
  previous: { customers: 1_203, mrr: 182_400, netRevenueRetention: 1.098 },
  title: 'Revenue',
}

function getMetrics(
  current: RevenueSnapshot,
  previous: RevenueSnapshot | undefined,
  currency: string,
): (StatMetric & { hint: string })[] {
  const now = getRevenueMetrics(current)
  const before = previous ? getRevenueMetrics(previous) : undefined
  const money = (value: number) => formatCurrency(value, { currency })

  return [
    {
      formatter: money,
      hint: 'Monthly recurring revenue',
      key: 'mrr',
      label: 'MRR',
      previous: previous?.mrr,
      value: current.mrr,
    },
    {
      formatter: (value) => formatCurrency(value, { compact: true, currency }),
      hint: 'MRR × 12',
      key: 'arr',
      label: 'ARR',
      previous: before?.arr,
      value: now.arr,
    },
    {
      formatter: (value) => formatCurrency(value, { currency, precision: 'exact' }),
      hint: `Per customer, across ${formatNumber(current.customers)}`,
      key: 'arpu',
      label: 'ARPU',
      previous: before?.arpu,
      value: now.arpu,
    },
    {
      changeType: 'points',
      formatter: (value) => formatPercent(value / 100),
      hint: 'Net revenue retention, last 12 months',
      key: 'nrr',
      label: 'NRR',
      previous: previous
        ? Math.round(previous.netRevenueRetention * 1000) / 10
        : undefined,
      value: Math.round(current.netRevenueRetention * 1000) / 10,
    },
  ]
}

const Billing4 = (props: Billing4Props) => {
  const {
    comparison = 'last month',
    currency = 'USD',
    current,
    description,
    previous,
    errorMessage,
    status,
    title,
  } = props
  const metrics = current ? getMetrics(current, previous, currency) : []
  const shown: (StatMetric & { hint?: string })[] =
    status === 'loading' ? getStatPlaceholders(4) : metrics

  return (
    <BlockStateProvider
      errorMessage={errorMessage}
      state={getBlockState(status, metrics)}
    >
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <StatGroup className='grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-4'>
          {shown.map((metric) => (
            <Stat key={metric.key}>
              <StatLabel>{metric.label}</StatLabel>
              <StatValue className='text-3xl @2xl:text-4xl'>
                {formatStatValue(metric)}
              </StatValue>
              <StatChange comparison={comparison} metric={metric} />
              <dd className='text-muted-foreground text-xs'>
                <BlockReady className='text-xs'>{metric.hint}</BlockReady>
              </dd>
            </Stat>
          ))}
        </StatGroup>
      </section>
    </BlockStateProvider>
  )
}

export { Billing4, exampleProps as billing4ExampleProps, type Billing4Props }
