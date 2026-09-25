'use client'

import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatSparkline,
  StatValue,
  formatStatValue,
} from '@/registry/components/dashboardblocks/stat-group'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SparklineMetric extends StatMetric {
  /** One value per day, oldest first. */
  history: number[]
}

interface StatGroup2Props {
  description: string
  metrics: SparklineMetric[]
  title: string
}

/** Fourteen days of example values that end on `end`. */
const exampleHistory = (end: number, slope: number, wobble: number, phase = 0) =>
  Array.from({ length: 14 }, (_, day) =>
    Number((end - (13 - day) * slope + Math.sin(day / 1.3 + phase) * wobble).toFixed(2)),
  )

const exampleProps: StatGroup2Props = {
  description: 'Last 14 days, compared with the previous 14 days',
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
      formatter: (value) => `${value}%`,
      history: exampleHistory(3.4, 0.03, 0.12, 2),
      key: 'conversion',
      label: 'Conversion rate',
      previous: 3.1,
      value: 3.4,
    },
    {
      formatter: (value) => `$${value.toFixed(2)}`,
      history: exampleHistory(37.6, 0.18, 0.7, 4),
      key: 'aov',
      label: 'Avg order value',
      previous: 35.45,
      value: 37.55,
    },
    {
      changeType: 'points',
      formatter: (value) => `${value}%`,
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
  const format = metric.formatter ?? ((value: number) => value.toLocaleString())
  const first = metric.history[0]
  const last = metric.history[metric.history.length - 1]
  const direction = last > first ? 'Up' : last < first ? 'Down' : 'Flat'
  return `${metric.label} by day: ${direction} from ${format(first)} to ${format(last)}`
}

const StatGroup2 = (props: StatGroup2Props) => {
  const { description, metrics, title } = props

  return (
    <Card className='@container gap-0 py-0'>
      <CardHeader className='border-b pt-6'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <StatGroup className='grid-cols-1 @md:grid-cols-2 @[44rem]:grid-cols-4'>
        {metrics.map((metric) => (
          <Stat
            key={metric.key}
            className='grid grid-cols-[minmax(0,1fr)_6rem] content-start gap-x-4 gap-y-1 @md:grid-cols-1 @[44rem]:px-5'
          >
            <StatLabel>{metric.label}</StatLabel>
            <StatValue>{formatStatValue(metric)}</StatValue>
            <StatChange metric={metric} />
            <dd className='col-start-2 row-span-3 row-start-1 self-center @md:col-start-1 @md:row-span-1 @md:row-start-4 @md:mt-4'>
              <StatSparkline data={metric.history} label={describeHistory(metric)} />
            </dd>
          </Stat>
        ))}
      </StatGroup>
    </Card>
  )
}

export { StatGroup2, exampleProps as statGroup2ExampleProps, type StatGroup2Props }
