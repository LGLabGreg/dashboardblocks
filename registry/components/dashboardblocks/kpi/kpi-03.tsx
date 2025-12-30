'use client'

import { ValueFormatter } from '@/registry/components/dashboardblocks/chart'
import { KPI, KPIContent, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { CardDescription } from '@/components/ui/card'

interface KPI3Props {
  trend: number
  description: string
  title: string
  value: number
  formatter?: ValueFormatter
}

const exampleProps: KPI3Props = {
  trend: -2.1,
  description: 'Compared to last month',
  title: 'Conversion Rate',
  value: 3.24,
  formatter: (value) => `${value.toLocaleString()}%`,
}

const KPI3 = (props: KPI3Props) => {
  const { trend, description, title, value, formatter } = props
  return (
    <KPI>
      <KPIContent className='space-y-2'>
        <CardDescription>{title}</CardDescription>
        <KPIValue value={value} formatter={formatter} animated />
        <div className='flex items-center justify-between border-t pt-2 mt-3'>
          <CardDescription>{description}</CardDescription>
          <Trend trend={trend} variant='badge' />
        </div>
      </KPIContent>
    </KPI>
  )
}

export { KPI3, exampleProps as kpi3ExampleProps, type KPI3Props }
