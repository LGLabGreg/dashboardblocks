'use client'

import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatValue,
  formatStatValue,
} from '@/registry/components/dashboardblocks/stat-group'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatGroup5Props {
  description: string
  metrics: StatMetric[]
  title: string
}

const currency = (value: number) =>
  `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const exampleProps: StatGroup5Props = {
  description: 'Last 30 days, compared with the previous 30 days',
  metrics: [
    {
      formatter: currency,
      key: 'revenue',
      label: 'Revenue',
      previous: 42_890,
      value: 48_210,
    },
    { key: 'signups', label: 'New customers', previous: 318, value: 342 },
    {
      changeType: 'points',
      formatter: (value) => `${value}%`,
      key: 'conversion',
      label: 'Trial conversion',
      previous: 19.8,
      value: 18.6,
    },
    {
      formatter: (value) => `${value} h`,
      goodDirection: 'down',
      key: 'response',
      label: 'First response time',
      previous: 5.6,
      value: 4.2,
    },
  ],
  title: 'Overview',
}

const StatGroup5 = (props: StatGroup5Props) => {
  const { description, metrics, title } = props

  return (
    <Card className='@container gap-0 py-0'>
      <CardHeader className='border-b pt-6'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <StatGroup className='grid-cols-1 @md:grid-cols-2 @[44rem]:grid-cols-4'>
        {metrics.map((metric) => (
          <Stat key={metric.key} className='gap-2 @[44rem]:px-5'>
            <StatLabel>{metric.label}</StatLabel>
            <StatValue>{formatStatValue(metric)}</StatValue>
            <StatChange metric={metric} variant='badge' />
          </Stat>
        ))}
      </StatGroup>
    </Card>
  )
}

export { StatGroup5, exampleProps as statGroup5ExampleProps, type StatGroup5Props }
