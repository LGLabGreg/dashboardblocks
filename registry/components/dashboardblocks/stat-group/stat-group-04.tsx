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

interface StatGroup4Props {
  metrics: StatMetric[]
}

const compactCurrency = (value: number) =>
  `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, notation: 'compact' }).format(value)}`

const exampleProps: StatGroup4Props = {
  metrics: [
    {
      formatter: compactCurrency,
      key: 'mrr',
      label: 'MRR',
      previous: 80_800,
      value: 84_200,
    },
    { key: 'customers', label: 'Customers', previous: 1_186, value: 1_241 },
    {
      formatter: (value) => `$${value.toFixed(2)}`,
      key: 'arpu',
      label: 'ARPU',
      previous: 68.13,
      value: 67.85,
    },
    {
      changeType: 'points',
      formatter: (value) => `${value}%`,
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
  const { metrics } = props

  return (
    <Card className='@container gap-0 py-0'>
      <StatGroup className='grid-cols-2 @2xl:auto-cols-fr @2xl:grid-flow-col @2xl:grid-cols-none [&>:last-child:nth-child(odd)]:col-span-2 @2xl:[&>:last-child:nth-child(odd)]:col-span-1'>
        {metrics.map((metric) => (
          <Stat key={metric.key} className='gap-0.5 px-4 py-3'>
            <StatLabel className='text-xs'>{metric.label}</StatLabel>
            <StatValue className='text-lg'>{formatStatValue(metric)}</StatValue>
            <StatChange metric={metric} showPrevious={false} />
          </Stat>
        ))}
      </StatGroup>
    </Card>
  )
}

export { StatGroup4, exampleProps as statGroup4ExampleProps, type StatGroup4Props }
