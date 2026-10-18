'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import {
  KPI,
  KPIContent,
  KPITitle,
  KPIValue,
} from '@/registry/components/dashboardblocks/kpi'
import { Ring } from '@/registry/components/dashboardblocks/ring'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface ProgressKPI3Props {
  /** Leave out to show the empty state. */
  current?: number
  /** Days left in the period. Leave it out to skip the daily rate needed. */
  daysLeft?: number
  goal: number
  status?: BlockStatus
  title: string
  unit: string
}

const exampleProps: ProgressKPI3Props = {
  current: 7_500,
  daysLeft: 9,
  goal: 10_000,
  title: 'Monthly goal',
  unit: 'sales',
}

const count = (value: number) => formatNumber(Math.ceil(value))
const wholePercent = (value: number) =>
  formatPercent(value / 100, { maximumFractionDigits: 0 })

const ProgressKPI3 = (props: ProgressKPI3Props) => {
  const { current, daysLeft, goal, status, title, unit } = props
  const reached = current ?? 0
  const percentage = goal > 0 ? Math.min(100, Math.max(0, (reached / goal) * 100)) : 0
  const remaining = Math.max(0, goal - reached)

  return (
    <BlockStateProvider status={status} empty={current === undefined}>
      <KPI>
        <KPIContent className='flex-row items-center justify-between gap-4'>
          <div className='flex min-w-0 flex-col gap-1'>
            <KPITitle>{title}</KPITitle>
            <KPIValue value={current} animated />
            <p className='text-muted-foreground text-sm'>
              of <span className='tabular-nums'>{count(goal)}</span> {unit}
            </p>
            <BlockReady className='mt-3 text-xs'>
              <p className='text-muted-foreground mt-3 text-xs'>
                {remaining === 0 ? (
                  'Goal reached.'
                ) : (
                  <>
                    <span className='text-foreground font-medium tabular-nums'>
                      {count(remaining)}
                    </span>{' '}
                    to go
                    {daysLeft !== undefined && daysLeft > 0 && (
                      <>
                        {' '}
                        in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}, about{' '}
                        <span className='text-foreground font-medium tabular-nums'>
                          {count(remaining / daysLeft)}
                        </span>{' '}
                        a day
                      </>
                    )}
                    .
                  </>
                )}
              </p>
            </BlockReady>
          </div>
          <Ring
            ariaLabel={`${wholePercent(percentage)} of goal`}
            className='size-28 sm:size-32'
            percentage={percentage}
            ringColor='var(--color-chart-2)'
            strokeWidth={6}
          >
            <AnimatedNumber
              className='text-2xl font-light tracking-tight tabular-nums'
              value={Math.round(percentage)}
              formatter={wholePercent}
            />
          </Ring>
        </KPIContent>
      </KPI>
    </BlockStateProvider>
  )
}

export { ProgressKPI3, exampleProps as progressKpi3ExampleProps, type ProgressKPI3Props }
