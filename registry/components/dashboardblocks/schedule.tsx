'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface ScheduleEvent {
  allDay?: boolean
  calendar?: string
  /** @default 'var(--chart-2)' */
  color?: string
  /** Leave out for a point in time, such as a deadline. */
  end?: Date
  id: string
  location?: string
  start: Date
  title: string
}

const DAY = 86_400_000

const partsFormatters = new Map<string, Intl.DateTimeFormat>()

function getDateParts(date: Date, timeZone = 'UTC') {
  let formatter = partsFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      hour: 'numeric',
      hourCycle: 'h23',
      minute: 'numeric',
      month: 'numeric',
      timeZone,
      year: 'numeric',
    })
    partsFormatters.set(timeZone, formatter)
  }
  const parts: Record<string, number> = {}
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value)
  }
  return {
    day: parts.day,
    hour: parts.hour % 24,
    minute: parts.minute,
    month: parts.month - 1,
    year: parts.year,
  }
}

function getDay(date: Date, timeZone = 'UTC') {
  const { day, month, year } = getDateParts(date, timeZone)
  return new Date(Date.UTC(year, month, day))
}

function getDayKey(date: Date, timeZone = 'UTC') {
  return getDay(date, timeZone).toISOString().slice(0, 10)
}

function addDays(day: Date, days: number) {
  return new Date(day.getTime() + days * DAY)
}

function getDayOffset(date: Date, now: Date, timeZone = 'UTC') {
  return Math.round(
    (getDay(date, timeZone).getTime() - getDay(now, timeZone).getTime()) / DAY,
  )
}

function formatDay(
  day: Date,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  },
) {
  return day.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' })
}

function formatRelativeDay(day: Date, today: Date) {
  const offset = Math.round((day.getTime() - today.getTime()) / DAY)
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'
  if (offset === -1) return 'Yesterday'
  if (offset > 1 && offset < 7) return formatDay(day, { weekday: 'long' })
  return formatDay(day)
}

function formatDayLabel(date: Date, now: Date, timeZone = 'UTC') {
  return formatRelativeDay(getDay(date, timeZone), getDay(now, timeZone))
}

function formatTime(date: Date, timeZone = 'UTC') {
  const { hour, minute } = getDateParts(date, timeZone)
  const hour12 = hour % 12 || 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`
}

function formatTimeRange(start: Date, end: Date | undefined, timeZone = 'UTC') {
  const from = formatTime(start, timeZone)
  if (!end) return from
  const to = formatTime(end, timeZone)
  if (from.slice(-2) === to.slice(-2)) return `${from.slice(0, -3)}–${to}`
  return `${from}–${to}`
}

function formatDuration(start: Date, end: Date) {
  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`
}

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

function formatCountdown(date: Date, now: Date, timeZone = 'UTC') {
  const offset = getDayOffset(date, now, timeZone)
  if (offset !== 0) return relativeFormatter.format(offset, 'day')
  const minutes = Math.round((date.getTime() - now.getTime()) / 60_000)
  if (Math.abs(minutes) < 1) return 'now'
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, 'minute')
  return relativeFormatter.format(Math.round(minutes / 60), 'hour')
}

interface ScheduleDay<T extends ScheduleEvent> {
  day: Date
  events: T[]
  key: string
  label: string
}

function groupByDay<T extends ScheduleEvent>(events: T[], now: Date, timeZone = 'UTC') {
  const days = new Map<string, ScheduleDay<T>>()
  for (const event of [...events].sort((a, b) => a.start.getTime() - b.start.getTime())) {
    const key = getDayKey(event.start, timeZone)
    const group = days.get(key) ?? {
      day: getDay(event.start, timeZone),
      events: [],
      key,
      label: formatDayLabel(event.start, now, timeZone),
    }
    group.events.push(event)
    days.set(key, group)
  }
  return [...days.values()]
}

function getMonthWeeks(month: Date, weekStartsOn: 0 | 1 = 0) {
  const first = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1))
  const start = addDays(first, -((first.getUTCDay() - weekStartsOn + 7) % 7))
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => addDays(start, week * 7 + weekday)),
  )
}

function EventSwatch({ className, color }: { className?: string; color?: string }) {
  return (
    <span
      aria-hidden
      className={cn('size-2 shrink-0 rounded-full', className)}
      style={{ backgroundColor: color ?? 'var(--chart-2)' }}
    />
  )
}

interface EventRowProps {
  action?: ReactNode
  className?: string
  event: ScheduleEvent
  /** Dims events that have ended and marks the one in progress. */
  now?: Date
  /** @default 'UTC' */
  timeZone?: string
}

function EventRow({ action, className, event, now, timeZone = 'UTC' }: EventRowProps) {
  const ended = now !== undefined && (event.end ?? event.start) <= now
  const live =
    now !== undefined &&
    !event.allDay &&
    event.end !== undefined &&
    event.start <= now &&
    now < event.end
  const meta = [event.calendar, event.location].filter(Boolean).join(' · ')

  return (
    <li className={cn('flex items-stretch gap-3', className)}>
      <div className='flex w-16 shrink-0 flex-col pt-px text-xs tabular-nums'>
        {event.allDay ? (
          <span className='text-muted-foreground font-medium'>All day</span>
        ) : (
          <>
            <time
              dateTime={event.start.toISOString()}
              className={cn('font-medium', ended && 'text-muted-foreground')}
            >
              {formatTime(event.start, timeZone)}
            </time>
            {event.end && (
              <span className='text-muted-foreground'>
                {formatDuration(event.start, event.end)}
              </span>
            )}
          </>
        )}
      </div>
      <span
        aria-hidden
        className={cn('w-1 shrink-0 rounded-full', ended && 'opacity-40')}
        style={{ backgroundColor: event.color ?? 'var(--chart-2)' }}
      />
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <p
          className={cn(
            'flex flex-wrap items-center gap-x-2 text-sm font-medium',
            ended && 'text-muted-foreground',
          )}
        >
          <span className='min-w-0 break-words'>{event.title}</span>
          {live && (
            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'>
              <span
                aria-hidden
                className='size-1.5 rounded-full bg-current motion-safe:animate-pulse'
              />
              Now
            </span>
          )}
          {ended && <span className='sr-only'>(ended)</span>}
        </p>
        {meta && <p className='text-muted-foreground truncate text-xs'>{meta}</p>}
      </div>
      {action && <div className='flex shrink-0 items-start'>{action}</div>}
    </li>
  )
}

type Urgency = 'overdue' | 'today' | 'soon' | 'later'

const urgencyConfig: Record<
  Urgency,
  { icon: React.ReactNode; label: string; soft: string; text: string }
> = {
  later: {
    icon: (
      <IconPlaceholder
        lucide='CalendarClockIcon'
        tabler='IconCalendarTime'
        hugeicons='Calendar03Icon'
        phosphor='CalendarDotsIcon'
        remixicon='RiCalendarScheduleLine'
        aria-hidden
      />
    ),
    label: 'Upcoming',
    soft: 'bg-muted text-muted-foreground',
    text: 'text-muted-foreground',
  },
  overdue: {
    icon: (
      <IconPlaceholder
        lucide='OctagonAlertIcon'
        tabler='IconAlertOctagon'
        hugeicons='AlertDiamondIcon'
        phosphor='WarningOctagonIcon'
        remixicon='RiAlarmWarningLine'
        aria-hidden
      />
    ),
    label: 'Overdue',
    soft: 'bg-red-500/10 text-red-700 dark:text-red-400',
    text: 'text-red-700 dark:text-red-400',
  },
  soon: {
    icon: (
      <IconPlaceholder
        lucide='ClockIcon'
        tabler='IconClock'
        hugeicons='Clock01Icon'
        phosphor='ClockIcon'
        remixicon='RiTimeLine'
        aria-hidden
      />
    ),
    label: 'Due soon',
    soft: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    text: 'text-amber-800 dark:text-amber-400',
  },
  today: {
    icon: (
      <IconPlaceholder
        lucide='TimerIcon'
        tabler='IconStopwatch'
        hugeicons='Timer02Icon'
        phosphor='TimerIcon'
        remixicon='RiTimerLine'
        aria-hidden
      />
    ),
    label: 'Today',
    soft: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    text: 'text-amber-800 dark:text-amber-400',
  },
}

/** How pressing a deadline is by calendar day: overdue, today, within `soonDays` (default 7) or later. */
function getUrgency(date: Date, now: Date, timeZone = 'UTC', soonDays = 7): Urgency {
  const offset = getDayOffset(date, now, timeZone)
  if (offset < 0) return 'overdue'
  if (offset === 0) return 'today'
  return offset <= soonDays ? 'soon' : 'later'
}

function UrgencyBadge({
  className,
  label,
  urgency,
}: {
  className?: string
  label?: string
  urgency: Urgency
}) {
  const config = urgencyConfig[urgency]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.soft,
        className,
      )}
    >
      {config.icon}
      {label ?? config.label}
    </span>
  )
}

interface MonthCalendarProps {
  className?: string
  /** Events to mark with dots, up to three per day. */
  events: ScheduleEvent[]
  label: string
  /** The month shown, as a plain day from `getDay`. */
  month: Date
  onMonthChange: (month: Date) => void
  onSelect: (day: Date) => void
  now: Date
  selected?: Date
  /** @default 'UTC' */
  timeZone?: string
  /** 0 for Sunday, 1 for Monday. */
  weekStartsOn?: 0 | 1
}

function MonthCalendar({
  className,
  events,
  label,
  month,
  now,
  onMonthChange,
  onSelect,
  selected,
  timeZone = 'UTC',
  weekStartsOn = 0,
}: MonthCalendarProps) {
  const grid = useRef<HTMLTableElement>(null)
  const [cursor, setCursor] = useState<Date | null>(null)
  const shouldFocus = useRef(false)

  const weeks = getMonthWeeks(month, weekStartsOn)
  const today = getDay(now, timeZone).getTime()
  const inMonth = (day: Date) =>
    day.getUTCFullYear() === month.getUTCFullYear() &&
    day.getUTCMonth() === month.getUTCMonth()
  const fallback =
    selected && inMonth(selected)
      ? selected
      : inMonth(new Date(today))
        ? new Date(today)
        : new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1))
  const active = cursor && inMonth(cursor) ? cursor : fallback

  const eventsByDay = new Map<string, ScheduleEvent[]>()
  for (const event of events) {
    const key = getDayKey(event.start, timeZone)
    eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event])
  }

  useEffect(() => {
    if (!shouldFocus.current) return
    shouldFocus.current = false
    grid.current
      ?.querySelector<HTMLElement>(`[data-day="${active.toISOString().slice(0, 10)}"]`)
      ?.focus()
  })

  const moveTo = (day: Date) => {
    setCursor(day)
    shouldFocus.current = true
    if (!inMonth(day))
      onMonthChange(new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1)))
  }

  const moveMonths = (months: number) => {
    const target = new Date(
      Date.UTC(active.getUTCFullYear(), active.getUTCMonth() + months, 1),
    )
    const lastDay = new Date(
      Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
    ).getUTCDate()
    target.setUTCDate(Math.min(active.getUTCDate(), lastDay))
    moveTo(target)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const weekday = (active.getUTCDay() - weekStartsOn + 7) % 7
    switch (event.key) {
      case 'ArrowRight':
        moveTo(addDays(active, 1))
        break
      case 'ArrowLeft':
        moveTo(addDays(active, -1))
        break
      case 'ArrowDown':
        moveTo(addDays(active, 7))
        break
      case 'ArrowUp':
        moveTo(addDays(active, -7))
        break
      case 'Home':
        moveTo(addDays(active, -weekday))
        break
      case 'End':
        moveTo(addDays(active, 6 - weekday))
        break
      case 'PageDown':
        moveMonths(event.shiftKey ? 12 : 1)
        break
      case 'PageUp':
        moveMonths(event.shiftKey ? -12 : -1)
        break
      default:
        return
    }
    event.preventDefault()
  }

  const weekdays = weeks[0].map((day) => ({
    long: formatDay(day, { weekday: 'long' }),
    short: formatDay(day, { weekday: 'short' }).slice(0, 2),
  }))

  return (
    <table
      ref={grid}
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role -- the ARIA date grid pattern is a table with the grid role
      role='grid'
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('w-full table-fixed border-collapse', className)}
    >
      <thead>
        <tr>
          {weekdays.map((weekday) => (
            <th
              key={weekday.long}
              scope='col'
              abbr={weekday.long}
              className='text-muted-foreground pb-1 text-xs font-normal'
            >
              {weekday.short}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0].getTime()}>
            {week.map((day) => {
              const key = day.toISOString().slice(0, 10)
              const dayEvents = eventsByDay.get(key) ?? []
              const isToday = day.getTime() === today
              const isSelected = selected?.getTime() === day.getTime()
              const isActive = active.getTime() === day.getTime()
              const outside = !inMonth(day)
              const name = [
                formatDay(day, { day: 'numeric', month: 'long', weekday: 'long' }),
                isToday ? 'today' : '',
                dayEvents.length === 0
                  ? 'no events'
                  : `${dayEvents.length} ${dayEvents.length === 1 ? 'event' : 'events'}`,
              ]
                .filter(Boolean)
                .join(', ')
              return (
                <td key={key} aria-selected={isSelected} className='p-0.5 text-center'>
                  <button
                    type='button'
                    data-day={key}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={name}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => {
                      setCursor(day)
                      if (outside) {
                        onMonthChange(
                          new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1)),
                        )
                      }
                      onSelect(day)
                    }}
                    className={cn(
                      'focus-visible:ring-ring/50 relative mx-auto flex h-10 w-full max-w-10 flex-col items-center justify-center gap-0.5 rounded-md text-sm tabular-nums outline-none focus-visible:ring-[3px]',
                      outside ? 'text-muted-foreground/60' : 'hover:bg-muted',
                      isToday &&
                        !isSelected &&
                        'text-foreground font-semibold ring-1 ring-border',
                      isSelected &&
                        'bg-primary text-primary-foreground hover:bg-primary font-semibold',
                    )}
                  >
                    <span aria-hidden className='leading-none'>
                      {day.getUTCDate()}
                    </span>
                    <span aria-hidden className='flex h-1.5 items-center gap-0.5'>
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          className={cn(
                            'size-1 rounded-full',
                            isSelected && 'ring-primary-foreground/80 ring-1',
                          )}
                          style={{ backgroundColor: event.color ?? 'var(--chart-2)' }}
                        />
                      ))}
                    </span>
                  </button>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export {
  EventRow,
  EventSwatch,
  MonthCalendar,
  UrgencyBadge,
  addDays,
  formatCountdown,
  formatDay,
  formatDayLabel,
  formatDuration,
  formatRelativeDay,
  formatTime,
  formatTimeRange,
  getDateParts,
  getDay,
  getDayKey,
  getDayOffset,
  getMonthWeeks,
  getUrgency,
  groupByDay,
  urgencyConfig,
}

export type { EventRowProps, MonthCalendarProps, ScheduleDay, ScheduleEvent, Urgency }
