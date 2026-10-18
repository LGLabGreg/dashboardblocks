'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { ChartPlaceholder, useChartId } from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import {
  TIMELINE_AXIS_HEIGHT,
  TimelineChart,
  formatTimelineDate,
  formatTimelineRange,
  getDaysBetween,
  getTimelineTicks,
} from '@/registry/components/dashboardblocks/timeline'
import { formatNumber, formatSigned } from '@/registry/lib/dashboardblocks/format'

interface Phase {
  actual?: { end?: Date; start: Date }
  id: string
  label: string
  planned: { end: Date; start: Date }
}

interface Timeline4Props {
  /** What the plan is for, such as a project name. */
  description: string
  end: Date
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** In order. Leave out, or pass none, to show the empty state. */
  phases?: Phase[]
  start: Date
  status?: BlockStatus
  title: string
}

const date = (month: number, day: number) => new Date(Date.UTC(2026, month - 1, day))

const exampleProps: Timeline4Props = {
  description: 'Billing migration',
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

const ROW_HEIGHT = 36
const PLACEHOLDER_ROWS = 5
const BAR_HEIGHT = 12
const MIN_BAR_WIDTH = 4

function describeSlip(slip: number) {
  if (slip === 0) return 'On time'
  const days = `${Math.abs(slip)} ${Math.abs(slip) === 1 ? 'day' : 'days'}`
  return slip > 0 ? `${days} late` : `${days} early`
}

const formatDays = (days: number) => `${formatNumber(days)}d`

function Slip({ slip }: { slip: number | null }) {
  if (slip === null) {
    return <span className='text-muted-foreground text-right text-sm'>—</span>
  }
  return (
    <StatusLabel className='text-right tabular-nums' tone={slip > 0 ? 'bad' : 'good'}>
      {slip === 0 ? 'On time' : formatSigned(slip, formatDays)}
    </StatusLabel>
  )
}

const Timeline4 = (props: Timeline4Props) => {
  const { description, end, now, phases = [], start, status, title } = props
  const id = useChartId()
  const state = getBlockState(status, phases.length === 0)
  const ticks = getTimelineTicks(start, end, 'month')
  const projections = phases.map((phase) => {
    if (!phase.actual || phase.actual.end) return null
    const planned = phase.planned.end.getTime() - phase.planned.start.getTime()
    return new Date(Math.max(now.getTime(), phase.actual.start.getTime() + planned))
  })
  const slips = phases.map((phase, index) => {
    const finish = phase.actual?.end ?? projections[index]
    return finish ? getDaysBetween(phase.planned.end, finish) : null
  })
  const current = phases.findIndex((phase) => phase.actual && !phase.actual.end)
  const latest = [...slips].reverse().find((slip) => slip !== null) ?? 0
  const describe = (phase: Phase, index: number) => {
    const projection = projections[index]
    const planned = `planned ${formatTimelineRange(phase.planned.start, phase.planned.end)}`
    if (!phase.actual) return `${planned}, not started`
    if (phase.actual.end)
      return `${planned}, actual ${formatTimelineRange(phase.actual.start, phase.actual.end)}`
    return `${planned}, actual from ${formatTimelineDate(phase.actual.start)}, still running${projection ? `, projected to end ${formatTimelineDate(projection)}` : ''}`
  }

  return (
    <BlockStateProvider status={status} empty={phases.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {description}. Each phase&apos;s plan is dashed, with what happened below it.
          </p>
        </header>
        {state && (
          <div className='flex flex-col gap-1'>
            <KPIValue />
            {state === 'loading' && <BlockStateText className='text-sm' />}
          </div>
        )}
        {state === 'loading' && (
          <div className='border-t pt-4'>
            <ChartPlaceholder
              height={TIMELINE_AXIS_HEIGHT + PLACEHOLDER_ROWS * ROW_HEIGHT}
            />
          </div>
        )}
        {!state && (
          <div className='flex flex-col gap-1'>
            <p className='text-4xl font-light tracking-tight tabular-nums'>
              {Math.abs(latest)}
              <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                {Math.abs(latest) === 1 ? 'day' : 'days'}
              </span>
            </p>
            <p className='text-sm'>
              <StatusLabel tone={latest > 0 ? 'bad' : 'good'}>
                {latest > 0 ? 'Behind plan' : latest < 0 ? 'Ahead of plan' : 'On plan'}
              </StatusLabel>
              <span className='text-muted-foreground'>
                {current >= 0
                  ? `, if ${phases[current].label.toLowerCase()} takes as long as planned.`
                  : '.'}
              </span>
            </p>
          </div>
        )}
        {!state && (
          <div
            role='region'
            aria-label={title}
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must be focusable so keyboard users can reach the columns that don't fit
            tabIndex={0}
            className='focus-visible:ring-ring/50 overflow-x-auto rounded-sm border-t pt-4 pb-1 outline-none focus-visible:ring-3'
          >
            <div className='grid min-w-[34rem] grid-cols-[7rem_minmax(0,1fr)_4rem] gap-x-3'>
              <ol className='bg-background sticky left-0 z-20 flex flex-col'>
                <li aria-hidden style={{ height: TIMELINE_AXIS_HEIGHT }} />
                {phases.map((phase, index) => (
                  <li
                    key={phase.id}
                    className='flex items-center text-sm'
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span className='truncate'>{phase.label}</span>
                    <span className='sr-only'>, {describe(phase, index)}</span>
                  </li>
                ))}
              </ol>
              <TimelineChart
                end={end}
                now={now}
                renderRow={(phase, band) => {
                  const index = phases.indexOf(phase)
                  const plannedLeft = band.x(phase.planned.start)
                  const plannedRight = band.x(phase.planned.end)
                  const actualStart = phase.actual && band.x(phase.actual.start)
                  const actualEnd = phase.actual && band.x(phase.actual.end ?? now)
                  const projection = projections[index]
                  const projectionEnd = projection && band.x(projection)
                  const nowX = band.x(now)
                  const top = band.y + 4
                  const bottom = band.y + band.height - 4 - BAR_HEIGHT
                  const extentLeft = Math.min(plannedLeft, actualStart ?? plannedLeft)
                  const extentRight = Math.max(
                    plannedRight,
                    actualEnd ?? plannedRight,
                    projectionEnd ?? plannedRight,
                  )
                  const key = `${id}-${index}`
                  return (
                    <>
                      <rect
                        fill='none'
                        height={BAR_HEIGHT}
                        rx={3}
                        stroke='var(--color-muted-foreground)'
                        strokeDasharray='3 3'
                        strokeOpacity={0.7}
                        width={Math.max(0, plannedRight - plannedLeft)}
                        x={plannedLeft}
                        y={top}
                      />
                      {projectionEnd !== undefined && projectionEnd !== null && (
                        <path
                          d={`M${nowX},${bottom + 0.5}H${projectionEnd - 0.5}V${bottom + BAR_HEIGHT - 0.5}H${nowX}`}
                          fill='none'
                          stroke='var(--color-chart-2)'
                          strokeDasharray='3 3'
                        />
                      )}
                      {actualStart !== undefined && actualEnd !== undefined && (
                        <>
                          {!phase.actual?.end && (
                            <defs>
                              <linearGradient
                                id={`${key}-running`}
                                x1='0'
                                x2='1'
                                y1='0'
                                y2='0'
                              >
                                <stop
                                  offset='70%'
                                  style={{ stopColor: 'var(--color-chart-2)' }}
                                />
                                <stop
                                  offset='100%'
                                  style={{
                                    stopColor:
                                      'color-mix(in oklab, var(--color-chart-2) 25%, transparent)',
                                  }}
                                />
                              </linearGradient>
                            </defs>
                          )}
                          <rect
                            fill={
                              phase.actual?.end
                                ? 'var(--color-chart-2)'
                                : `url(#${key}-running)`
                            }
                            height={BAR_HEIGHT}
                            rx={3}
                            width={Math.max(MIN_BAR_WIDTH, actualEnd - actualStart)}
                            x={actualStart}
                            y={bottom}
                          />
                        </>
                      )}
                      {band.active && (
                        <rect
                          fill='none'
                          height={band.height - 2}
                          rx={5}
                          stroke='var(--color-foreground)'
                          strokeWidth={2}
                          width={extentRight - extentLeft + 6}
                          x={extentLeft - 3}
                          y={band.y + 1}
                        />
                      )}
                    </>
                  )
                }}
                rowHeight={ROW_HEIGHT}
                rows={phases}
                start={start}
                ticks={ticks}
                tooltip={(phase) => {
                  const index = phases.indexOf(phase)
                  const projection = projections[index]
                  return (
                    <>
                      <span className='font-medium'>{phase.label}</span>
                      <span className='text-muted-foreground tabular-nums'>
                        Planned{' '}
                        {formatTimelineRange(phase.planned.start, phase.planned.end)}
                      </span>
                      <span className='tabular-nums'>
                        {!phase.actual
                          ? 'Not started'
                          : phase.actual.end
                            ? `Took ${formatTimelineRange(phase.actual.start, phase.actual.end)}`
                            : `Started ${formatTimelineDate(phase.actual.start)}${projection ? `, on course to end ${formatTimelineDate(projection)}` : ''}`}
                      </span>
                      {slips[index] !== null && (
                        <StatusLabel
                          className='text-xs'
                          tone={slips[index] > 0 ? 'bad' : 'good'}
                        >
                          {describeSlip(slips[index])}
                        </StatusLabel>
                      )}
                    </>
                  )
                }}
              />
              <ol aria-hidden className='flex flex-col'>
                <li
                  className='text-muted-foreground text-right text-xs leading-5'
                  style={{ height: TIMELINE_AXIS_HEIGHT }}
                >
                  Slip
                </li>
                {phases.map((phase, index) => (
                  <li
                    key={phase.id}
                    className='flex items-center justify-end'
                    style={{ height: ROW_HEIGHT }}
                  >
                    <Slip slip={slips[index]} />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
        {state !== 'error' && state !== 'empty' && (
          <ul
            aria-hidden
            className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'
          >
            <li className='flex items-center gap-1.5'>
              <span className='border-muted-foreground/70 h-2.5 w-4 rounded-sm border border-dashed' />
              Planned
            </li>
            <li className='flex items-center gap-1.5'>
              <span className='h-2.5 w-4 rounded-sm bg-chart-2' />
              Actual
            </li>
            <li className='flex items-center gap-1.5'>
              <span
                className='h-2.5 w-4 rounded-sm'
                style={{
                  background:
                    'linear-gradient(to right, var(--color-chart-2) 50%, color-mix(in oklab, var(--color-chart-2) 25%, transparent))',
                }}
              />
              Still running
            </li>
            <li className='flex items-center gap-1.5'>
              <span className='h-2.5 w-4 rounded-sm border border-dashed border-chart-2' />
              Projected
            </li>
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Timeline4,
  exampleProps as timeline4ExampleProps,
  type Phase,
  type Timeline4Props,
}
