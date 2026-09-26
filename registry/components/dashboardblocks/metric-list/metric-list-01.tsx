'use client'

import {
  type Metric,
  MetricList,
  MetricRow,
} from '@/registry/components/dashboardblocks/metric-list'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface MetricList1Props {
  description: string
  metrics: Metric[]
  /** Names the sparklines' period for screen readers. */
  period: string
  title: string
}

/** Fourteen days of example values that end on `end`. */
const exampleHistory = (end: number, slope: number, wobble: number, phase = 0) =>
  Array.from({ length: 14 }, (_, day) =>
    Number((end - (13 - day) * slope + Math.sin(day / 1.4 + phase) * wobble).toFixed(2)),
  )

const exampleProps: MetricList1Props = {
  description: 'Last 14 days, compared with the previous 14 days',
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
  const { description, metrics, period, title } = props

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <MetricList className='-my-3'>
          {metrics.map((metric) => (
            <MetricRow key={metric.key} metric={metric} period={period} />
          ))}
        </MetricList>
      </CardContent>
    </Card>
  )
}

export { MetricList1, exampleProps as metricList1ExampleProps, type MetricList1Props }
