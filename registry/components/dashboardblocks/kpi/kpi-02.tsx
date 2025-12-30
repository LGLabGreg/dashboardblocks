'use client'

import { KPI, KPIContent, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { CardDescription } from '@/components/ui/card'

interface KPI2Props {
  trend: number
  title: string
  value: number
}

const exampleProps: KPI2Props = {
  trend: 12.5,
  title: 'Active Users',
  value: 2420,
}

const KPI2 = (props: KPI2Props) => {
  const { trend, title, value } = props
  return (
    <KPI>
      <KPIContent className='space-y-2'>
        <div className='flex items-center justify-between'>
          <CardDescription>{title}</CardDescription>
          <Trend trend={trend} variant='badge' />
        </div>
        <KPIValue value={value} animated />
      </KPIContent>
    </KPI>
  )
}

export { KPI2, exampleProps as kpi2ExampleProps, type KPI2Props }
