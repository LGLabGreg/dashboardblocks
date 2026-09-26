'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useState } from 'react'

import { cn } from '@/lib/utils'

const DAY = 86_400_000

type TimelineUnit = 'week' | 'month' | 'quarter'

/** Maps dates between `start` and `end` to 0–100%, all in UTC. */
function getTimelineScale(start: Date, end: Date) {
  const from = start.getTime()
  const span = Math.max(DAY, end.getTime() - from)
  return (date: Date) =>
    Math.min(100, Math.max(0, ((date.getTime() - from) / span) * 100))
}

/** The start of each week (Monday), month or quarter between `start` and `end`, in UTC. */
function getTimelineTicks(start: Date, end: Date, unit: TimelineUnit) {
  const ticks: Date[] = []
  let cursor: Date
  if (unit === 'week') {
    const weekday = (start.getUTCDay() + 6) % 7
    cursor = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() - weekday),
    )
    if (cursor < start) cursor = new Date(cursor.getTime() + 7 * DAY)
  } else {
    const step = unit === 'quarter' ? 3 : 1
    const month = Math.ceil(start.getUTCMonth() / step) * step
    cursor = new Date(Date.UTC(start.getUTCFullYear(), month, 1))
    if (cursor < start)
      cursor = new Date(Date.UTC(start.getUTCFullYear(), month + step, 1))
  }
  while (cursor <= end) {
    ticks.push(cursor)
    cursor =
      unit === 'week'
        ? new Date(cursor.getTime() + 7 * DAY)
        : new Date(
            Date.UTC(
              cursor.getUTCFullYear(),
              cursor.getUTCMonth() + (unit === 'quarter' ? 3 : 1),
              1,
            ),
          )
  }
  return ticks
}

/** Whole days from `from` to `to`, in UTC; negative when `to` is earlier. */
function getDaysBetween(from: Date, to: Date) {
  const utc = (date: Date) =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.round((utc(to) - utc(from)) / DAY)
}

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

/** "Sep 26", in UTC. */
function formatTimelineDate(date: Date) {
  return dayFormatter.format(date)
}

/** "Jul 6 – Sep 30", in UTC. */
function formatTimelineRange(start: Date, end: Date) {
  return `${dayFormatter.format(start)} – ${dayFormatter.format(end)}`
}

type TimelineStatus = 'done' | 'in-progress' | 'planned' | 'at-risk'

const timelineStatusConfig: Record<
  TimelineStatus,
  { className: string; icon: ReactNode; label: string }
> = {
  'at-risk': {
    className: 'text-amber-700 dark:text-amber-400',
    icon: (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
      />
    ),
    label: 'At risk',
  },
  done: {
    className: 'text-emerald-700 dark:text-emerald-400',
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'Done',
  },
  'in-progress': {
    className: 'text-foreground',
    icon: (
      <IconPlaceholder
        lucide='CircleDotIcon'
        tabler='IconCircleDot'
        hugeicons='RecordIcon'
        phosphor='RecordIcon'
        remixicon='RiRecordCircleLine'
        aria-hidden
      />
    ),
    label: 'In progress',
  },
  planned: {
    className: 'text-muted-foreground',
    icon: (
      <IconPlaceholder
        lucide='CircleDashedIcon'
        tabler='IconCircleDashed'
        hugeicons='DashedLineCircleIcon'
        phosphor='CircleDashedIcon'
        remixicon='RiLoaderLine'
        aria-hidden
      />
    ),
    label: 'Planned',
  },
}

/** The status icon, with its label for screen readers or shown beside it. */
function TimelineStatusLabel({
  className,
  showLabel = false,
  status,
}: {
  className?: string
  showLabel?: boolean
  status: TimelineStatus
}) {
  const config = timelineStatusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.className,
        className,
      )}
    >
      {config.icon}
      <span className={cn(!showLabel && 'sr-only')}>{config.label}</span>
    </span>
  )
}

interface TimelineAxisProps {
  className?: string
  end: Date
  /** @default month names, e.g. "Sep" */
  format?: (date: Date) => string
  start: Date
  ticks: Date[]
}

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
})

/** Tick labels along the top of a timeline track. */
function TimelineAxis({
  className,
  end,
  format = (date) => monthFormatter.format(date),
  start,
  ticks,
}: TimelineAxisProps) {
  const position = getTimelineScale(start, end)
  return (
    <div
      aria-hidden
      className={cn(
        'text-muted-foreground relative h-5 text-[11px] tabular-nums',
        className,
      )}
    >
      {ticks.map((tick) => (
        <span
          key={tick.getTime()}
          className='absolute top-0 border-l pl-1 leading-5 whitespace-nowrap'
          style={{ left: `${position(tick)}%` }}
        >
          {format(tick)}
        </span>
      ))}
    </div>
  )
}

/** Faint vertical lines at each tick, behind a track. */
function TimelineGridLines({
  end,
  start,
  ticks,
}: {
  end: Date
  start: Date
  ticks: Date[]
}) {
  const position = getTimelineScale(start, end)
  return (
    <div aria-hidden className='pointer-events-none absolute inset-0'>
      {ticks.map((tick) => (
        <span
          key={tick.getTime()}
          className='bg-border/70 absolute inset-y-0 w-px'
          style={{ left: `${position(tick)}%` }}
        />
      ))}
    </div>
  )
}

/** A vertical line at `now`, labelled at the top. */
function TimelineToday({
  end,
  label = 'Today',
  now,
  start,
}: {
  end: Date
  label?: string
  now: Date
  start: Date
}) {
  if (now < start || now > end) return null
  const left = getTimelineScale(start, end)(now)
  return (
    <div
      aria-hidden
      className='pointer-events-none absolute inset-y-0 z-10 flex -translate-x-1/2 flex-col items-center'
      style={{ left: `${left}%` }}
    >
      <span className='bg-foreground text-background rounded-sm px-1 text-[10px] leading-4 font-medium'>
        {label}
      </span>
      <span className='bg-foreground w-px flex-1' />
    </div>
  )
}

interface TimelineItem {
  /** @default 'var(--chart-1)' */
  color?: string
  end: Date
  /** Names a group; consecutive items with the same group sit under one heading. */
  group?: string
  id: string
  label: string
  /** Share done, 0–1. */
  progress?: number
  start: Date
  status?: TimelineStatus
}

interface TimelineProps {
  /** Shown under the chart when nothing is hovered. */
  children?: ReactNode
  className?: string
  /** Describes a hovered item for the readout. */
  describe?: (item: TimelineItem) => string
  end: Date
  formatTick?: (date: Date) => string
  items: TimelineItem[]
  /**
   * Keeps bars legible in narrow cards: below this width the track scrolls
   * sideways. E.g. '40rem'.
   */
  minWidth?: string
  now?: Date
  start: Date
  /** @default 'month' */
  unit?: TimelineUnit
}

/**
 * A Gantt-style timeline: one row per item, a bar from start to end filled
 * to its progress, grouped under headings, with a today line. Hovering a bar
 * reads it out under the chart. Rows are a list for screen readers, each
 * with its dates, status and progress.
 */
function Timeline({
  children,
  className,
  describe,
  end,
  formatTick,
  items,
  minWidth,
  now,
  start,
  unit = 'month',
}: TimelineProps) {
  const [active, setActive] = useState<string | null>(null)
  const position = getTimelineScale(start, end)
  const ticks = getTimelineTicks(start, end, unit)
  const describeItem =
    describe ??
    ((item: TimelineItem) =>
      [
        `${item.label}: ${formatTimelineRange(item.start, item.end)}`,
        item.status && timelineStatusConfig[item.status].label.toLowerCase(),
        item.progress !== undefined && `${Math.round(item.progress * 100)}% done`,
      ]
        .filter(Boolean)
        .join(', '))
  const activeItem = items.find((item) => item.id === active)

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className={cn(minWidth && '-my-1 overflow-x-auto py-1')}>
        <div
          className='grid grid-cols-[minmax(6rem,11rem)_minmax(0,1fr)] gap-x-3'
          style={{ minWidth }}
          onPointerLeave={() => setActive(null)}
        >
          {/* Placed explicitly: the today line below is, and explicit items go first. */}
          <span
            aria-hidden
            className={cn(
              'col-start-1 row-start-1',
              minWidth && 'bg-card sticky left-0 z-20',
            )}
          />
          <TimelineAxis
            className='col-start-2 row-start-1'
            end={end}
            format={formatTick}
            start={start}
            ticks={ticks}
          />
          <ul className='col-span-full row-start-2 grid grid-cols-subgrid'>
            {items.map((item, index) => {
              const heading = item.group && item.group !== items[index - 1]?.group
              const color = item.color ?? 'var(--chart-1)'
              const left = position(item.start)
              const width = Math.max(1.5, position(item.end) - left)
              return (
                <li key={item.id} className='col-span-full grid grid-cols-subgrid'>
                  {heading && (
                    <span
                      className={cn(
                        'text-muted-foreground col-span-full pt-3 pb-1 text-[11px] font-medium tracking-wide uppercase',
                        minWidth && 'bg-card sticky left-0 w-max pr-2',
                      )}
                    >
                      {item.group}
                    </span>
                  )}
                  <span
                    className={cn(
                      'flex min-w-0 items-center gap-1.5 py-1 text-sm',
                      minWidth && 'bg-card sticky left-0 z-20',
                    )}
                  >
                    {item.status && <TimelineStatusLabel status={item.status} />}
                    <span className='truncate'>{item.label}</span>
                    <span className='sr-only'>, {describeItem(item)}</span>
                  </span>
                  <span className='relative h-8'>
                    <TimelineGridLines end={end} start={start} ticks={ticks} />
                    <span
                      aria-hidden
                      className={cn(
                        'ring-offset-card absolute top-1.5 bottom-1.5 overflow-hidden rounded-md',
                        item.status === 'planned' && 'border border-dashed',
                        active === item.id && 'ring-foreground ring-2 ring-offset-1',
                      )}
                      style={{
                        backgroundColor: `color-mix(in oklab, ${color} ${item.status === 'planned' ? 10 : 22}%, var(--card))`,
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                      onPointerEnter={() => setActive(item.id)}
                      onPointerDown={() => setActive(item.id)}
                    >
                      {item.progress !== undefined && (
                        <span
                          className='absolute inset-y-0 left-0'
                          style={{
                            backgroundColor: color,
                            width: `${Math.min(1, Math.max(0, item.progress)) * 100}%`,
                          }}
                        />
                      )}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
          {now && (
            <div
              aria-hidden
              className='pointer-events-none relative col-start-2 row-start-1 row-end-3'
            >
              <TimelineToday end={end} now={now} start={start} />
            </div>
          )}
        </div>
      </div>
      <p className='text-muted-foreground min-h-5 text-sm'>
        {activeItem ? (
          <span className='text-foreground'>{describeItem(activeItem)}</span>
        ) : (
          children
        )}
      </p>
    </div>
  )
}

export {
  Timeline,
  TimelineAxis,
  TimelineGridLines,
  TimelineStatusLabel,
  TimelineToday,
  formatTimelineDate,
  formatTimelineRange,
  getDaysBetween,
  getTimelineScale,
  getTimelineTicks,
  timelineStatusConfig,
}

export type {
  TimelineAxisProps,
  TimelineItem,
  TimelineProps,
  TimelineStatus,
  TimelineUnit,
}
