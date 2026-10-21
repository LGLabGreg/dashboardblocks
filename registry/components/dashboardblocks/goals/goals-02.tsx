'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  GoalProgress,
  GoalProgressKey,
  PaceLabel,
  getPace,
} from '@/registry/components/dashboardblocks/goals'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Goal {
  current: number
  formatter?: (value: number) => string
  label: string
  owner: string
  target: number
}

interface Goals2Props {
  description: string
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  /** Leave out, or pass none, to show the empty state. */
  goals?: Goal[]
  status?: BlockStatus
  title: string
}

const exampleProps: Goals2Props = {
  description: 'Q3, week 12 of 13.',
  elapsed: 12 / 13,
  goals: [
    {
      current: 1_184,
      label: 'New paying customers',
      owner: 'Growth',
      target: 1_200,
    },
    {
      current: 71,
      formatter: (value) => formatNumber(value, { maximumFractionDigits: 0 }),
      label: 'Enterprise deals closed',
      owner: 'Sales',
      target: 60,
    },
    {
      current: 2_140,
      label: 'Support tickets resolved',
      owner: 'Support',
      target: 2_400,
    },
    {
      current: 9,
      formatter: (value) => formatNumber(value, { maximumFractionDigits: 0 }),
      label: 'Integrations shipped',
      owner: 'Platform',
      target: 12,
    },
  ],
  title: 'Team goals',
}

const Goals2 = (props: Goals2Props) => {
  const { description, elapsed, goals = [], status, title } = props
  const rows = goals.map((goal) => ({
    format:
      goal.formatter ??
      ((value: number) => formatNumber(value, { maximumFractionDigits: 0 })),
    goal,
    pace: getPace({ current: goal.current, elapsed, target: goal.target }),
  }))
  const onPace = rows.filter((row) => row.pace.status !== 'behind').length

  return (
    <BlockStateProvider state={getBlockState(status, goals)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {description}{' '}
            <BlockReady className='text-sm'>
              <span className='tabular-nums'>
                {onPace} of {goals.length}
              </span>{' '}
              {goals.length === 1 ? 'goal is' : 'goals are'} on pace or better.
            </BlockReady>
          </p>
        </header>
        <BlockStateRows
          className='border-t data-[slot=block-state-rows]:border-b'
          rows={goals.length || 4}
        />
        {!status && goals.length > 0 && (
          <ul className='flex flex-col divide-y border-y'>
            {rows.map(({ format, goal, pace }) => (
              <li key={goal.label} className='flex flex-col gap-2 py-3'>
                <div className='flex items-start justify-between gap-3'>
                  <p className='flex min-w-0 flex-col'>
                    <span className='text-sm font-medium'>{goal.label}</span>
                    <span className='text-muted-foreground text-xs'>{goal.owner}</span>
                  </p>
                  <PaceLabel className='text-xs' status={pace.status} />
                </div>
                <GoalProgress
                  current={goal.current}
                  expected={pace.status === 'met' ? undefined : pace.expected}
                  size='sm'
                  target={goal.target}
                />
                <p className='text-muted-foreground flex justify-between gap-3 text-xs tabular-nums'>
                  <span>
                    <span className='text-foreground font-medium'>
                      {format(goal.current)}
                    </span>{' '}
                    of {format(goal.target)}
                  </span>
                  <span>
                    {formatPercent(goal.current / goal.target, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
        <GoalProgressKey />
      </section>
    </BlockStateProvider>
  )
}

export { Goals2, exampleProps as goals2ExampleProps, type Goals2Props }
