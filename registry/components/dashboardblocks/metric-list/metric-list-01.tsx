'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type Metric,
  MetricList,
  MetricRow,
  getMetricChange,
} from '@/registry/components/dashboardblocks/metric-list'
import { formatDate } from '@/registry/lib/dashboardblocks/format'

interface MetricList1Props extends BlockStateProps {
  /** Follows the previous value in each change, such as `the 14 days before`. */
  comparison: string
  /** Names each point of the histories, oldest first. */
  labels?: string[]
  /** Leave out, or pass none, to show the empty state. */
  metrics?: Metric[]
  period: string
  title: string
}

const exampleHistory = (end: number, slope: number, wobble: number, phase = 0) =>
  Array.from({ length: 14 }, (_, day) =>
    Number((end - (13 - day) * slope + Math.sin(day / 1.4 + phase) * wobble).toFixed(2)),
  )

const exampleProps: MetricList1Props = {
  comparison: 'the 14 days before',
  labels: Array.from({ length: 14 }, (_, day) =>
    formatDate(new Date(Date.UTC(2026, 8, 12 + day)), 'day'),
  ),
  metrics: [
    {
      format: 'compact',
      history: exampleHistory(1_910, 22, 140),
      key: 'visitors',
      label: 'Visitors',
      previous: 21_640,
      value: 24_318,
    },
    {
      format: 'compact',
      history: exampleHistory(1_240, 6, 90, 1),
      key: 'signups',
      label: 'Sign-ups',
      previous: 16_820,
      value: 17_402,
    },
    {
      changeType: 'points',
      format: 'percent',
      history: exampleHistory(3.4, 0.03, 0.12, 2),
      key: 'conversion',
      label: 'Conversion rate',
      previous: 3.1,
      value: 3.4,
    },
    {
      format: 'duration',
      history: exampleHistory(188, -1.1, 8, 3),
      key: 'session',
      label: 'Avg session',
      previous: 201,
      value: 188,
    },
    {
      format: 'currency',
      history: exampleHistory(37.6, 0.18, 0.7, 4),
      key: 'aov',
      label: 'Avg order value',
      previous: 35.45,
      value: 37.55,
    },
    {
      changeType: 'points',
      format: 'percent',
      goodDirection: 'down',
      history: exampleHistory(40.5, -0.25, 1, 1),
      key: 'bounce',
      label: 'Bounce rate',
      previous: 44,
      value: 41,
    },
    {
      format: 'milliseconds',
      goodDirection: 'down',
      history: exampleHistory(412, 3, 14, 5),
      key: 'latency',
      label: 'p95 page load',
      previous: 384,
      value: 412,
    },
  ],
  period: 'last 14 days',
  title: 'Key metrics',
}

const MetricList1 = (props: MetricList1Props) => {
  const { comparison, labels, metrics = [], period, errorMessage, status, title } = props
  const state = getBlockState(status, metrics)
  const improved = metrics.filter((metric) => {
    const change = getMetricChange(metric) ?? 0
    return metric.goodDirection === 'down' ? change < 0 : change > 0
  }).length

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              <span className='tabular-nums'>
                {improved} of {metrics.length}
              </span>{' '}
              improved in the {period}, against {comparison}.
            </p>
          </BlockReady>
        </header>
        <BlockStateRows className='border-t' rows={6} />
        {!state && (
          <MetricList className='border-t'>
            {metrics.map((metric) => (
              <MetricRow
                key={metric.key}
                comparison={comparison}
                labels={labels}
                metric={metric}
                period={period}
              />
            ))}
          </MetricList>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { MetricList1, exampleProps as metricList1ExampleProps, type MetricList1Props }
