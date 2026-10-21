'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type CalendarEvent,
  CalendarEventDetails,
  CalendarLegend,
  type CalendarResource,
  CalendarResourceView,
  CalendarToolbar,
  getEventsForDay,
} from '@/registry/components/dashboardblocks/calendar'
import {
  addDays,
  formatTime,
  getDay,
} from '@/registry/components/dashboardblocks/schedule'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { formatDate } from '@/registry/lib/dashboardblocks/format'
import { useRef, useState } from 'react'

interface Room {
  id: string
  name: string
  seats: number
}

interface Calendar4Props {
  /** Leave out, or pass none, to show the empty state. */
  bookings?: CalendarEvent[]
  endHour?: number
  now: Date
  onSelectBooking?: (booking: CalendarEvent) => void
  rooms: Room[]
  startHour?: number
  status?: BlockStatus
  teams: { color: string; name: string }[]
  /** @default 'UTC' */
  timeZone?: string
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const at = (day: number, hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, day, hour, minute))

const TEAMS = {
  design: { calendar: 'Design', color: 'var(--color-chart-4)' },
  engineering: { calendar: 'Engineering', color: 'var(--color-chart-2)' },
  leadership: { calendar: 'Leadership', color: 'var(--color-chart-1)' },
  people: { calendar: 'People', color: 'var(--color-chart-5)' },
  sales: { calendar: 'Sales', color: 'var(--color-chart-3)' },
}

const exampleProps: Calendar4Props = {
  bookings: [
    {
      ...TEAMS.engineering,
      attendees: [
        { name: 'Maya Lindqvist' },
        { name: 'Tomás Herrera' },
        { name: 'Jonah Adeyemi' },
      ],
      description: 'Sprint 42 planning. Estimates are in the board, bring questions.',
      end: at(28, 10, 30),
      id: 'b1',
      resource: 'atlas',
      start: at(28, 9),
      title: 'Sprint planning',
    },
    {
      ...TEAMS.people,
      attendees: [{ name: 'Grace Liu' }, { name: 'Jonas Weber' }],
      end: at(28, 11, 30),
      id: 'b2',
      resource: 'lisbon',
      start: at(28, 10, 30),
      title: 'Interview: Jonas Weber',
    },
    {
      ...TEAMS.sales,
      attendees: [{ name: 'Priya Raman' }, { name: 'Marcus Reid' }],
      description: 'On-site demo for Acme’s finance team. Guests sign in at reception.',
      end: at(28, 12),
      id: 'b3',
      resource: 'boardroom',
      start: at(28, 11),
      title: 'Acme demo',
    },
    {
      ...TEAMS.design,
      attendees: [{ name: 'Ana Sousa' }, { name: 'Leo Park' }],
      end: at(28, 12),
      id: 'b4',
      resource: 'studio',
      start: at(28, 8, 30),
      title: 'Usability sessions',
    },
    {
      ...TEAMS.leadership,
      attendees: [{ name: 'Elena Novak' }, { name: 'David Kim' }],
      end: at(28, 9, 30),
      id: 'b5',
      resource: 'boardroom',
      start: at(28, 8),
      title: 'Exec breakfast',
    },
    {
      ...TEAMS.engineering,
      end: at(28, 13),
      id: 'b6',
      resource: 'pod',
      start: at(28, 10),
      title: 'Incident review write-up',
    },
    {
      ...TEAMS.sales,
      end: at(28, 14, 45),
      id: 'b7',
      resource: 'lisbon',
      start: at(28, 14),
      title: 'Northwind onboarding',
    },
    {
      ...TEAMS.leadership,
      attendees: [
        { name: 'Elena Novak' },
        { name: 'David Kim' },
        { name: 'Priya Raman' },
      ],
      description: 'Prep for the October board meeting: Q3 numbers and the 2027 plan.',
      end: at(28, 16),
      id: 'b8',
      resource: 'boardroom',
      start: at(28, 14),
      title: 'Board prep',
    },
    {
      ...TEAMS.design,
      end: at(28, 15),
      id: 'b9',
      resource: 'atlas',
      start: at(28, 13, 30),
      title: 'Design review',
    },
    {
      ...TEAMS.people,
      end: at(28, 17),
      id: 'b10',
      resource: 'atlas',
      start: at(28, 16),
      title: 'Hiring panel debrief',
    },
    {
      ...TEAMS.engineering,
      end: at(28, 17, 30),
      id: 'b11',
      resource: 'studio',
      start: at(28, 16, 30),
      title: 'Podcast: SaaS Weekly',
    },
    {
      ...TEAMS.people,
      allDay: true,
      id: 'b12',
      resource: 'pod',
      start: at(29, 0),
      title: 'Closed for cleaning',
    },
    {
      ...TEAMS.engineering,
      end: at(29, 11),
      id: 'b13',
      resource: 'atlas',
      start: at(29, 10),
      title: 'Architecture review',
    },
    {
      ...TEAMS.sales,
      end: at(29, 16, 30),
      id: 'b14',
      resource: 'boardroom',
      start: at(29, 15, 30),
      title: 'Acme QBR',
    },
    {
      ...TEAMS.people,
      end: at(29, 13),
      id: 'b15',
      resource: 'lisbon',
      start: at(29, 12),
      title: 'Benefits Q&A',
    },
  ],
  now: new Date(NOW),
  rooms: [
    { id: 'atlas', name: 'Atlas', seats: 8 },
    { id: 'boardroom', name: 'Boardroom', seats: 14 },
    { id: 'lisbon', name: 'Lisbon', seats: 4 },
    { id: 'studio', name: 'Studio', seats: 6 },
    { id: 'pod', name: 'Focus pod', seats: 2 },
  ],
  teams: Object.values(TEAMS).map(({ calendar, color }) => ({
    color,
    name: calendar,
  })),
}

function getRoomStatus(bookings: CalendarEvent[], now: Date, timeZone: string) {
  if (bookings.some((booking) => booking.allDay))
    return { busy: true, label: 'Closed today', tone: 'neutral' as const }
  const times = bookings
    .map((booking) => ({ end: booking.end ?? booking.start, start: booking.start }))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  const current = times.find(({ end, start }) => start <= now && now < end)
  if (current) {
    let until = current.end
    for (const { end, start } of times) {
      if (start <= until && end > until) until = end
    }
    return {
      busy: true,
      label: `In use until ${formatTime(until, timeZone)}`,
      tone: 'warning' as const,
    }
  }
  const next = times.find(({ start }) => start > now)
  return {
    busy: false,
    label: next
      ? `Free until ${formatTime(next.start, timeZone)}`
      : 'Free for the rest of today',
    tone: 'good' as const,
  }
}

const Calendar4 = (props: Calendar4Props) => {
  const {
    bookings: data = [],
    endHour = 19,
    now,
    onSelectBooking,
    rooms,
    startHour = 7,
    status: blockStatus,
    teams,
    timeZone = 'UTC',
  } = props
  const state = getBlockState(blockStatus, data)
  const bookings = state ? [] : data
  const today = getDay(now, timeZone)
  const [day, setDay] = useState(today)
  const [selectedId, setSelectedId] = useState<string>()
  const container = useRef<HTMLDivElement>(null)

  const isToday = day.getTime() === today.getTime()
  const dayBookings = getEventsForDay(bookings, day, timeZone)
  const selected = dayBookings.find((booking) => booking.id === selectedId)
  let freeNow = 0
  const resources: CalendarResource[] = rooms.map((room) => {
    const status =
      isToday && !state
        ? getRoomStatus(
            dayBookings.filter((booking) => booking.resource === room.id),
            now,
            timeZone,
          )
        : undefined
    if (status && !status.busy) freeNow++
    return {
      description: (
        <>
          <span className='block truncate'>{room.seats} seats</span>
          {status && (
            <StatusLabel
              variant='text'
              tone={status.tone}
              className='block truncate text-xs'
            >
              {status.label}
            </StatusLabel>
          )}
        </>
      ),
      id: room.id,
      name: room.name,
    }
  })

  const showDay = (next: Date) => {
    setDay(next)
    setSelectedId(undefined)
  }

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4 [--calendar-surface:var(--color-background)]'>
        <CalendarToolbar
          title={formatDate(day, 'weekday-long-day')}
          description={
            state ? (
              <BlockStateText />
            ) : (
              `${dayBookings.length} ${dayBookings.length === 1 ? 'booking' : 'bookings'} across ${rooms.length} rooms.${isToday ? ` ${freeNow} ${freeNow === 1 ? 'room is' : 'rooms are'} free right now.` : ''}`
            )
          }
          onToday={() => showDay(today)}
          onPrevious={() => showDay(addDays(day, -1))}
          onNext={() => showDay(addDays(day, 1))}
          previousLabel='Previous day'
          nextLabel='Next day'
        />
        <div ref={container} className='flex flex-col gap-4'>
          <CalendarResourceView
            day={day}
            resources={resources}
            events={dayBookings}
            now={now}
            startHour={startHour}
            endHour={endHour}
            onSelectEvent={(booking) => {
              setSelectedId(booking.id)
              onSelectBooking?.(booking)
            }}
            selectedEventId={selectedId}
            timeZone={timeZone}
            minColumnWidth='9.5rem'
            className='h-[28rem]'
          />
          {selected ? (
            <CalendarEventDetails
              event={{
                ...selected,
                location: rooms.find((room) => room.id === selected.resource)?.name,
              }}
              timeZone={timeZone}
              onClose={() => {
                container.current
                  ?.querySelector<HTMLElement>(`[data-event-id="${selected.id}"]`)
                  ?.focus()
                setSelectedId(undefined)
              }}
              className='border-t pt-4'
            />
          ) : (
            !state && (
              <p className='text-muted-foreground text-sm'>
                Select a booking to see who booked it.
              </p>
            )
          )}
        </div>
        {!state && <CalendarLegend calendars={teams} label='Teams' />}
      </section>
    </BlockStateProvider>
  )
}

export { Calendar4, exampleProps as calendar4ExampleProps, type Calendar4Props }
