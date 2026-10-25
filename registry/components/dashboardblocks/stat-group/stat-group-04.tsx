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
  getStatPlaceholders,
} from '@/registry/components/dashboardblocks/stat-group'
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface StatGroup4Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  metrics?: StatMetric[]
  /** How many metrics to sketch while loading. @default 5 */
  placeholders?: number
}

const exampleProps: StatGroup4Props = {
  metrics: [
    {
      formatter: (value) => formatCurrency(value, { compact: true }),
      key: 'mrr',
      label: 'MRR',
      previous: 80_800,
      value: 84_200,
    },
    { key: 'customers', label: 'Customers', previous: 1_186, value: 1_241 },
    {
      formatter: (value) => formatCurrency(value, { precision: 'exact' }),
      key: 'arpu',
      label: 'ARPU',
      previous: 68.13,
      value: 67.85,
    },
    {
      changeType: 'points',
      formatter: (value) => formatPercent(value / 100),
      goodDirection: 'down',
      key: 'churn',
      label: 'Churn',
      previous: 2.4,
      value: 2.1,
    },
    {
      changeType: 'points',
      key: 'nps',
      label: 'NPS',
      previous: 44,
      value: 48,
    },
  ],
}

const StatGroup4 = (props: StatGroup4Props) => {
  const { metrics = [], placeholders = 5, errorMessage, status } = props
  const shown = status === 'loading' ? getStatPlaceholders(placeholders) : metrics

  return (
    <BlockStateProvider
      errorMessage={errorMessage}
      state={getBlockState(status, metrics)}
    >
      <section className='@container flex flex-col gap-4'>
        <StatGroup className='grid-cols-2 gap-x-4 gap-y-3 @2xl:auto-cols-fr @2xl:grid-flow-col @2xl:grid-cols-none'>
          {shown.map((metric) => (
            <Stat
              key={metric.key}
              className='flex-row flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-2'
            >
              <StatLabel className='basis-full truncate text-xs'>
                {metric.label}
              </StatLabel>
              <StatValue className='text-2xl'>{formatStatValue(metric)}</StatValue>
              <StatChange className='text-xs' metric={metric} variant='short' />
            </Stat>
          ))}
        </StatGroup>
      </section>
    </BlockStateProvider>
  )
}

export { StatGroup4, exampleProps as statGroup4ExampleProps, type StatGroup4Props }
