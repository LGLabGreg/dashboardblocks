'use client'

import {
  TimelineAxis,
  TimelineGridLines,
  TimelineToday,
  formatTimelineDate,
  formatTimelineRange,
  getDaysBetween,
  getTimelineScale,
  getTimelineTicks,
} from '@/registry/components/dashboardblocks/timeline'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Phase {
  /** When it actually ran. Leave `end` out while it's still running. */
  actual?: { end?: Date; start: Date }
  id: string
  label: string
  planned: { end: Date; start: Date }
}

interface Timeline4Props {
  description: string
  end: Date
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  phases: Phase[]
  start: Date
  title: string
}

const date = (month: number, day: number) => new Date(Date.UTC(2026, month - 1, day))

const exampleProps: Timeline4Props = {
  description: 'Billing migration, planned against actual',
  end: date(11, 30),
  now: date(9, 26),
  phases: [
    {
      actual: { end: date(7, 17), start: date(7, 1) },
      id: 'discovery',
      label: 'Discovery',
      planned: { end: date(7, 14), start: date(7, 1) },
    },
    {
      actual: { end: date(8, 21), start: date(7, 20) },
      id: 'design',
      label: 'Design',
      planned: { end: date(8, 7), start: date(7, 15) },
    },
    {
      actual: { start: date(8, 24) },
      id: 'build',
      label: 'Build',
      planned: { end: date(9, 25), start: date(8, 10) },
    },
    {
      id: 'migration',
      label: 'Data migration',
      planned: { end: date(10, 23), start: date(9, 28) },
    },
    {
      id: 'rollout',
      label: 'Rollout',
      planned: { end: date(11, 20), start: date(10, 26) },
    },
  ],
  start: date(7, 1),
  title: 'Plan vs actual',
}

const Timeline4 = (props: Timeline4Props) => {
  const { description, end, now, phases, start, title } = props
  const position = getTimelineScale(start, end)
  const ticks = getTimelineTicks(start, end, 'month')
  // How late each phase finishes (or will, if running now) against its plan.
  const slips = phases.map((phase) => {
    if (!phase.actual) return null
    const finish = phase.actual.end ?? (now > phase.planned.end ? now : null)
    return finish ? getDaysBetween(phase.planned.end, finish) : null
  })
  const current = phases.findIndex((phase) => phase.actual && !phase.actual.end)
  const latest = [...slips].reverse().find((slip) => slip !== null) ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <p className='text-sm'>
          {latest > 0 ? (
            <>
              <span className='font-semibold text-red-700 dark:text-red-400'>
                {latest} {latest === 1 ? 'day' : 'days'} behind
              </span>{' '}
              <span className='text-muted-foreground'>
                plan
                {current >= 0
                  ? `, with ${phases[current].label.toLowerCase()} still running`
                  : ''}
                .
              </span>
            </>
          ) : (
            <span className='text-muted-foreground'>On plan so far.</span>
          )}
        </p>
        <div className='-my-1 overflow-x-auto py-1'>
          <div className='grid min-w-[34rem] grid-cols-[7rem_minmax(0,1fr)_4rem] gap-x-3'>
            {/* Placed explicitly: the today line below is, and explicit items go first. */}
            <span className='bg-card sticky left-0 z-20 col-start-1 row-start-1' />
            <TimelineAxis
              className='col-start-2 row-start-1'
              end={end}
              start={start}
              ticks={ticks}
            />
            <span className='text-muted-foreground col-start-3 row-start-1 text-right text-[11px] leading-5'>
              Slip
            </span>
            <ol className='col-span-full row-start-2 grid grid-cols-subgrid'>
              {phases.map((phase, index) => {
                const planned = {
                  left: position(phase.planned.start),
                  width: position(phase.planned.end) - position(phase.planned.start),
                }
                const actualEnd = phase.actual?.end ?? now
                const actual = phase.actual && {
                  left: position(phase.actual.start),
                  width: Math.max(
                    0.8,
                    position(actualEnd) - position(phase.actual.start),
                  ),
                }
                const slip = slips[index]
                return (
                  <li
                    key={phase.id}
                    className='col-span-full grid grid-cols-subgrid items-center'
                  >
                    <span className='bg-card sticky left-0 z-20 truncate py-1 text-sm'>
                      {phase.label}
                    </span>
                    <span className='relative h-9'>
                      <TimelineGridLines end={end} start={start} ticks={ticks} />
                      <span
                        aria-hidden
                        className='border-muted-foreground/70 absolute top-1 h-3 rounded-sm border border-dashed'
                        style={{ left: `${planned.left}%`, width: `${planned.width}%` }}
                      />
                      {actual && (
                        <span
                          aria-hidden
                          className={cn(
                            'absolute bottom-1 h-3 rounded-sm',
                            !phase.actual?.end && 'rounded-r-none',
                          )}
                          style={{
                            background: phase.actual?.end
                              ? 'var(--chart-1)'
                              : 'linear-gradient(to right, var(--chart-1) 70%, color-mix(in oklab, var(--chart-1) 25%, transparent))',
                            left: `${actual.left}%`,
                            width: `${actual.width}%`,
                          }}
                        />
                      )}
                      <span className='sr-only'>
                        Planned{' '}
                        {formatTimelineRange(phase.planned.start, phase.planned.end)}
                        {phase.actual
                          ? `, actual ${phase.actual.end ? formatTimelineRange(phase.actual.start, phase.actual.end) : `from ${formatTimelineDate(phase.actual.start)}, still running`}`
                          : ', not started'}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'text-right text-sm tabular-nums',
                        slip === null
                          ? 'text-muted-foreground'
                          : slip > 0
                            ? 'font-medium text-red-700 dark:text-red-400'
                            : 'font-medium text-emerald-700 dark:text-emerald-400',
                      )}
                    >
                      {slip === null
                        ? '—'
                        : slip > 0
                          ? `+${slip}d`
                          : slip < 0
                            ? `${slip}d`
                            : 'On time'}
                    </span>
                  </li>
                )
              })}
            </ol>
            <div
              aria-hidden
              className='pointer-events-none relative col-start-2 row-start-1 row-end-3'
            >
              <TimelineToday end={end} now={now} start={start} />
            </div>
          </div>
        </div>
        <ul
          aria-hidden
          className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'
        >
          <li className='flex items-center gap-1.5'>
            <span className='border-muted-foreground/70 h-2.5 w-4 rounded-sm border border-dashed' />
            Planned
          </li>
          <li className='flex items-center gap-1.5'>
            <span className='h-2.5 w-4 rounded-sm bg-[var(--chart-1)]' />
            Actual
          </li>
          <li className='flex items-center gap-1.5'>
            <span
              className='h-2.5 w-4 rounded-sm'
              style={{
                background:
                  'linear-gradient(to right, var(--chart-1) 50%, color-mix(in oklab, var(--chart-1) 25%, transparent))',
              }}
            />
            Still running
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  Timeline4,
  exampleProps as timeline4ExampleProps,
  type Phase,
  type Timeline4Props,
}
