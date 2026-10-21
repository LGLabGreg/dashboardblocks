'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Ring } from '@/registry/components/dashboardblocks/ring'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface DailyGoal {
  current: number
  label: string
  target: number
  unit: string
}

interface Goals4Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  goals?: DailyGoal[]
  /** How many rings to sketch while loading. @default 3 */
  placeholders?: number
  status?: BlockStatus
  title: string
}

const exampleProps: Goals4Props = {
  description: 'Resets at midnight.',
  goals: [
    { current: 42, label: 'Calls', target: 50, unit: 'calls' },
    { current: 18, label: 'Demos', target: 15, unit: 'demos' },
    { current: 7, label: 'Proposals', target: 12, unit: 'proposals' },
  ],
  title: 'Daily activity goals',
}

const Goals4 = (props: Goals4Props) => {
  const { description, goals = [], placeholders = 3, status, title } = props
  const state = getBlockState(status, goals)
  const met = goals.filter((goal) => goal.current >= goal.target).length

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            <BlockReady className='text-sm'>
              <span className='tabular-nums'>
                {met} of {goals.length}
              </span>{' '}
              met so far today.{' '}
            </BlockReady>
            {description}
          </p>
        </header>
        {state === 'loading' && (
          <ul
            aria-hidden
            className='grid grid-cols-1 gap-4 border-t pt-5 @sm:grid-cols-3'
          >
            {Array.from({ length: placeholders }, (_, index) => (
              <li
                key={index}
                className='flex items-center gap-4 @sm:flex-col @sm:gap-3 @sm:text-center'
              >
                <Ring className='size-20 @sm:size-24' percentage={0} strokeWidth={8} />
                <div className='flex w-full flex-col gap-0.5 @sm:items-center'>
                  <span className='text-sm'>
                    <SkeletonText className='w-20' />
                  </span>
                  <span className='text-xs'>
                    <SkeletonText className='w-28' />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {(state === 'empty' || state === 'error') && (
          <BlockStateRows className='border-t pt-4' />
        )}
        {!state && (
          <ul className='grid grid-cols-1 gap-4 border-t pt-5 @sm:grid-cols-3'>
            {goals.map((goal) => {
              const share = goal.target > 0 ? goal.current / goal.target : 0
              const done = goal.current >= goal.target
              return (
                <li
                  key={goal.label}
                  className='flex items-center gap-4 @sm:flex-col @sm:gap-3 @sm:text-center'
                >
                  <Ring
                    ariaLabel={`${goal.label}: ${formatNumber(goal.current)} of ${formatNumber(goal.target)} ${goal.unit}`}
                    className='size-20 @sm:size-24'
                    percentage={Math.min(100, share * 100)}
                    ringColor='var(--color-chart-2)'
                    strokeWidth={8}
                  >
                    <span
                      aria-hidden
                      className='text-lg font-light tracking-tight tabular-nums'
                    >
                      {formatPercent(share, { maximumFractionDigits: 0 })}
                    </span>
                  </Ring>
                  <div className='flex flex-col gap-0.5 @sm:items-center'>
                    <span className='text-sm font-medium'>{goal.label}</span>
                    <span className='text-muted-foreground text-xs tabular-nums'>
                      {formatNumber(goal.current)} of {formatNumber(goal.target)}{' '}
                      {goal.unit}
                    </span>
                    {done ? (
                      <StatusLabel variant='text' className='text-xs' tone='good'>
                        Met
                        {goal.current > goal.target &&
                          `, ${formatNumber(goal.current - goal.target)} over`}
                      </StatusLabel>
                    ) : (
                      <span className='text-muted-foreground text-xs tabular-nums'>
                        {formatNumber(goal.target - goal.current)} to go
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Goals4, exampleProps as goals4ExampleProps, type Goals4Props }
