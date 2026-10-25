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
import { useId } from 'react'

interface MetricSection {
  key: string
  label: string
  metrics: Metric[]
}

interface MetricList2Props extends BlockStateProps {
  /** Follows the previous value in each change, such as `in August`. */
  comparison?: string
  description: string
  /** Leave out, or pass none, to show the empty state. */
  sections?: MetricSection[]
  title: string
}

const exampleProps: MetricList2Props = {
  comparison: 'in August',
  description: 'September against August.',
  sections: [
    {
      key: 'acquisition',
      label: 'Acquisition',
      metrics: [
        {
          format: 'compact',
          key: 'visitors',
          label: 'Visitors',
          previous: 96_410,
          value: 104_870,
        },
        {
          format: 'number',
          key: 'signups',
          label: 'Sign-ups',
          previous: 3_912,
          value: 4_286,
        },
        {
          format: 'currency',
          goodDirection: 'down',
          key: 'cac',
          label: 'Cost per acquisition',
          previous: 41.2,
          value: 38.9,
        },
      ],
    },
    {
      key: 'engagement',
      label: 'Engagement',
      metrics: [
        {
          format: 'compact',
          key: 'dau',
          label: 'Daily active users',
          previous: 12_840,
          value: 13_310,
        },
        {
          changeType: 'points',
          format: 'percent',
          key: 'stickiness',
          label: 'DAU / MAU',
          previous: 31.4,
          value: 29.8,
        },
        {
          format: 'duration',
          key: 'session',
          label: 'Avg session',
          previous: 402,
          value: 431,
        },
        {
          changeType: 'points',
          format: 'percent',
          key: 'retention',
          label: 'Week 4 retention',
          previous: 38.2,
          value: 38.2,
        },
      ],
    },
    {
      key: 'revenue',
      label: 'Revenue',
      metrics: [
        {
          format: 'currency-compact',
          key: 'mrr',
          label: 'MRR',
          previous: 184_300,
          value: 196_750,
        },
        { format: 'currency', key: 'arpa', label: 'ARPA', previous: 62.1, value: 63.4 },
        {
          changeType: 'points',
          format: 'percent',
          goodDirection: 'down',
          key: 'churn',
          label: 'Revenue churn',
          previous: 2.1,
          value: 2.6,
        },
      ],
    },
  ],
  title: 'Monthly metrics',
}

const MetricList2 = (props: MetricList2Props) => {
  const { comparison, description, sections = [], errorMessage, status, title } = props
  const id = useId()
  const isBetter = (metric: Metric) => {
    const change = getMetricChange(metric) ?? 0
    return metric.goodDirection === 'down' ? change < 0 : change > 0
  }
  const total = sections.reduce((sum, section) => sum + section.metrics.length, 0)
  const improving = sections.reduce(
    (sum, section) => sum + section.metrics.filter(isBetter).length,
    0,
  )
  const state = getBlockState(
    status,
    sections.flatMap((section) => section.metrics),
  )

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              {description}{' '}
              <span className='tabular-nums'>
                {improving} of {total}
              </span>{' '}
              metrics improved.
            </p>
          </BlockReady>
        </header>
        <BlockStateRows className='border-t' rows={6} />
        {!state &&
          sections.map((section) => {
            const headingId = `${id}-${section.key}`
            const better = section.metrics.filter(isBetter).length
            return (
              <section
                key={section.key}
                aria-labelledby={headingId}
                className='flex flex-col border-t pt-3'
              >
                <div className='flex items-baseline justify-between gap-3'>
                  <h3 id={headingId} className='text-sm font-medium'>
                    {section.label}
                  </h3>
                  <p className='text-muted-foreground text-xs tabular-nums'>
                    {better} of {section.metrics.length} improved
                  </p>
                </div>
                <MetricList>
                  {section.metrics.map((metric) => (
                    <MetricRow
                      key={metric.key}
                      comparison={comparison}
                      metric={metric}
                      showSparkline={false}
                    />
                  ))}
                </MetricList>
              </section>
            )
          })}
      </section>
    </BlockStateProvider>
  )
}

export { MetricList2, exampleProps as metricList2ExampleProps, type MetricList2Props }
