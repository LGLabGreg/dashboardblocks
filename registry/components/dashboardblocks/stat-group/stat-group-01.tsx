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

import { Card } from '@/components/ui/card'

interface StatGroup1Props {
  metrics: StatMetric[]
}

const currency = (value: number) =>
  `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const exampleProps: StatGroup1Props = {
  metrics: [
    {
      formatter: currency,
      key: 'revenue',
      label: 'Revenue',
      previous: 42_890,
      value: 48_210,
    },
    { key: 'orders', label: 'Orders', previous: 1_210, value: 1_284 },
    {
      changeType: 'points',
      formatter: (value) => `${value}%`,
      goodDirection: 'down',
      key: 'refundRate',
      label: 'Refund rate',
      previous: 2.1,
      value: 1.8,
    },
  ],
}

const StatGroup1 = (props: StatGroup1Props) => {
  const { metrics } = props

  return (
    <Card className='@container gap-0 py-0'>
      <StatGroup
        style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
      >
        {metrics.map((metric) => (
          <Stat key={metric.key} className='p-4 @xl:p-6'>
            <StatLabel className='text-xs @xl:text-sm'>{metric.label}</StatLabel>
            <StatValue className='text-xl @xl:text-3xl'>
              {formatStatValue(metric)}
            </StatValue>
            <StatChange metric={metric} />
          </Stat>
        ))}
      </StatGroup>
    </Card>
  )
}

export { StatGroup1, exampleProps as statGroup1ExampleProps, type StatGroup1Props }
