'use client'

import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface KPI1Props {
  trend: number
  title: string
  value: number
}

const exampleProps: KPI1Props = {
  trend: 20.1,
  title: 'Total Revenue',
  value: 45231,
}

const KPI1 = (props: KPI1Props) => {
  const { trend, title, value } = props

  return (
    <Card>
      <CardContent className='space-y-2'>
        <CardDescription>{title}</CardDescription>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1'>
          <KPIValue
            value={value}
            formatter={(value) => `$${value.toLocaleString()}`}
            animated
          />
          <Trend trend={trend} />
        </div>
      </CardContent>
    </Card>
  )
}

export { KPI1, exampleProps as kpi1ExampleProps, type KPI1Props }
