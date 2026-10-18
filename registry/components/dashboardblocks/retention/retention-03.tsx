'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIChange } from '@/registry/components/dashboardblocks/kpi'
import { RetentionBar } from '@/registry/components/dashboardblocks/retention'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

interface RetentionMilestone {
  label: string
  /** Share of the current cohort still active, 0–1. */
  current: number
  /** The same share for the cohort before, 0–1. */
  previous: number
}

interface Retention3Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  milestones?: RetentionMilestone[]
  /** How many milestones to sketch while loading. @default 3 */
  placeholders?: number
  previousLabel?: string
  status?: BlockStatus
  title: string
}

const exampleProps: Retention3Props = {
  description: 'August signups, compared with July.',
  milestones: [
    { current: 0.584, label: 'Day 1', previous: 0.561 },
    { current: 0.392, label: 'Day 7', previous: 0.366 },
    { current: 0.247, label: 'Day 30', previous: 0.253 },
  ],
  previousLabel: 'July',
  title: 'Retention milestones',
}

const Retention3 = (props: Retention3Props) => {
  const {
    description,
    milestones = [],
    placeholders = 3,
    previousLabel = 'the cohort before',
    status,
    title,
  } = props
  const state = getBlockState(status, milestones.length === 0)

  return (
    <BlockStateProvider status={status} empty={milestones.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {state === 'loading' && (
          <ul aria-hidden className='flex flex-col gap-4 border-t pt-4'>
            {Array.from({ length: placeholders }, (_, index) => (
              <li key={index} className='flex flex-col gap-2'>
                <div className='flex items-baseline justify-between gap-4'>
                  <span className='text-sm'>
                    <SkeletonText className='w-14' />
                  </span>
                  <span className='text-2xl font-light'>
                    <SkeletonText className='w-[3em]' />
                  </span>
                </div>
                <RetentionBar value={0} />
                <span className='text-xs'>
                  <SkeletonText className='w-1/2' />
                </span>
              </li>
            ))}
          </ul>
        )}
        {(state === 'empty' || state === 'error') && (
          <BlockStateRows className='border-t pt-4' />
        )}
        {!state && (
          <ul className='flex flex-col gap-4 border-t pt-4'>
            {milestones.map((milestone) => (
              <li key={milestone.label} className='flex flex-col gap-2'>
                <div className='flex items-baseline justify-between gap-4'>
                  <span className='text-muted-foreground text-sm'>{milestone.label}</span>
                  <span className='text-2xl font-light tracking-tight tabular-nums'>
                    {formatPercent(milestone.current)}
                  </span>
                </div>
                <RetentionBar value={milestone.current} />
                <KPIChange
                  changeType='points'
                  className='text-xs'
                  comparison={`in ${previousLabel}`}
                  format={(value) => formatPercent(value / 100)}
                  previous={milestone.previous * 100}
                  value={milestone.current * 100}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Retention3,
  exampleProps as retention3ExampleProps,
  type Retention3Props,
  type RetentionMilestone,
}
