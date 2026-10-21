'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  StatusLabel,
  statusToneClasses,
} from '@/registry/components/dashboardblocks/status-label'
import {
  TimelineStatusLabel,
  type TimelineStatus,
  formatTimelineDate,
  getDaysBetween,
} from '@/registry/components/dashboardblocks/timeline'
import { formatRelativeDays } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface Milestone {
  /** Leave it out while a milestone has no date: the row shows none. */
  date?: Date
  description?: string
  id: string
  label: string
  status: TimelineStatus
}

interface Timeline2Props {
  /** What the milestones are for, such as a release name. */
  description: string
  /** Oldest first. Leave out, or pass none, to show the empty state. */
  milestones?: Milestone[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  status?: BlockStatus
  title: string
}

const date = (month: number, day: number) => new Date(Date.UTC(2026, month - 1, day))

const exampleProps: Timeline2Props = {
  description: 'Mobile app 3.0',
  milestones: [
    {
      date: date(8, 3),
      description: 'Specs and designs signed off',
      id: 'kickoff',
      label: 'Kickoff',
      status: 'done',
    },
    {
      date: date(9, 11),
      description: 'Feature complete on both platforms',
      id: 'alpha',
      label: 'Internal alpha',
      status: 'done',
    },
    {
      date: date(10, 2),
      description: '200 customers from the waitlist',
      id: 'beta',
      label: 'Public beta',
      status: 'at-risk',
    },
    {
      date: date(10, 23),
      description: 'App Store and Play review',
      id: 'review',
      label: 'Store submission',
      status: 'planned',
    },
    {
      date: date(11, 4),
      description: 'Launch post, email and in-app banner',
      id: 'launch',
      label: 'General availability',
      status: 'planned',
    },
  ],
  now: date(9, 26),
  title: 'Launch milestones',
}

const Timeline2 = (props: Timeline2Props) => {
  const { description, milestones = [], now, status, title } = props
  const state = getBlockState(status, milestones)
  const next = milestones.find((milestone) => milestone.status !== 'done')
  const done = milestones.filter((milestone) => milestone.status === 'done').length
  const nextDays = next?.date ? getDaysBetween(now, next.date) : 0

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {description}.{' '}
            <BlockReady>
              {done} of {milestones.length} milestones done.
            </BlockReady>
          </p>
        </header>
        {state && (
          <div className='flex flex-col gap-1'>
            <KPIValue />
            {state === 'loading' && <BlockStateText className='text-sm' />}
          </div>
        )}
        {!state && next?.date && (
          <div className='flex flex-col gap-1'>
            <p className='text-4xl font-light tracking-tight tabular-nums'>
              {Math.abs(nextDays)}
              <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                {Math.abs(nextDays) === 1 ? 'day' : 'days'}
              </span>
            </p>
            <p className='text-muted-foreground text-sm'>
              {nextDays < 0 ? (
                <StatusLabel variant='text' tone='bad'>
                  Late
                </StatusLabel>
              ) : (
                'Until'
              )}{' '}
              {nextDays < 0 ? 'on' : ''}{' '}
              <span className='text-foreground font-medium'>{next.label}</span>,{' '}
              {nextDays < 0 ? 'due' : 'on'} {formatTimelineDate(next.date)}.
              {next.status === 'at-risk' && (
                <>
                  {' '}
                  <StatusLabel variant='text' tone='warning'>
                    At risk.
                  </StatusLabel>
                </>
              )}
            </p>
          </div>
        )}
        {state === 'loading' && (
          <div className='border-t'>
            <BlockStateRows rows={5} />
          </div>
        )}
        {!state && (
          <ol className='flex flex-col border-t pt-4'>
            {milestones.map((milestone, index) => {
              const days = milestone.date ? getDaysBetween(now, milestone.date) : 0
              const isNext = milestone.id === next?.id
              const overdue = milestone.status !== 'done' && days < 0
              return (
                <li key={milestone.id} className='relative flex gap-3 pb-5 last:pb-0'>
                  {index < milestones.length - 1 && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute top-6 bottom-1 left-[9px] w-px',
                        milestone.status === 'done'
                          ? 'bg-foreground/60'
                          : 'border-l border-dashed',
                      )}
                    />
                  )}
                  <TimelineStatusLabel
                    className='bg-background relative mt-0.5 self-start [&_svg]:size-5'
                    status={milestone.status}
                  />
                  <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                    <div className='flex flex-wrap items-baseline justify-between gap-x-3'>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          milestone.status === 'done' && 'text-muted-foreground',
                        )}
                      >
                        {milestone.label}
                        {milestone.status === 'at-risk' && (
                          <StatusLabel
                            aria-hidden
                            className='ml-2 text-xs'
                            tone='warning'
                          >
                            At risk
                          </StatusLabel>
                        )}
                        {isNext && (
                          <StatusLabel className='ml-2 text-xs' tone='info'>
                            Next
                          </StatusLabel>
                        )}
                      </span>
                      {milestone.date && (
                        <span className='text-muted-foreground text-xs tabular-nums'>
                          {formatTimelineDate(milestone.date)}
                          {milestone.status !== 'done' && (
                            <span
                              className={cn('ml-1.5', overdue && statusToneClasses.bad)}
                            >
                              {overdue ? `${-days} days late` : formatRelativeDays(days)}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {milestone.description && (
                      <span className='text-muted-foreground text-sm'>
                        {milestone.description}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Timeline2,
  exampleProps as timeline2ExampleProps,
  type Milestone,
  type Timeline2Props,
}
