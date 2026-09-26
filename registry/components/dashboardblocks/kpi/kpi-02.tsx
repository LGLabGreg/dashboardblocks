'use client'

import {
  KPI,
  KPIChange,
  KPIContent,
  type KPIFormat,
  KPIValue,
} from '@/registry/components/dashboardblocks/kpi'

import { CardDescription } from '@/components/ui/card'

interface KPI2Props {
  /** What the change is measured against, e.g. "vs last week". */
  comparison: string
  format?: KPIFormat
  previous: number
  title: string
  value: number
}

const exampleProps: KPI2Props = {
  comparison: 'vs last week',
  format: 'number',
  previous: 2_151,
  title: 'Active users',
  value: 2_420,
}

const KPI2 = (props: KPI2Props) => {
  const { comparison, format, previous, title, value } = props

  return (
    <KPI>
      <KPIContent className='gap-2'>
        <div className='flex items-center justify-between gap-2'>
          <CardDescription>{title}</CardDescription>
          <KPIChange comparison={comparison} previous={previous} value={value} />
        </div>
        <KPIValue value={value} format={format} animated />
      </KPIContent>
    </KPI>
  )
}

export { KPI2, exampleProps as kpi2ExampleProps, type KPI2Props }
