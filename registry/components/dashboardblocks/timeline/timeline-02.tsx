'use client'

import {
  TimelineStatusLabel,
  type TimelineStatus,
  formatTimelineDate,
  getDaysBetween,
} from '@/registry/components/dashboardblocks/timeline'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Milestone {
  date: Date
  description?: string
  id: string
  label: string
  status: TimelineStatus
}

interface Timeline2Props {
  description: string
  /** Oldest first. */
  milestones: Milestone[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
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

const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

const Timeline2 = (props: Timeline2Props) => {
  const { description, milestones, now, title } = props
  const next = milestones.find((milestone) => milestone.status !== 'done')
  const done = milestones.filter((milestone) => milestone.status === 'done').length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}, {done} of {milestones.length} done
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className='flex flex-col'>
          {milestones.map((milestone, index) => {
            const days = getDaysBetween(now, milestone.date)
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
                  className='bg-card relative mt-0.5 [&_svg]:size-5'
                  status={milestone.status}
                />
                <div
                  className={cn(
                    'flex min-w-0 flex-1 flex-col gap-0.5',
                    isNext && 'bg-muted/60 -mx-2 -my-1.5 rounded-lg px-2 py-1.5',
                  )}
                >
                  <div className='flex flex-wrap items-baseline justify-between gap-x-3'>
                    <span className='text-sm font-medium'>
                      {milestone.label}
                      {milestone.status === 'at-risk' && (
                        <span
                          aria-hidden
                          className='ml-2 text-xs font-medium text-amber-700 dark:text-amber-400'
                        >
                          At risk
                        </span>
                      )}
                      {isNext && (
                        <span className='text-muted-foreground ml-2 text-xs font-normal'>
                          Next
                        </span>
                      )}
                    </span>
                    <span className='text-muted-foreground text-xs tabular-nums'>
                      {formatTimelineDate(milestone.date)}
                      {milestone.status !== 'done' && (
                        <span
                          className={cn(
                            'ml-1.5',
                            overdue && 'text-red-700 dark:text-red-400',
                          )}
                        >
                          {overdue ? `${-days} days late` : relative.format(days, 'day')}
                        </span>
                      )}
                    </span>
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
      </CardContent>
    </Card>
  )
}

export {
  Timeline2,
  exampleProps as timeline2ExampleProps,
  type Milestone,
  type Timeline2Props,
}
