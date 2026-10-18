'use client'

import {
  BlockStateProvider,
  type BlockStatus,
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
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface StatGroup1Props {
  /** Follows each previous value, such as `last month`. */
  comparison: string
  /** Leave out, or pass none, to show the empty state. */
  metrics?: StatMetric[]
  /** How many metrics to sketch while loading. @default 3 */
  placeholders?: number
  status?: BlockStatus
}

const exampleProps: StatGroup1Props = {
  comparison: 'last month',
  metrics: [
    {
      formatter: (value) => formatCurrency(value),
      key: 'revenue',
      label: 'Revenue',
      previous: 42_890,
      value: 48_210,
    },
    { key: 'orders', label: 'Orders', previous: 1_210, value: 1_284 },
    {
      changeType: 'points',
      formatter: (value) => formatPercent(value / 100),
      goodDirection: 'down',
      key: 'refundRate',
      label: 'Refund rate',
      previous: 2.1,
      value: 1.8,
    },
  ],
}

const StatGroup1 = (props: StatGroup1Props) => {
  const { comparison, metrics = [], placeholders = 3, status } = props
  const shown = status === 'loading' ? getStatPlaceholders(placeholders) : metrics

  return (
    <BlockStateProvider status={status} empty={metrics.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <StatGroup className='grid-cols-1 @md:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]'>
          {shown.map((metric) => (
            <Stat key={metric.key}>
              <StatLabel>{metric.label}</StatLabel>
              <StatValue className='text-3xl @2xl:text-4xl'>
                {formatStatValue(metric)}
              </StatValue>
              <StatChange comparison={comparison} metric={metric} />
            </Stat>
          ))}
        </StatGroup>
      </section>
    </BlockStateProvider>
  )
}

export { StatGroup1, exampleProps as statGroup1ExampleProps, type StatGroup1Props }
