'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  GoalProgress,
  GoalProgressKey,
  PaceLabel,
  getElapsed,
  getPace,
} from '@/registry/components/dashboardblocks/goals'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCurrency,
  formatDateRange,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface Goals1Props {
  /** Leave out to show the empty state. */
  current?: number
  end: Date
  formatter?: (value: number) => string
  start: Date
  status?: BlockStatus
  target: number
  title: string
  today: Date
}

const exampleProps: Goals1Props = {
  current: 412_300,
  end: new Date(Date.UTC(2026, 8, 30)),
  formatter: (value) => formatCurrency(value),
  start: new Date(Date.UTC(2026, 6, 1)),
  target: 500_000,
  title: 'Q3 revenue target',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const DAY = 86_400_000

const Goals1 = (props: Goals1Props) => {
  const {
    end,
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    start,
    status,
    target,
    title,
    today,
  } = props
  const state = getBlockState(status, props.current)
  const current = props.current ?? 0
  const periodEnd = new Date(end.getTime() + DAY)
  const pace = getPace({
    current,
    elapsed: getElapsed(start, periodEnd, today),
    target,
  })
  const daysLeft = Math.max(
    0,
    Math.ceil((periodEnd.getTime() - today.getTime()) / DAY) - 1,
  )
  const share = target > 0 ? current / target : 0

  const gap = current - pace.expected
  const shortfall = target - pace.projected

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>
              {formatDateRange({ end, start })}, with {daysLeft}{' '}
              {daysLeft === 1 ? 'day' : 'days'} to go.
            </p>
          </div>
          {!state && <PaceLabel className='mt-0.5' status={pace.status} />}
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <div className='flex flex-wrap items-baseline gap-x-2'>
            <KPIValue value={props.current} format={formatter} />
            {(!state || state === 'loading') && (
              <span className='text-muted-foreground text-sm tabular-nums'>
                of {formatter(target)}
              </span>
            )}
          </div>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              <span className='text-foreground font-medium tabular-nums'>
                {formatPercent(share, { maximumFractionDigits: 0 })}
              </span>{' '}
              of the target,{' '}
              <span
                className={cn(
                  'font-medium tabular-nums',
                  gap >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-800 dark:text-amber-400',
                )}
              >
                {formatter(Math.abs(gap))} {gap >= 0 ? 'ahead of' : 'behind'}
              </span>{' '}
              where a steady pace would be today.
            </p>
          </BlockReady>
        </div>
        <div className='flex flex-col gap-2.5'>
          <GoalProgress
            current={current}
            expected={pace.status === 'met' ? undefined : pace.expected}
            projected={pace.projected}
            target={target}
          />
          <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
            <GoalProgressKey label='So far' shape='progress' />
            <GoalProgressKey label='At this pace' shape='projected' />
            {pace.status !== 'met' && <GoalProgressKey />}
          </div>
        </div>
        {(!state || state === 'loading') && (
          <dl className='grid grid-cols-2 gap-4 border-t pt-4'>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-sm'>Projected at this pace</dt>
              <dd>
                <KPIValue
                  className='text-2xl'
                  value={pace.projected}
                  format={formatter}
                />
              </dd>
              <dd
                className={cn(
                  'text-xs tabular-nums',
                  shortfall > 0
                    ? 'font-medium text-amber-800 dark:text-amber-400'
                    : 'text-muted-foreground',
                )}
              >
                <BlockReady>
                  {shortfall > 0
                    ? `${formatter(shortfall)} short of the target`
                    : `${formatter(-shortfall)} over the target`}
                </BlockReady>
              </dd>
            </div>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-sm'>Left to reach the target</dt>
              <dd>
                <KPIValue
                  className='text-2xl'
                  value={Math.max(0, target - current)}
                  format={formatter}
                />
              </dd>
              <dd className='text-muted-foreground text-xs tabular-nums'>
                <BlockReady>
                  {current >= target
                    ? 'Target reached'
                    : daysLeft > 0
                      ? `${formatter((target - current) / daysLeft)} a day to get there`
                      : 'No days left'}
                </BlockReady>
              </dd>
            </div>
          </dl>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Goals1, exampleProps as goals1ExampleProps, type Goals1Props }
