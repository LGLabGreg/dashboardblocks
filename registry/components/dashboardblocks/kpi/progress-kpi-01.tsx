'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import {
  KPI,
  KPIChange,
  KPIContent,
  KPITitle,
  type KPIFormat,
  KPIValue,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface ProgressKPI1Props {
  comparison: string
  daysElapsed: number
  daysInPeriod: number
  format?: KPIFormat
  previous?: number
  status?: BlockStatus
  target: number
  title: string
  /** Leave out to show the empty state. */
  value?: number
}

const exampleProps: ProgressKPI1Props = {
  comparison: 'last month',
  daysElapsed: 18,
  daysInPeriod: 30,
  format: 'currency',
  previous: 81_400,
  target: 160_000,
  title: 'Revenue',
  value: 87_500,
}

const ProgressKPI1 = (props: ProgressKPI1Props) => {
  const {
    comparison,
    daysElapsed,
    daysInPeriod,
    format,
    previous,
    status,
    target,
    title,
    value,
  } = props
  const ready = status === undefined && value !== undefined
  const reached = ready ? value : 0
  const formatter = getKPIFormatter(format)
  const share = target > 0 ? reached / target : 0
  const expected = Math.min(100, (daysElapsed / daysInPeriod) * 100)
  const projected = daysElapsed > 0 ? (reached / daysElapsed) * daysInPeriod : reached
  const projectedShare = target > 0 ? Math.min(100, (projected / target) * 100) : 0
  const gap = projected - target

  return (
    <BlockStateProvider status={status} empty={value === undefined}>
      <KPI>
        <KPIContent className='gap-1'>
          <KPITitle>{title}</KPITitle>
          <KPIValue value={value} format={format} animated />
          <KPIChange
            comparison={comparison}
            format={format}
            previous={previous}
            value={value}
          />
          <div className='mt-5 flex flex-col gap-2'>
            <div className='text-muted-foreground flex items-baseline justify-between gap-2 text-sm'>
              <BlockReady className='w-1/2'>
                <span>
                  <span className='text-foreground font-medium tabular-nums'>
                    {formatPercent(share, { maximumFractionDigits: 0 })}
                  </span>{' '}
                  of {formatter(target)}
                </span>
              </BlockReady>
              <span className='ml-auto text-xs tabular-nums'>
                Day {daysElapsed} of {daysInPeriod}
              </span>
            </div>
            <div
              aria-hidden
              className={cn(
                'bg-muted relative h-2 rounded-full',
                status === 'loading' && 'animate-pulse motion-reduce:animate-none',
              )}
            >
              <span
                className='absolute inset-y-0 left-0 rounded-full bg-[repeating-linear-gradient(135deg,color-mix(in_oklab,var(--color-chart-2)_45%,transparent)_0_2px,transparent_2px_5px)]'
                style={{ width: `${projectedShare}%` }}
              />
              <span
                className='bg-chart-2 absolute inset-y-0 left-0 rounded-full'
                style={{ width: `${Math.min(100, share * 100)}%` }}
              />
              <span
                className='bg-foreground absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded-full'
                style={{ left: `${expected}%` }}
              />
            </div>
            <BlockReady className='text-xs'>
              <p className='text-muted-foreground text-xs'>
                On pace for{' '}
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    gap >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-800 dark:text-amber-400',
                  )}
                >
                  {formatter(projected)}
                </span>
                , {formatter(Math.abs(gap))} {gap >= 0 ? 'over' : 'short of'} target. The
                hatched bar is the projection, the line an even pace.
              </p>
            </BlockReady>
          </div>
        </KPIContent>
      </KPI>
    </BlockStateProvider>
  )
}

export { ProgressKPI1, exampleProps as progressKpi1ExampleProps, type ProgressKPI1Props }
