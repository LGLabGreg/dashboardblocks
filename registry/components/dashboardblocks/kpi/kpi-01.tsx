'use client'

import { ValueFormatter } from '@/registry/components/dashboardblocks/chart'
import { KPI, KPIContent, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { CardDescription } from '@/components/ui/card'

interface KPI1Props {
  trend: number
  title: string
  value: number
  formatter?: ValueFormatter
}

const exampleProps: KPI1Props = {
  trend: 20.1,
  title: 'Total Revenue',
  value: 45231,
  formatter: (value) => `$${value.toLocaleString()}`,
}

const KPI1 = (props: KPI1Props) => {
  const { trend, title, value, formatter } = props

  return (
    <KPI>
      <KPIContent className='space-y-2'>
        <CardDescription>{title}</CardDescription>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1'>
          <KPIValue value={value} formatter={formatter} animated />
          <Trend trend={trend} />
        </div>
      </KPIContent>
    </KPI>
  )
}

export { KPI1, exampleProps as kpi1ExampleProps, type KPI1Props }
