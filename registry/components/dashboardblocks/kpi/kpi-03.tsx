'use client'

import {
  KPI,
  KPIChange,
  KPIContent,
  type KPIFormat,
  KPIValue,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'

import { CardDescription } from '@/components/ui/card'

interface KPI3Props {
  /**
   * Use `points` for rates, so the change reads in percentage points.
   * @default 'percent'
   */
  changeType?: 'percent' | 'points'
  /** What the change is measured against, e.g. "last month". */
  comparison: string
  format?: KPIFormat
  /** Use `down` for metrics like churn, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  previous: number
  title: string
  value: number
}

const exampleProps: KPI3Props = {
  changeType: 'points',
  comparison: 'last month',
  format: 'percent',
  previous: 3.46,
  title: 'Conversion rate',
  value: 3.24,
}

const KPI3 = (props: KPI3Props) => {
  const { changeType, comparison, format, goodDirection, previous, title, value } = props
  const formatter = getKPIFormatter(format)

  return (
    <KPI>
      <KPIContent className='gap-1'>
        <CardDescription>{title}</CardDescription>
        <KPIValue value={value} format={format} animated />
        <div className='mt-3 flex items-center justify-between gap-2 border-t pt-3'>
          <span className='text-muted-foreground text-sm'>
            {formatter(previous)} {comparison}
          </span>
          <KPIChange
            changeType={changeType}
            comparison={`vs ${comparison}`}
            goodDirection={goodDirection}
            previous={previous}
            value={value}
          />
        </div>
      </KPIContent>
    </KPI>
  )
}

export { KPI3, exampleProps as kpi3ExampleProps, type KPI3Props }
