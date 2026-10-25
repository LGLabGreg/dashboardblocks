'use client'

import {
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
  getStatColumns,
  getStatPlaceholders,
} from '@/registry/components/dashboardblocks/stat-group'
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface StatGroup1Props extends BlockStateProps {
  /** Follows each previous value, such as `last month`. */
  comparison: string
  /** Leave out, or pass none, to show the empty state. */
  metrics?: StatMetric[]
  /** How many metrics to sketch while loading. @default 3 */
  placeholders?: number
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
  const { comparison, metrics = [], placeholders = 3, errorMessage, status } = props
  const shown = status === 'loading' ? getStatPlaceholders(placeholders) : metrics

  return (
    <BlockStateProvider
      errorMessage={errorMessage}
      state={getBlockState(status, metrics)}
    >
      <section className='@container flex flex-col gap-4'>
        <StatGroup className={getStatColumns(shown.length)}>
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
