'use client'

import {
  KPI,
  KPIChange,
  KPIContent,
  type KPIFormat,
  KPIValue,
} from '@/registry/components/dashboardblocks/kpi'

import { CardDescription } from '@/components/ui/card'

interface KPI1Props {
  /** What the change is measured against, e.g. "vs last month". */
  comparison: string
  format?: KPIFormat
  previous: number
  title: string
  value: number
}

const exampleProps: KPI1Props = {
  comparison: 'vs last month',
  format: 'currency',
  previous: 37_660,
  title: 'Total revenue',
  value: 45_231,
}

const KPI1 = (props: KPI1Props) => {
  const { comparison, format, previous, title, value } = props

  return (
    <KPI>
      <KPIContent className='gap-1'>
        <CardDescription>{title}</CardDescription>
        <KPIValue value={value} format={format} animated />
        <KPIChange
          comparison={comparison}
          previous={previous}
          value={value}
          variant='default'
          showComparison
        />
      </KPIContent>
    </KPI>
  )
}

export { KPI1, exampleProps as kpi1ExampleProps, type KPI1Props }
