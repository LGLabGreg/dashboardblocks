'use client'

import {
  EventSwatch,
  type ScheduleEvent,
  addDays,
  formatDay,
  formatDuration,
  formatTimeRange,
  getDateParts,
  getDay,
  getDayKey,
} from '@/registry/components/dashboardblocks/schedule'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Schedule4Props {
  /** Calendars to explain in the legend. */
  calendars: { color: string; name: string }[]
  /** Last hour on the axis, 1–24. @default 18 */
  endHour?: number
  events: ScheduleEvent[]
  /** The first day shown, and where the now line is drawn. */
  now: Date
  /** First hour on the axis, 0–23. @default 8 */
  startHour?: number
  /** @default 'UTC' */
  timeZone?: string
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const at = (day: number, hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, 28 + day, hour, minute))

const CALENDARS = {
  customers: { calendar: 'Customers', color: 'var(--chart-2)' },
  focus: { calendar: 'Focus', color: 'var(--chart-4)' },
  product: { calendar: 'Product', color: 'var(--chart-1)' },
  team: { calendar: 'Team', color: 'var(--chart-3)' },
}

const exampleProps: Schedule4Props = {
  calendars: Object.values(CALENDARS).map(({ calendar, color }) => ({
    color,
    name: calendar,
  })),
  events: [
    { ...CALENDARS.team, end: at(0, 9, 15), id: 'w1', start: at(0, 9), title: 'Standup' },
    {
      ...CALENDARS.product,
      end: at(0, 10, 30),
      id: 'w2',
      start: at(0, 9, 30),
      title: 'Roadmap review',
    },
    {
      ...CALENDARS.customers,
      end: at(0, 14, 45),
      id: 'w3',
      start: at(0, 14),
      title: 'Northwind onboarding',
    },
    {
      ...CALENDARS.focus,
      end: at(0, 17),
      id: 'w4',
      start: at(0, 15),
      title: 'Focus time',
    },
    { ...CALENDARS.team, end: at(1, 9, 15), id: 'w5', start: at(1, 9), title: 'Standup' },
    {
      ...CALENDARS.team,
      end: at(1, 13),
      id: 'w6',
      start: at(1, 12),
      title: 'Team lunch',
    },
    {
      ...CALENDARS.customers,
      end: at(1, 16, 30),
      id: 'w7',
      start: at(1, 15, 30),
      title: 'Acme QBR',
    },
    { ...CALENDARS.team, end: at(2, 9, 15), id: 'w8', start: at(2, 9), title: 'Standup' },
    {
      ...CALENDARS.product,
      end: at(2, 11),
      id: 'w9',
      start: at(2, 10),
      title: 'Design critique',
    },
    {
      ...CALENDARS.customers,
      end: at(2, 11, 30),
      id: 'w10',
      start: at(2, 10, 30),
      title: 'Initech demo',
    },
    {
      ...CALENDARS.product,
      end: at(2, 16),
      id: 'w11',
      start: at(2, 13),
      title: 'v4.2 release window',
    },
    {
      ...CALENDARS.team,
      end: at(3, 9, 15),
      id: 'w12',
      start: at(3, 9),
      title: 'Standup',
    },
    {
      ...CALENDARS.focus,
      end: at(3, 12),
      id: 'w13',
      start: at(3, 9, 30),
      title: 'Focus time',
    },
    {
      ...CALENDARS.team,
      end: at(4, 9, 15),
      id: 'w14',
      start: at(4, 9),
      title: 'Standup',
    },
    {
      ...CALENDARS.team,
      end: at(4, 17),
      id: 'w15',
      start: at(4, 16),
      title: 'Sprint retro',
    },
  ],
  now: new Date(NOW),
  title: 'Week ahead',
}

/** Events that overlap go on separate lanes, first fit. */
function assignLanes(events: ScheduleEvent[]) {
  const laneEnds: number[] = []
  return events.map((event) => {
    const start = event.start.getTime()
    const end = (event.end ?? event.start).getTime()
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = end
    return { event, lane }
  })
}

/** Minutes booked, counting overlapping events once. */
function getBookedMinutes(events: ScheduleEvent[]) {
  let total = 0
  let until = -Infinity
  for (const event of events) {
    const start = Math.max(event.start.getTime(), until)
    const end = (event.end ?? event.start).getTime()
    if (end > start) total += (end - start) / 60_000
    until = Math.max(until, end)
  }
  return total
}

const formatHour = (hour: number) =>
  `${hour % 12 || 12}${hour < 12 || hour === 24 ? 'a' : 'p'}`

const Schedule4 = (props: Schedule4Props) => {
  const {
    calendars,
    endHour = 18,
    events,
    now,
    startHour = 8,
    timeZone = 'UTC',
    title,
  } = props
  const today = getDay(now, timeZone)
  const range = (endHour - startHour) * 60
  const ticks = Array.from(
    { length: Math.floor((endHour - startHour) / 2) + 1 },
    (_, index) => startHour + index * 2,
  )
  const position = (date: Date) => {
    const { hour, minute } = getDateParts(date, timeZone)
    const minutes = hour * 60 + minute - startHour * 60
    return Math.min(1, Math.max(0, minutes / range)) * 100
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(today, index)
    const key = day.toISOString().slice(0, 10)
    const dayEvents = events
      .filter((event) => getDayKey(event.start, timeZone) === key)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
    const timed = dayEvents.filter((event) => !event.allDay)
    return {
      allDay: dayEvents.filter((event) => event.allDay),
      booked: getBookedMinutes(timed),
      day,
      key,
      lanes: assignLanes(timed),
    }
  })
  const totalEvents = days.reduce(
    (sum, day) => sum + day.lanes.length + day.allDay.length,
    0,
  )
  const totalBooked = days.reduce((sum, day) => sum + day.booked, 0)
  const nowPosition = position(now)
  const booked = (minutes: number) =>
    minutes === 0 ? 'Free' : formatDuration(new Date(0), new Date(minutes * 60_000))

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {formatDay(today, { day: 'numeric', month: 'short' })}–
          {formatDay(addDays(today, 6), { day: 'numeric', month: 'short' })} ·{' '}
          {totalEvents} events · {booked(totalBooked)} booked
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div
          aria-hidden
          className='text-muted-foreground grid grid-cols-1 text-[10px] tabular-nums @lg:grid-cols-[5rem_minmax(0,1fr)_9rem] @lg:gap-x-3'
        >
          <div className='relative h-4 @lg:col-start-2'>
            {ticks.map((hour) => (
              <span
                key={hour}
                className={cn(
                  'absolute -translate-x-1/2',
                  hour === startHour && 'translate-x-0',
                  hour === endHour && '-translate-x-full',
                )}
                style={{ left: `${(((hour - startHour) * 60) / range) * 100}%` }}
              >
                {formatHour(hour)}
              </span>
            ))}
          </div>
        </div>
        <ol className='flex flex-col gap-3 @lg:gap-2'>
          {days.map(({ allDay, booked: minutes, day, key, lanes }, index) => {
            const laneCount = Math.max(1, ...lanes.map(({ lane }) => lane + 1))
            const count = lanes.length + allDay.length
            return (
              <li
                key={key}
                className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 @lg:grid-cols-[5rem_minmax(0,1fr)_9rem]'
              >
                <h3 className='min-w-0 text-xs'>
                  <span
                    aria-hidden
                    className={cn('font-medium', index === 0 && 'font-semibold')}
                  >
                    {index === 0
                      ? 'Today'
                      : `${formatDay(day, { weekday: 'short' })} ${day.getUTCDate()}`}
                  </span>
                  <span className='sr-only'>
                    {index === 0 && 'Today, '}
                    {formatDay(day, { day: 'numeric', month: 'long', weekday: 'long' })}
                  </span>
                  {allDay.map((event) => (
                    <span key={event.id} className='text-muted-foreground block truncate'>
                      {event.title} (all day)
                    </span>
                  ))}
                </h3>
                <p className='text-muted-foreground text-right text-xs whitespace-nowrap tabular-nums @lg:order-last'>
                  {count === 0
                    ? 'No events'
                    : `${count} ${count === 1 ? 'event' : 'events'}`}
                  {count > 0 && (
                    <span className='hidden @lg:inline'> · {booked(minutes)}</span>
                  )}
                </p>
                <div
                  className='bg-muted/50 relative col-span-2 rounded-md @lg:col-span-1'
                  style={{ height: `calc(${laneCount} * 1.5rem + 0.5rem)` }}
                >
                  {ticks.slice(1, -1).map((hour) => (
                    <span
                      key={hour}
                      aria-hidden
                      className='bg-border absolute inset-y-0 w-px'
                      style={{ left: `${(((hour - startHour) * 60) / range) * 100}%` }}
                    />
                  ))}
                  <ul>
                    {lanes.map(({ event, lane }) => {
                      const left = Math.min(98, position(event.start))
                      const width = Math.max(2, position(event.end ?? event.start) - left)
                      const ended = (event.end ?? event.start) <= now
                      const minutes =
                        ((event.end ?? event.start).getTime() - event.start.getTime()) /
                        60_000
                      return (
                        <li
                          key={event.id}
                          title={`${event.title} · ${formatTimeRange(event.start, event.end, timeZone)}${event.calendar ? ` · ${event.calendar}` : ''}`}
                          className={cn(
                            'absolute flex h-5 items-center overflow-hidden rounded-sm border-l-2 px-1 text-[11px] leading-none font-medium',
                            ended && 'text-muted-foreground opacity-60',
                          )}
                          style={{
                            backgroundColor: `color-mix(in oklab, ${event.color ?? 'var(--chart-1)'} 22%, var(--card))`,
                            borderColor: event.color ?? 'var(--chart-1)',
                            left: `${left}%`,
                            top: `calc(${lane} * 1.5rem + 0.25rem)`,
                            width: `${width}%`,
                          }}
                        >
                          <span className='sr-only'>
                            {formatTimeRange(event.start, event.end, timeZone)}
                            {event.calendar && `, ${event.calendar}`}
                            {ended && ', ended'}:{' '}
                          </span>
                          <span
                            className={cn(
                              'truncate',
                              minutes < 60 && 'sr-only',
                              minutes < 120 && '@max-md:sr-only',
                            )}
                          >
                            {event.title}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  {index === 0 && nowPosition > 0 && nowPosition < 100 && (
                    <span
                      aria-hidden
                      className='bg-foreground ring-card absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full ring-2'
                      style={{ left: `${nowPosition}%` }}
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ol>
        <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs'>
          {calendars.map((calendar) => (
            <li key={calendar.name} className='flex items-center gap-1.5'>
              <EventSwatch color={calendar.color} />
              {calendar.name}
            </li>
          ))}
          <li aria-hidden className='flex items-center gap-1.5'>
            <span className='bg-foreground h-3 w-0.5 rounded-full' />
            Now
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

export { Schedule4, exampleProps as schedule4ExampleProps, type Schedule4Props }
