'use client'

import {
  type Metric,
  MetricList,
  MetricRow,
  getMetricChange,
} from '@/registry/components/dashboardblocks/metric-list'
import { useId } from 'react'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricSection {
  key: string
  label: string
  metrics: Metric[]
}

interface MetricList2Props {
  /** Read after each change by screen readers, for example "vs August". */
  comparison?: string
  description: string
  sections: MetricSection[]
  title: string
}

const exampleProps: MetricList2Props = {
  comparison: 'vs August',
  description: 'September, compared with August',
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
  const { comparison, description, sections, title } = props
  const id = useId()

  return (
    <Card className='@container gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {sections.map((section) => {
        const headingId = `${id}-${section.key}`
        const improving = section.metrics.filter((metric) => {
          const change = getMetricChange(metric) ?? 0
          return metric.goodDirection === 'down' ? change < 0 : change > 0
        }).length
        return (
          <section
            key={section.key}
            aria-labelledby={headingId}
            className='border-b last:border-b-0'
          >
            <div className='bg-muted/50 flex items-baseline justify-between gap-3 border-b px-6 py-2'>
              <h3 id={headingId} className='text-xs font-medium'>
                {section.label}
              </h3>
              <p className='text-muted-foreground text-xs'>
                {improving} of {section.metrics.length} improving
              </p>
            </div>
            <MetricList className='px-6'>
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
    </Card>
  )
}

export { MetricList2, exampleProps as metricList2ExampleProps, type MetricList2Props }
