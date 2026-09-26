'use client'

import {
  KPI,
  KPIChange,
  KPIContent,
  type KPIFormat,
  KPIValue,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'

import { CardDescription } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface ProgressKPI1Props {
  /** What the change is measured against, e.g. "vs last month". */
  comparison: string
  /** Days of the period so far, for the pace. */
  daysElapsed: number
  /** Days in the whole period. */
  daysInPeriod: number
  format?: KPIFormat
  previous: number
  target: number
  title: string
  value: number
}

const exampleProps: ProgressKPI1Props = {
  comparison: 'vs last month',
  daysElapsed: 18,
  daysInPeriod: 30,
  format: 'currency',
  previous: 81_400,
  target: 160_000,
  title: 'Revenue',
  value: 87_500,
}

const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

const ProgressKPI1 = (props: ProgressKPI1Props) => {
  const {
    comparison,
    daysElapsed,
    daysInPeriod,
    format,
    previous,
    target,
    title,
    value,
  } = props
  const formatter = getKPIFormatter(format)
  const share = target > 0 ? (value / target) * 100 : 0
  // Where an even pace would be by today, marked on the bar.
  const expected = Math.min(100, (daysElapsed / daysInPeriod) * 100)
  const projected = daysElapsed > 0 ? (value / daysElapsed) * daysInPeriod : value
  const onPace = projected >= target

  return (
    <KPI>
      <KPIContent className='gap-1'>
        <div className='flex items-center justify-between gap-2'>
          <CardDescription>{title}</CardDescription>
          <KPIChange comparison={comparison} previous={previous} value={value} />
        </div>
        <KPIValue value={value} format={format} animated />
        <div className='mt-4 flex flex-col gap-2 text-sm'>
          <div className='text-muted-foreground flex items-center justify-between gap-2'>
            <span>
              <span className='text-foreground font-medium tabular-nums'>
                {percentFormatter.format(share)}%
              </span>{' '}
              of target
            </span>
            <span className='text-foreground font-medium tabular-nums'>
              {formatter(target)}
            </span>
          </div>
          <div className='relative'>
            <ProgressBar percentage={share} />
            <span
              aria-hidden
              className='bg-foreground ring-card absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
              style={{ left: `${expected}%` }}
            />
          </div>
          <p className='text-muted-foreground text-xs'>
            Day {daysElapsed} of {daysInPeriod}. On pace for{' '}
            <span
              className={cn(
                'font-medium tabular-nums',
                onPace
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-800 dark:text-amber-400',
              )}
            >
              {formatter(projected)}
            </span>
            , {onPace ? 'above' : 'below'} target. The tick marks an even pace.
          </p>
        </div>
      </KPIContent>
    </KPI>
  )
}

export { ProgressKPI1, exampleProps as progressKpi1ExampleProps, type ProgressKPI1Props }
