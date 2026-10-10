'use client'

import {
  type ScheduleEvent,
  addDays,
  formatDay,
  formatTime,
  formatTimeRange,
  getDateParts,
  getDay,
  getDayKey,
  getMonthWeeks,
} from '@/registry/components/dashboardblocks/schedule'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { cn } from '@/lib/utils'

interface CalendarEvent extends ScheduleEvent {
  attendees?: { avatar?: string; name: string }[]
  description?: string
  /** The `id` of the room or person the event is booked on, for `CalendarResourceView`. */
  resource?: string
}

const DAY = 86_400_000

const MIN_EVENT_MINUTES = 30
const HOUR_LABEL_OFFSET_PX = 12

const toKey = (day: Date) => day.toISOString().slice(0, 10)
const getEnd = (event: ScheduleEvent) => (event.end ?? event.start).getTime()

function getWeekDays(day: Date, weekStartsOn: 0 | 1 = 0) {
  const start = addDays(day, -((day.getUTCDay() - weekStartsOn + 7) % 7))
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

function startOfMonth(day: Date, months = 0) {
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + months, 1))
}

function formatDayRange(first: Date, last: Date) {
  const year = last.getUTCFullYear()
  if (first.getUTCFullYear() !== year) {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
    return `${formatDay(first, options)} – ${formatDay(last, options)}`
  }
  if (first.getUTCMonth() === last.getUTCMonth()) {
    return `${formatDay(first, { month: 'long' })} ${first.getUTCDate()}–${last.getUTCDate()}, ${year}`
  }
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${formatDay(first, options)} – ${formatDay(last, options)}, ${year}`
}

function getEventDays(event: ScheduleEvent, timeZone = 'UTC') {
  const first = getDay(event.start, timeZone)
  if (!event.end || event.end <= event.start) return { first, last: first }
  const last = getDay(new Date(event.end.getTime() - 1), timeZone)
  return { first, last: last < first ? first : last }
}

function spansDays(event: ScheduleEvent, timeZone = 'UTC') {
  if (event.allDay) return true
  const { first, last } = getEventDays(event, timeZone)
  return first.getTime() !== last.getTime()
}

/** Events on a plain day in `timeZone`, including ones spanning it: those first, then by start. */
function getEventsForDay<T extends ScheduleEvent>(
  events: T[],
  day: Date,
  timeZone = 'UTC',
) {
  const time = day.getTime()
  return events
    .filter((event) => {
      const { first, last } = getEventDays(event, timeZone)
      return first.getTime() <= time && time <= last.getTime()
    })
    .sort(
      (a, b) =>
        Number(spansDays(b, timeZone)) - Number(spansDays(a, timeZone)) ||
        a.start.getTime() - b.start.getTime() ||
        getEnd(b) - getEnd(a),
    )
}

interface EventSegment<T extends ScheduleEvent = CalendarEvent> {
  continuesAfter: boolean
  continuesBefore: boolean
  event: T
  lane: number
  span: number
  start: number
}

function layoutSegments<T extends ScheduleEvent>(
  events: T[],
  days: Date[],
  timeZone = 'UTC',
): EventSegment<T>[] {
  const firstDay = days[0].getTime()
  const lastDay = days[days.length - 1].getTime()
  const laneEnds: number[] = []
  return events
    .map((event) => {
      const { first, last } = getEventDays(event, timeZone)
      return { event, first: first.getTime(), last: last.getTime() }
    })
    .filter(({ first, last }) => first <= lastDay && last >= firstDay)
    .sort(
      (a, b) =>
        a.first - b.first ||
        b.last - a.last ||
        a.event.start.getTime() - b.event.start.getTime(),
    )
    .map(({ event, first, last }) => {
      const start = Math.round((Math.max(first, firstDay) - firstDay) / DAY)
      const end = Math.round((Math.min(last, lastDay) - firstDay) / DAY)
      let lane = laneEnds.findIndex((laneEnd) => laneEnd < start)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = end
      return {
        continuesAfter: last > lastDay,
        continuesBefore: first < firstDay,
        event,
        lane,
        span: end - start + 1,
        start,
      }
    })
}

interface EventLayout<T extends ScheduleEvent = CalendarEvent> {
  event: T
  lane: number
  lanes: number
  span: number
}

function layoutEvents<T extends ScheduleEvent>(events: T[]): EventLayout<T>[] {
  const sorted = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime() || getEnd(b) - getEnd(a),
  )
  const result: EventLayout<T>[] = []
  let group: { end: number; event: T; lane: number; start: number }[] = []
  let laneEnds: number[] = []
  let groupEnd = -Infinity

  const flush = () => {
    const lanes = laneEnds.length
    for (const item of group) {
      let span = 1
      while (
        item.lane + span < lanes &&
        !group.some(
          (other) =>
            other.lane === item.lane + span &&
            other.start < item.end &&
            item.start < other.end &&
            other.start < item.start + MIN_EVENT_MINUTES * 60_000,
        )
      ) {
        span++
      }
      result.push({ event: item.event, lane: item.lane, lanes, span })
    }
    group = []
    laneEnds = []
  }

  for (const event of sorted) {
    const start = event.start.getTime()
    const end = Math.max(getEnd(event), start + MIN_EVENT_MINUTES * 60_000)
    if (start >= groupEnd) flush()
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = end
    group.push({ end, event, lane, start })
    groupEnd = group.length === 1 ? end : Math.max(groupEnd, end)
  }
  flush()
  return result
}

function getEventWhen(
  event: ScheduleEvent,
  timeZone: string,
  style: 'long' | 'short',
): string[] {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: style,
    weekday: style,
  }
  const { first, last } = getEventDays(event, timeZone)
  if (first.getTime() === last.getTime()) {
    return [
      formatDay(first, options),
      event.allDay ? 'All day' : formatTimeRange(event.start, event.end, timeZone),
    ]
  }
  if (event.allDay) return [`${formatDay(first, options)} – ${formatDay(last, options)}`]
  return [
    `${formatDay(first, options)}, ${formatTime(event.start, timeZone)} – ${formatDay(last, options)}, ${formatTime(new Date(getEnd(event)), timeZone)}`,
  ]
}

function formatEventDate(
  event: ScheduleEvent,
  timeZone = 'UTC',
  style: 'long' | 'short' = 'short',
) {
  return getEventWhen(event, timeZone, style).join(' · ')
}

function getEventLabel(event: ScheduleEvent, timeZone = 'UTC') {
  return [
    event.title,
    ...getEventWhen(event, timeZone, 'long'),
    event.calendar,
    event.location,
  ]
    .filter(Boolean)
    .join(', ')
}

function formatShortTime(date: Date, timeZone: string) {
  const { hour, minute } = getDateParts(date, timeZone)
  const time = `${hour % 12 || 12}${minute === 0 ? '' : `:${String(minute).padStart(2, '0')}`}`
  return `${time}${hour < 12 ? 'a' : 'p'}`
}

const eventStyle = (event: ScheduleEvent, amount = 28): CSSProperties => ({
  backgroundColor: `color-mix(in oklab, ${event.color ?? 'var(--chart-2)'} ${amount}%, var(--card))`,
})

const eventFocus =
  'outline-none focus-visible:z-20 focus-visible:ring-[3px] focus-visible:ring-ring/50'

interface CalendarToolbarProps {
  children?: ReactNode
  className?: string
  description?: ReactNode
  nextLabel?: string
  onNext: () => void
  onPrevious: () => void
  onToday: () => void
  onViewChange?: (view: string) => void
  previousLabel?: string
  title: ReactNode
  view?: string
  views?: { label: string; value: string }[]
}

function CalendarToolbar({
  children,
  className,
  description,
  nextLabel = 'Next',
  onNext,
  onPrevious,
  onToday,
  onViewChange,
  previousLabel = 'Previous',
  title,
  view,
  views,
}: CalendarToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-3',
        className,
      )}
    >
      <div className='flex min-w-0 flex-col'>
        <h2 aria-live='polite' className='text-lg font-semibold'>
          {title}
        </h2>
        {description && <p className='text-muted-foreground text-xs'>{description}</p>}
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Button variant='outline' size='sm' onClick={onToday}>
          Today
        </Button>
        <ButtonGroup>
          <Button
            variant='outline'
            size='icon-sm'
            aria-label={previousLabel}
            onClick={onPrevious}
          >
            <IconPlaceholder
              lucide='ChevronLeftIcon'
              tabler='IconChevronLeft'
              hugeicons='ArrowLeft01Icon'
              phosphor='CaretLeftIcon'
              remixicon='RiArrowLeftSLine'
            />
          </Button>
          <Button
            variant='outline'
            size='icon-sm'
            aria-label={nextLabel}
            onClick={onNext}
          >
            <IconPlaceholder
              lucide='ChevronRightIcon'
              tabler='IconChevronRight'
              hugeicons='ArrowRight01Icon'
              phosphor='CaretRightIcon'
              remixicon='RiArrowRightSLine'
            />
          </Button>
        </ButtonGroup>
        {views && view !== undefined && (
          <Tabs value={view} onValueChange={(next) => onViewChange?.(String(next))}>
            <TabsList aria-label='View'>
              {views.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        {children}
      </div>
    </div>
  )
}

interface EventBarProps {
  continuesAfter?: boolean
  continuesBefore?: boolean
  event: ScheduleEvent
  now?: Date
  onSelect?: () => void
  selected?: boolean
  stickyTitle?: boolean
  style?: CSSProperties
  tabIndex?: number
  className?: string
  timeZone: string
}

function EventBar({
  className,
  continuesAfter,
  continuesBefore,
  event,
  now,
  onSelect,
  selected,
  stickyTitle,
  style,
  tabIndex,
  timeZone,
}: EventBarProps) {
  const ended = now !== undefined && getEnd(event) <= now.getTime()
  return (
    <button
      type='button'
      data-event-id={event.id}
      tabIndex={tabIndex}
      aria-label={getEventLabel(event, timeZone)}
      aria-current={selected ? 'true' : undefined}
      onClick={onSelect}
      className={cn(
        'flex h-5 w-full min-w-0 items-center gap-1 rounded-sm px-1.5 text-left text-xs font-medium',
        continuesBefore && 'rounded-l-none',
        continuesAfter && 'rounded-r-none',
        ended && 'text-muted-foreground',
        selected && 'ring-primary ring-2',
        eventFocus,
        className,
      )}
      style={{ ...eventStyle(event, ended ? 14 : 28), ...style }}
    >
      {!event.allDay && !continuesBefore && (
        <span
          className={cn(
            'shrink-0 tabular-nums',
            ended ? 'text-muted-foreground' : 'text-foreground/70',
          )}
        >
          {formatShortTime(event.start, timeZone)}
        </span>
      )}
      <span className={cn('truncate', stickyTitle && 'sticky left-[3.875rem]')}>
        {event.title}
      </span>
    </button>
  )
}

interface CalendarMonthViewProps<T extends ScheduleEvent = CalendarEvent> {
  className?: string
  events: T[]
  label: string
  /** Rows of events a day shows, counting "+N more". */
  maxRows?: number
  /** The month shown, as a plain day from `getDay`. */
  month: Date
  now: Date
  onMonthChange: (month: Date) => void
  onSelectDay?: (day: Date) => void
  onSelectEvent?: (event: T) => void
  onShowMore?: (day: Date) => void
  selectedDay?: Date
  selectedEventId?: string
  /** @default 'UTC' */
  timeZone?: string
  /** 0 for Sunday, 1 for Monday. */
  weekStartsOn?: 0 | 1
}

type MonthSlot<T extends ScheduleEvent> =
  | { segment: EventSegment<T>; type: 'bar' }
  | { event: T; type: 'event' }
  | { count: number; type: 'more' }

function CalendarMonthView<T extends ScheduleEvent = CalendarEvent>({
  className,
  events,
  label,
  maxRows = 3,
  month,
  now,
  onMonthChange,
  onSelectDay,
  onSelectEvent,
  onShowMore = onSelectDay,
  selectedDay,
  selectedEventId,
  timeZone = 'UTC',
  weekStartsOn = 0,
}: CalendarMonthViewProps<T>) {
  const grid = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState<Date | null>(null)
  const shouldFocus = useRef(false)

  const weeks = getMonthWeeks(month, weekStartsOn)
  const today = getDay(now, timeZone).getTime()
  const inMonth = (day: Date) =>
    day.getUTCFullYear() === month.getUTCFullYear() &&
    day.getUTCMonth() === month.getUTCMonth()
  const fallback =
    selectedDay && inMonth(selectedDay)
      ? selectedDay
      : inMonth(new Date(today))
        ? new Date(today)
        : startOfMonth(month)
  const active = cursor && inMonth(cursor) ? cursor : fallback
  const barRows = Math.max(0, maxRows - 1)

  const spanning = events.filter((event) => spansDays(event, timeZone))
  const timedByDay = new Map<string, T[]>()
  for (const event of events) {
    if (spansDays(event, timeZone)) continue
    const key = getDayKey(event.start, timeZone)
    timedByDay.set(key, [...(timedByDay.get(key) ?? []), event])
  }
  for (const dayEvents of timedByDay.values()) {
    dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  useEffect(() => {
    if (!shouldFocus.current) return
    shouldFocus.current = false
    grid.current
      ?.querySelector<HTMLElement>(`[data-day="${toKey(active)}"] [data-day-button]`)
      ?.focus()
  })

  const moveTo = (day: Date) => {
    setCursor(day)
    shouldFocus.current = true
    if (!inMonth(day)) onMonthChange(startOfMonth(day))
  }

  const moveMonths = (months: number) => {
    const target = startOfMonth(active, months)
    const lastDay = startOfMonth(target, 1).getTime() - DAY
    moveTo(
      new Date(Math.min(target.getTime() + (active.getUTCDate() - 1) * DAY, lastDay)),
    )
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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

  return (
    // oxlint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      ref={grid}
      role='grid'
      aria-label={label}
      onKeyDown={onKeyDown}
      onFocus={(event) => {
        const key = (event.target as HTMLElement).closest<HTMLElement>('[data-day]')
          ?.dataset.day
        if (key) setCursor(new Date(key))
      }}
      className={cn(
        'bg-border @container flex flex-col gap-px overflow-hidden rounded-lg border',
        className,
      )}
    >
      <div role='row' className='grid grid-cols-7 gap-px'>
        {weeks[0].map((day) => (
          <div
            key={day.getTime()}
            role='columnheader'
            aria-label={formatDay(day, { weekday: 'long' })}
            className='bg-card text-muted-foreground py-1.5 text-center text-xs font-medium'
          >
            <span className='@2xl:hidden'>{formatDay(day, { weekday: 'narrow' })}</span>
            <span className='hidden @2xl:inline'>
              {formatDay(day, { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
      {weeks.map((week) => {
        const segments = layoutSegments(spanning, week, timeZone)
        const activeColumn = week.findIndex((day) => day.getTime() === active.getTime())
        return (
          <div key={week[0].getTime()} role='row' className='grid grid-cols-7 gap-px'>
            {week.map((day, column) => {
              const key = toKey(day)
              const covering = segments.filter(
                (segment) =>
                  segment.start <= column && column < segment.start + segment.span,
              )
              const timed = timedByDay.get(key) ?? []
              const count = covering.length + timed.length
              const isToday = day.getTime() === today
              const isSelected = selectedDay?.getTime() === day.getTime()
              const isActive = active.getTime() === day.getTime()
              const outside = !inMonth(day)
              const dayName = formatDay(day, {
                day: 'numeric',
                month: 'long',
                weekday: 'long',
              })

              const slots: (MonthSlot<T> | undefined)[] = []
              for (const segment of covering) {
                if (segment.lane < barRows) slots[segment.lane] = { segment, type: 'bar' }
              }
              const queue = [...timed]
              const hidden = covering.filter((segment) => segment.lane >= barRows).length
              for (let row = 0; row < maxRows; row++) {
                if (slots[row]) continue
                const remaining = queue.length + hidden
                if (remaining === 0) break
                if ((row === maxRows - 1 && remaining > 1) || queue.length === 0) {
                  slots[row] = { count: remaining, type: 'more' }
                  break
                }
                slots[row] = { event: queue.shift() as T, type: 'event' }
              }
              const tabIndex = isActive ? 0 : -1

              return (
                <div
                  key={key}
                  role='gridcell'
                  aria-selected={isSelected}
                  data-day={key}
                  className={cn(
                    'relative flex min-h-12 min-w-0 flex-col items-center gap-0.5 p-1 @2xl:min-h-28 @2xl:items-stretch',
                    outside ? 'bg-muted/40' : 'bg-card',
                  )}
                >
                  <button
                    type='button'
                    data-day-button
                    tabIndex={tabIndex}
                    aria-label={[
                      dayName,
                      isToday ? 'today' : '',
                      count === 0
                        ? 'no events'
                        : `${count} ${count === 1 ? 'event' : 'events'}`,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => {
                      setCursor(day)
                      onSelectDay?.(day)
                    }}
                    className={cn(
                      'focus-visible:ring-ring/50 absolute inset-0 outline-none focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-inset',
                      outside ? 'hover:bg-muted' : 'hover:bg-muted/50',
                    )}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      'pointer-events-none relative flex size-7 shrink-0 items-center justify-center rounded-full text-sm tabular-nums @2xl:size-6 @2xl:text-xs',
                      outside && 'text-muted-foreground',
                      isToday &&
                        !isSelected &&
                        'text-primary ring-primary font-semibold ring-1',
                      isSelected && 'bg-primary text-primary-foreground font-semibold',
                    )}
                  >
                    {day.getUTCDate()}
                  </span>
                  <span
                    aria-hidden
                    className='pointer-events-none relative flex h-1.5 items-center gap-0.5 @2xl:hidden'
                  >
                    {[...covering.map((segment) => segment.event), ...timed]
                      .slice(0, 3)
                      .map((event) => (
                        <span
                          key={event.id}
                          className='size-1.5 rounded-full'
                          style={{ backgroundColor: event.color ?? 'var(--chart-2)' }}
                        />
                      ))}
                  </span>
                  {slots.length > 0 && (
                    <ul className='hidden flex-col gap-0.5 @2xl:flex'>
                      {Array.from(slots, (slot, row) => {
                        if (
                          !slot ||
                          (slot.type === 'bar' && slot.segment.start !== column)
                        ) {
                          return <li key={row} aria-hidden className='h-5' />
                        }
                        if (slot.type === 'bar') {
                          const { continuesAfter, continuesBefore, event, span, start } =
                            slot.segment
                          const covers =
                            activeColumn >= start && activeColumn < start + span
                          return (
                            <li key={row} className='relative h-5'>
                              <EventBar
                                event={event}
                                now={now}
                                timeZone={timeZone}
                                tabIndex={covers ? 0 : -1}
                                selected={event.id === selectedEventId}
                                continuesBefore={continuesBefore}
                                continuesAfter={continuesAfter}
                                onSelect={() => onSelectEvent?.(event)}
                                className='absolute inset-y-0 left-0 z-10'
                                style={{
                                  width: `calc(${span} * 100% + ${span - 1} * (0.5rem + 1px))`,
                                }}
                              />
                            </li>
                          )
                        }
                        if (slot.type === 'more') {
                          return (
                            <li key={row} className='relative'>
                              <button
                                type='button'
                                tabIndex={tabIndex}
                                aria-label={`${slot.count} more ${slot.count === 1 ? 'event' : 'events'} on ${dayName}`}
                                onClick={() => {
                                  setCursor(day)
                                  onShowMore?.(day)
                                }}
                                className={cn(
                                  'text-muted-foreground hover:bg-muted hover:text-foreground flex h-5 w-full items-center rounded-sm px-1 text-xs font-medium',
                                  eventFocus,
                                )}
                              >
                                +{slot.count} more
                              </button>
                            </li>
                          )
                        }
                        const { event } = slot
                        const ended = getEnd(event) <= now.getTime()
                        return (
                          <li key={row} className='relative'>
                            <button
                              type='button'
                              data-event-id={event.id}
                              tabIndex={tabIndex}
                              aria-label={getEventLabel(event, timeZone)}
                              aria-current={
                                event.id === selectedEventId ? 'true' : undefined
                              }
                              onClick={() => onSelectEvent?.(event)}
                              className={cn(
                                'hover:bg-muted flex h-5 w-full min-w-0 items-center gap-1 rounded-sm px-1 text-left text-xs',
                                ended && 'text-muted-foreground',
                                event.id === selectedEventId &&
                                  'bg-muted ring-primary ring-2',
                                eventFocus,
                              )}
                            >
                              <span
                                aria-hidden
                                className='size-1.5 shrink-0 rounded-full'
                                style={{
                                  backgroundColor: event.color ?? 'var(--chart-2)',
                                }}
                              />
                              <span className='text-muted-foreground shrink-0 tabular-nums'>
                                {formatShortTime(event.start, timeZone)}
                              </span>
                              <span className='truncate font-medium'>{event.title}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

interface TimeGridColumn<T extends ScheduleEvent> {
  day: Date
  events: T[]
  header: ReactNode
  key: string
  label: string
}

interface CalendarTimeGridProps<T extends ScheduleEvent = CalendarEvent> {
  /** Sets the height of the scrolling area. */
  className?: string
  /** Last hour shown, 1–24. */
  endHour?: number
  events: T[]
  /** How narrow a column gets before the grid scrolls sideways. */
  minColumnWidth?: string
  now: Date
  onSelectEvent?: (event: T) => void
  scrollToHour?: number
  selectedEventId?: string
  /** First hour shown, 0–23. */
  startHour?: number
  /** @default 'UTC' */
  timeZone?: string
}

function TimeGrid<T extends ScheduleEvent>({
  allDay,
  className,
  columns,
  endHour = 24,
  minColumnWidth = '6rem',
  now,
  onSelectEvent,
  scrollToHour = 8,
  selectedEventId,
  startHour = 0,
  timeZone = 'UTC',
}: Omit<CalendarTimeGridProps<T>, 'events'> & {
  allDay: EventSegment<T>[]
  columns: TimeGridColumn<T>[]
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const hours = endHour - startHour
  const todayKey = getDayKey(now, timeZone)
  const nowParts = getDateParts(now, timeZone)
  const nowMinutes = (nowParts.hour - startHour) * 60 + nowParts.minute
  const showNow =
    nowMinutes >= 0 &&
    nowMinutes <= hours * 60 &&
    columns.some((column) => toKey(column.day) === todayKey)
  const template = `3.5rem repeat(${columns.length}, minmax(${minColumnWidth}, 1fr))`
  const percent = (minutes: number) => `${(minutes / (hours * 60)) * 100}%`

  useEffect(() => {
    const element = scroller.current
    const content = body.current
    if (!element || !content) return
    element.scrollTop =
      (content.offsetHeight * (scrollToHour - startHour)) / hours - HOUR_LABEL_OFFSET_PX
    const today = content.querySelector<HTMLElement>('[data-today]')
    const gutter = content.firstElementChild as HTMLElement | null
    if (today && gutter) element.scrollLeft = today.offsetLeft - gutter.offsetWidth
  }, [hours, scrollToHour, startHour])

  return (
    <div
      ref={scroller}
      className={cn('relative h-[32rem] overflow-auto rounded-lg border', className)}
    >
      <div style={{ minWidth: `calc(3.5rem + ${columns.length} * ${minColumnWidth})` }}>
        <div
          className='bg-card sticky top-0 z-30 grid border-b'
          style={{ gridTemplateColumns: template }}
        >
          <div className='bg-card sticky left-0 z-10' />
          {columns.map((column) => (
            <div key={column.key} className='min-w-0 border-l px-1 py-2'>
              {column.header}
            </div>
          ))}
          {allDay.length > 0 && (
            <>
              <div
                aria-hidden
                className='bg-card text-muted-foreground sticky left-0 z-10 border-t py-1.5 pr-2 text-right text-[10px]'
              >
                All day
              </div>
              <ul
                aria-label='All-day events'
                className='grid gap-y-0.5 border-t py-1'
                style={{
                  gridColumn: `span ${columns.length}`,
                  gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                }}
              >
                {allDay.map(
                  ({ continuesAfter, continuesBefore, event, lane, span, start }) => (
                    <li
                      key={event.id}
                      className={cn(
                        'min-w-0',
                        !continuesBefore && 'pl-0.5',
                        !continuesAfter && 'pr-0.5',
                      )}
                      style={{
                        gridColumn: `${start + 1} / span ${span}`,
                        gridRow: lane + 1,
                      }}
                    >
                      <EventBar
                        event={event}
                        now={now}
                        timeZone={timeZone}
                        selected={event.id === selectedEventId}
                        continuesBefore={continuesBefore}
                        continuesAfter={continuesAfter}
                        onSelect={() => onSelectEvent?.(event)}
                        stickyTitle
                      />
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
        </div>
        <div
          ref={body}
          className='relative grid'
          style={{ gridTemplateColumns: template, height: `${hours * 3}rem` }}
        >
          <div aria-hidden className='bg-card sticky left-0 z-20'>
            {Array.from({ length: hours - 1 }, (_, index) => {
              const hour = startHour + index + 1
              return (
                <span
                  key={hour}
                  className='text-muted-foreground absolute right-2 -translate-y-1/2 text-[10px] whitespace-nowrap tabular-nums'
                  style={{ top: percent((index + 1) * 60) }}
                >
                  {hour % 12 || 12} {hour < 12 || hour === 24 ? 'AM' : 'PM'}
                </span>
              )
            })}
            {showNow && (
              <span
                className='absolute right-1 z-10 -translate-y-1/2 rounded-sm bg-red-600 px-1 text-[10px] font-medium text-white tabular-nums'
                style={{ top: percent(nowMinutes) }}
              >
                {formatTime(now, timeZone).replace(' ', ' ')}
              </span>
            )}
          </div>
          {columns.map((column) => {
            const isToday = toKey(column.day) === todayKey
            return (
              <div
                key={column.key}
                role='group'
                aria-label={column.label}
                data-today={isToday || undefined}
                className='relative min-w-0 border-l'
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
                  backgroundSize: `100% ${100 / hours}%`,
                }}
              >
                {column.events.length > 0 && (
                  <ul>
                    {layoutEvents(column.events).map(({ event, lane, lanes, span }) => {
                      const { hour, minute } = getDateParts(event.start, timeZone)
                      const top = Math.max(0, (hour - startHour) * 60 + minute)
                      const minutes = (getEnd(event) - event.start.getTime()) / 60_000
                      const bottom = Math.min(
                        hours * 60,
                        (hour - startHour) * 60 + minute + minutes,
                      )
                      if (bottom <= 0 || top >= hours * 60) return null
                      const ended = getEnd(event) <= now.getTime()
                      const selected = event.id === selectedEventId
                      const short = minutes < 45
                      return (
                        <li
                          key={event.id}
                          className='absolute z-[2] px-px'
                          style={{
                            height: `max(1.5rem, ${percent(bottom - top)})`,
                            left: `${(lane / lanes) * 100}%`,
                            top: percent(top),
                            width: `${(span / lanes) * 100}%`,
                          }}
                        >
                          <button
                            type='button'
                            data-event-id={event.id}
                            aria-label={getEventLabel(event, timeZone)}
                            aria-current={selected ? 'true' : undefined}
                            onClick={() => onSelectEvent?.(event)}
                            className={cn(
                              'ring-card flex size-full min-w-0 overflow-hidden rounded-sm px-1.5 py-0.5 text-left text-xs leading-4 ring-1',
                              short ? 'items-center gap-1' : 'flex-col',
                              ended && 'text-muted-foreground',
                              selected && 'ring-primary relative z-10 ring-2',
                              eventFocus,
                            )}
                            style={eventStyle(event, ended ? 14 : 28)}
                          >
                            <span className='truncate font-medium'>{event.title}</span>
                            <span
                              className={cn(
                                'truncate tabular-nums',
                                ended ? 'text-muted-foreground' : 'text-foreground/70',
                              )}
                            >
                              {short
                                ? formatShortTime(event.start, timeZone)
                                : formatTimeRange(event.start, event.end, timeZone)}
                            </span>
                            {!short && minutes >= 90 && event.location && (
                              <span
                                className={cn(
                                  'truncate',
                                  ended ? 'text-muted-foreground' : 'text-foreground/70',
                                )}
                              >
                                {event.location}
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
                {isToday && showNow && (
                  <div
                    aria-hidden
                    className='pointer-events-none absolute inset-x-0 z-10 h-0.5 -translate-y-1/2 bg-red-600'
                    style={{ top: percent(nowMinutes) }}
                  >
                    <span className='absolute top-1/2 -left-1 size-2 -translate-y-1/2 rounded-full bg-red-600' />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface CalendarWeekViewProps<
  T extends ScheduleEvent = CalendarEvent,
> extends CalendarTimeGridProps<T> {
  /** Consecutive plain days, such as `getWeekDays(day)`. */
  days: Date[]
}

function CalendarWeekView<T extends ScheduleEvent = CalendarEvent>({
  days,
  events,
  ...props
}: CalendarWeekViewProps<T>) {
  const { now, timeZone = 'UTC' } = props
  const todayKey = getDayKey(now, timeZone)
  const timed = events.filter((event) => !spansDays(event, timeZone))
  const columns = days.map((day) => {
    const key = toKey(day)
    const isToday = key === todayKey
    const name = formatDay(day, { day: 'numeric', month: 'long', weekday: 'long' })
    return {
      day,
      events: timed.filter((event) => getDayKey(event.start, timeZone) === key),
      header: (
        <div className='flex flex-col items-center gap-0.5'>
          <span aria-hidden className='text-muted-foreground text-xs'>
            {formatDay(day, { weekday: 'short' })}
          </span>
          <span
            aria-hidden
            className={cn(
              'flex size-7 items-center justify-center rounded-full text-sm font-medium tabular-nums',
              isToday && 'bg-primary text-primary-foreground',
            )}
          >
            {day.getUTCDate()}
          </span>
          <span className='sr-only'>
            {name}
            {isToday && ', today'}
          </span>
        </div>
      ),
      key,
      label: isToday ? `${name}, today` : name,
    }
  })
  const allDay = layoutSegments(
    events.filter((event) => spansDays(event, timeZone)),
    days,
    timeZone,
  )
  return <TimeGrid allDay={allDay} columns={columns} {...props} />
}

interface CalendarResource {
  description?: ReactNode
  id: string
  name: string
}

interface CalendarResourceViewProps<
  T extends CalendarEvent = CalendarEvent,
> extends CalendarTimeGridProps<T> {
  /** The plain day shown. */
  day: Date
  resources: CalendarResource[]
}

function CalendarResourceView<T extends CalendarEvent = CalendarEvent>({
  day,
  events,
  resources,
  ...props
}: CalendarResourceViewProps<T>) {
  const { timeZone = 'UTC' } = props
  const dayEvents = getEventsForDay(events, day, timeZone)
  const allDay: EventSegment<T>[] = []
  const columns = resources.map((resource, index) => {
    const own = dayEvents.filter((event) => event.resource === resource.id)
    own
      .filter((event) => spansDays(event, timeZone))
      .forEach((event, lane) => {
        allDay.push({
          continuesAfter: false,
          continuesBefore: false,
          event,
          lane,
          span: 1,
          start: index,
        })
      })
    return {
      day,
      events: own.filter((event) => !spansDays(event, timeZone)),
      header: (
        <div className='flex min-w-0 flex-col px-1'>
          <span className='truncate text-sm font-medium'>{resource.name}</span>
          {resource.description && (
            <div className='text-muted-foreground truncate text-xs'>
              {resource.description}
            </div>
          )}
        </div>
      ),
      key: resource.id,
      label: resource.name,
    }
  })
  return <TimeGrid allDay={allDay} columns={columns} {...props} />
}

interface CalendarEventListProps<T extends ScheduleEvent = CalendarEvent> {
  className?: string
  emptyLabel?: string
  /** In order, such as from `getEventsForDay`. */
  events: T[]
  now?: Date
  onSelectEvent: (event: T) => void
  selectedEventId?: string
  /** @default 'UTC' */
  timeZone?: string
}

function CalendarEventList<T extends ScheduleEvent = CalendarEvent>({
  className,
  emptyLabel = 'Nothing scheduled.',
  events,
  now,
  onSelectEvent,
  selectedEventId,
  timeZone = 'UTC',
}: CalendarEventListProps<T>) {
  if (events.length === 0) {
    return <p className={cn('text-muted-foreground text-sm', className)}>{emptyLabel}</p>
  }
  return (
    <ul className={cn('flex flex-col', className)}>
      {events.map((event) => {
        const ended = now !== undefined && getEnd(event) <= now.getTime()
        const selected = event.id === selectedEventId
        const meta = [event.calendar, event.location].filter(Boolean).join(' · ')
        return (
          <li key={event.id}>
            <button
              type='button'
              data-event-id={event.id}
              aria-current={selected ? 'true' : undefined}
              onClick={() => onSelectEvent(event)}
              className={cn(
                'hover:bg-muted flex w-full items-stretch gap-3 rounded-md px-2 py-1.5 text-left text-sm',
                selected && 'bg-muted',
                eventFocus,
              )}
            >
              <span className='text-muted-foreground w-16 shrink-0 pt-px text-xs whitespace-nowrap tabular-nums'>
                {spansDays(event, timeZone)
                  ? 'All day'
                  : formatTime(event.start, timeZone)}
              </span>
              <span
                aria-hidden
                className={cn('w-1 shrink-0 rounded-full', ended && 'opacity-40')}
                style={{ backgroundColor: event.color ?? 'var(--chart-2)' }}
              />
              <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className={cn('font-medium', ended && 'text-muted-foreground')}>
                  {event.title}
                </span>
                {meta && (
                  <span className='text-muted-foreground truncate text-xs'>{meta}</span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

interface CalendarEventDetailsProps {
  actions?: ReactNode
  className?: string
  event: CalendarEvent
  /** Adds a close button. */
  onClose?: () => void
  /** @default 'UTC' */
  timeZone?: string
}

function CalendarEventDetails({
  actions,
  className,
  event,
  onClose,
  timeZone = 'UTC',
}: CalendarEventDetailsProps) {
  const id = useId()
  const color = event.color ?? 'var(--chart-2)'
  return (
    <section
      aria-labelledby={id}
      className={cn('flex flex-col gap-4 text-sm', className)}
    >
      <div className='flex items-start gap-3'>
        <span
          aria-hidden
          className='mt-1.5 size-3 shrink-0 rounded-sm'
          style={{ backgroundColor: color }}
        />
        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <h3 id={id} className='text-base leading-snug font-semibold break-words'>
            {event.title}
          </h3>
          {getEventWhen(event, timeZone, 'long').map((line) => (
            <p key={line} className='text-muted-foreground'>
              {line}
            </p>
          ))}
        </div>
        {onClose && (
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label='Close details'
            onClick={onClose}
            className='-mt-1 -mr-1'
          >
            <IconPlaceholder
              lucide='XIcon'
              tabler='IconX'
              hugeicons='Cancel01Icon'
              phosphor='XIcon'
              remixicon='RiCloseLine'
            />
          </Button>
        )}
      </div>
      <dl className='text-muted-foreground flex flex-col gap-2.5 [&_svg]:size-4 [&_svg]:shrink-0'>
        {event.calendar && (
          <div className='flex items-center gap-3'>
            <dt className='flex'>
              <IconPlaceholder
                lucide='CalendarIcon'
                tabler='IconCalendar'
                hugeicons='CalendarIcon'
                phosphor='CalendarBlankIcon'
                remixicon='RiCalendarLine'
                aria-hidden
              />
              <span className='sr-only'>Calendar</span>
            </dt>
            <dd className='text-foreground'>{event.calendar}</dd>
          </div>
        )}
        {event.location && (
          <div className='flex items-center gap-3'>
            <dt className='flex'>
              <IconPlaceholder
                lucide='MapPinIcon'
                tabler='IconMapPin'
                hugeicons='Location01Icon'
                phosphor='MapPinIcon'
                remixicon='RiMapPinLine'
                aria-hidden
              />
              <span className='sr-only'>Location</span>
            </dt>
            <dd className='text-foreground min-w-0 break-words'>{event.location}</dd>
          </div>
        )}
        {event.attendees && event.attendees.length > 0 && (
          <div className='flex items-start gap-3'>
            <dt className='flex pt-1'>
              <IconPlaceholder
                lucide='UsersIcon'
                tabler='IconUsers'
                hugeicons='UserGroupIcon'
                phosphor='UsersIcon'
                remixicon='RiTeamLine'
                aria-hidden
              />
              <span className='sr-only'>Attendees</span>
            </dt>
            <dd className='min-w-0 flex-1'>
              <ul className='flex flex-col gap-1.5'>
                {event.attendees.map((person) => (
                  <li
                    key={person.name}
                    className='text-foreground flex items-center gap-2'
                  >
                    <PersonAvatar person={person} size='sm' />
                    <span className='truncate'>{person.name}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      {event.description && (
        <p className='text-muted-foreground leading-relaxed'>{event.description}</p>
      )}
      {actions && <div className='flex flex-wrap gap-2'>{actions}</div>}
    </section>
  )
}

interface CalendarLegendProps {
  calendars: { color: string; name: string }[]
  className?: string
  hidden?: string[]
  label?: string
  /** Makes each calendar a toggle that shows or hides its events. */
  onToggle?: (name: string) => void
}

function CalendarLegend({
  calendars,
  className,
  hidden = [],
  label = 'Calendars',
  onToggle,
}: CalendarLegendProps) {
  return (
    <ul
      aria-label={label}
      className={cn('flex flex-wrap gap-x-4 gap-y-1 text-xs', className)}
    >
      {calendars.map((calendar) => {
        const shown = !hidden.includes(calendar.name)
        if (!onToggle) {
          return (
            <li
              key={calendar.name}
              className='text-muted-foreground flex items-center gap-1.5'
            >
              <span
                aria-hidden
                className='size-2 shrink-0 rounded-full'
                style={{ backgroundColor: calendar.color }}
              />
              {calendar.name}
            </li>
          )
        }
        return (
          <li key={calendar.name}>
            <button
              type='button'
              aria-pressed={shown}
              onClick={() => onToggle(calendar.name)}
              className='hover:bg-muted focus-visible:ring-ring/50 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-[3px]'
            >
              <span
                aria-hidden
                className='text-background flex size-4 shrink-0 items-center justify-center rounded-[4px] border-2 [&_svg]:size-3'
                style={{
                  backgroundColor: shown ? calendar.color : 'transparent',
                  borderColor: calendar.color,
                }}
              >
                {shown && (
                  <IconPlaceholder
                    lucide='CheckIcon'
                    tabler='IconCheck'
                    hugeicons='Tick02Icon'
                    phosphor='CheckIcon'
                    remixicon='RiCheckLine'
                  />
                )}
              </span>
              <span className={cn('truncate', !shown && 'text-muted-foreground')}>
                {calendar.name}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export {
  CalendarEventDetails,
  CalendarEventList,
  CalendarLegend,
  CalendarMonthView,
  CalendarResourceView,
  CalendarToolbar,
  CalendarWeekView,
  formatDayRange,
  formatEventDate,
  getEventDays,
  getEventLabel,
  getEventsForDay,
  getWeekDays,
  layoutEvents,
  layoutSegments,
  spansDays,
  startOfMonth,
}

export type {
  CalendarEvent,
  CalendarEventDetailsProps,
  CalendarEventListProps,
  CalendarLegendProps,
  CalendarMonthViewProps,
  CalendarResource,
  CalendarResourceViewProps,
  CalendarTimeGridProps,
  CalendarToolbarProps,
  CalendarWeekViewProps,
  EventLayout,
  EventSegment,
}
