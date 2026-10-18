'use client'

import {
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
  useBlockState,
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

interface StatGroup5Props {
  /** Follows each previous value, such as `the previous 30 days`. */
  comparison: string
  /** @default 'This period' */
  currentLabel?: string
  description: string
  /** Leave out, or pass none, to show the empty state. */
  metrics?: StatMetric[]
  /** How many metrics to sketch while loading. @default 4 */
  placeholders?: number
  status?: BlockStatus
  title: string
}

const exampleProps: StatGroup5Props = {
  comparison: 'the 30 days before',
  currentLabel: 'Last 30 days',
  description:
    'The last 30 days against the 30 before. Revenue grew while trial conversion slipped.',
  metrics: [
    {
      formatter: (value) => formatCurrency(value),
      key: 'revenue',
      label: 'Revenue',
      previous: 42_890,
      value: 48_210,
    },
    { key: 'signups', label: 'New customers', previous: 318, value: 342 },
    {
      changeType: 'points',
      formatter: (value) => formatPercent(value / 100),
      key: 'conversion',
      label: 'Trial conversion',
      previous: 19.8,
      value: 18.6,
    },
    {
      formatter: (value) => `${formatNumber(value)} h`,
      goodDirection: 'down',
      key: 'response',
      label: 'First response time',
      previous: 5.6,
      value: 4.2,
    },
  ],
  title: 'Overview',
}

function PeriodBars({ metric }: { metric: StatMetric }) {
  const loading = useBlockState() === 'loading'
  if (loading) {
    return (
      <dd
        aria-hidden
        className='mt-3 flex animate-pulse flex-col gap-1 motion-reduce:animate-none'
      >
        <span className='bg-muted h-1.5 rounded-full' />
        <span className='bg-muted h-1.5 w-3/4 rounded-full' />
      </dd>
    )
  }
  if (metric.previous === undefined) return null
  const max = Math.max(Math.abs(metric.value), Math.abs(metric.previous)) || 1

  return (
    <dd aria-hidden className='mt-3 flex flex-col gap-1'>
      <span
        className='bg-chart-2 h-1.5 rounded-full'
        style={{ width: `${(Math.abs(metric.value) / max) * 100}%` }}
      />
      <span
        className='bg-muted-foreground/30 h-1.5 rounded-full'
        style={{ width: `${(Math.abs(metric.previous) / max) * 100}%` }}
      />
    </dd>
  )
}

const StatGroup5 = (props: StatGroup5Props) => {
  const {
    comparison,
    currentLabel = 'This period',
    description,
    metrics = [],
    placeholders = 4,
    status,
    title,
  } = props
  const state = getBlockState(status, metrics)
  const shown = status === 'loading' ? getStatPlaceholders(placeholders) : metrics

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <StatGroup className='grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-4'>
          {shown.map((metric) => (
            <Stat key={metric.key}>
              <StatLabel>{metric.label}</StatLabel>
              <StatValue className='text-3xl @4xl:text-4xl'>
                {formatStatValue(metric)}
              </StatValue>
              <StatChange comparison={comparison} metric={metric} />
              <PeriodBars metric={metric} />
            </Stat>
          ))}
        </StatGroup>
        {state !== 'error' && state !== 'empty' && (
          <p
            aria-hidden
            className='text-muted-foreground flex items-center gap-4 text-xs'
          >
            <span className='flex items-center gap-1.5'>
              <span className='bg-chart-2 h-1.5 w-3 rounded-full' />
              {currentLabel}
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='bg-muted-foreground/30 h-1.5 w-3 rounded-full' />
              <span className='first-letter:uppercase'>{comparison}</span>
            </span>
          </p>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { StatGroup5, exampleProps as statGroup5ExampleProps, type StatGroup5Props }
