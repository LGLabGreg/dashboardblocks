'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { getKPIChange } from '@/registry/components/dashboardblocks/kpi'
import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatSparkline,
  StatValue,
  formatStatValue,
  getStatPlaceholders,
} from '@/registry/components/dashboardblocks/stat-group'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'

interface SparklineMetric extends StatMetric {
  /** One value per day, oldest first. */
  history: number[]
}

interface StatGroup2Props {
  /** Follows each previous value, such as `the 14 days before`. @default 'the previous period' */
  comparison?: string
  /** Defaults to a sentence saying how many metrics improved. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  metrics?: SparklineMetric[]
  /** How many metrics to sketch while loading. @default 4 */
  placeholders?: number
  status?: BlockStatus
  title: string
}

const exampleHistory = (end: number, slope: number, wobble: number, phase = 0) =>
  Array.from({ length: 14 }, (_, day) =>
    Number((end - (13 - day) * slope + Math.sin(day / 1.3 + phase) * wobble).toFixed(2)),
  )

const exampleProps: StatGroup2Props = {
  comparison: 'the 14 days before',
  metrics: [
    {
      history: exampleHistory(1_910, 22, 140),
      key: 'visitors',
      label: 'Visitors',
      previous: 21_640,
      value: 24_318,
    },
    {
      changeType: 'points',
      formatter: (value) => formatPercent(value / 100),
      history: exampleHistory(3.4, 0.03, 0.12, 2),
      key: 'conversion',
      label: 'Conversion rate',
      previous: 3.1,
      value: 3.4,
    },
    {
      formatter: (value) => formatCurrency(value, { precision: 'exact' }),
      history: exampleHistory(37.6, 0.18, 0.7, 4),
      key: 'aov',
      label: 'Avg order value',
      previous: 35.45,
      value: 37.55,
    },
    {
      changeType: 'points',
      formatter: (value) => formatPercent(value / 100),
      goodDirection: 'down',
      history: exampleHistory(40.5, -0.25, 1, 1),
      key: 'bounce',
      label: 'Bounce rate',
      previous: 44,
      value: 41,
    },
  ],
  title: 'Store performance',
}

const describeHistory = (metric: SparklineMetric) => {
  const format = metric.formatter ?? ((value: number) => formatNumber(value))
  const first = metric.history[0]
  const last = metric.history[metric.history.length - 1]
  const direction = last > first ? 'Up' : last < first ? 'Down' : 'Flat'
  return `${metric.label} by day: ${direction} from ${format(first)} to ${format(last)}`
}

const daysAgo = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const ago = count - 1 - index
    return ago === 0 ? 'Today' : ago === 1 ? 'Yesterday' : `${ago} days ago`
  })

function summarize(metrics: SparklineMetric[], comparison: string) {
  const improved = metrics.filter((metric) => {
    const change = getKPIChange(metric) ?? 0
    return metric.goodDirection === 'down' ? change < 0 : change > 0
  }).length
  if (improved === metrics.length)
    return `All ${improved} metrics improved on ${comparison}.`
  return `${improved} of ${metrics.length} metrics improved on ${comparison}.`
}

const StatGroup2 = (props: StatGroup2Props) => {
  const {
    comparison = 'the previous period',
    metrics = [],
    placeholders = 4,
    status,
    title,
  } = props
  const { description = summarize(metrics, comparison) } = props
  const shown: SparklineMetric[] =
    status === 'loading'
      ? getStatPlaceholders(placeholders).map((metric) => ({
          ...metric,
          history: [],
        }))
      : metrics

  return (
    <BlockStateProvider state={getBlockState(status, metrics)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <StatGroup className='grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-4'>
          {shown.map((metric) => (
            <Stat
              key={metric.key}
              className='grid grid-cols-[minmax(0,1fr)_6rem] content-start gap-x-4 gap-y-1 @md:grid-cols-1'
            >
              <StatLabel>{metric.label}</StatLabel>
              <StatValue className='text-3xl @4xl:text-4xl'>
                {formatStatValue(metric)}
              </StatValue>
              <StatChange comparison={comparison} metric={metric} variant='short' />
              <dd className='col-start-2 row-span-3 row-start-1 self-center @md:col-start-1 @md:row-span-1 @md:row-start-4 @md:mt-3'>
                <StatSparkline
                  data={metric.history}
                  formatter={metric.formatter}
                  label={describeHistory(metric)}
                  labels={daysAgo(metric.history.length)}
                />
              </dd>
            </Stat>
          ))}
        </StatGroup>
      </section>
    </BlockStateProvider>
  )
}

export { StatGroup2, exampleProps as statGroup2ExampleProps, type StatGroup2Props }
