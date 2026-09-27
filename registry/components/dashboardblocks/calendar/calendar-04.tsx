'use client'

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
  formatDay,
  formatTime,
  getDay,
} from '@/registry/components/dashboardblocks/schedule'
import { useRef, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Room {
  id: string
  name: string
  seats: number
}

interface Calendar4Props {
  /** Bookings, each naming its room in `resource`. */
  bookings: CalendarEvent[]
  /** Last hour shown. @default 19 */
  endHour?: number
  /** Marks today, draws the current time and says which rooms are free. */
  now: Date
  onSelectBooking?: (booking: CalendarEvent) => void
  rooms: Room[]
  /** First hour shown. @default 7 */
  startHour?: number
  /** Teams to explain in the legend. */
  teams: { color: string; name: string }[]
  /** @default 'UTC' */
  timeZone?: string
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const at = (day: number, hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, day, hour, minute))

const TEAMS = {
  design: { calendar: 'Design', color: 'var(--chart-3)' },
  engineering: { calendar: 'Engineering', color: 'var(--chart-1)' },
  leadership: { calendar: 'Leadership', color: 'var(--chart-5)' },
  people: { calendar: 'People', color: 'var(--chart-4)' },
  sales: { calendar: 'Sales', color: 'var(--chart-2)' },
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

/** Whether a room is in use at `now` and until when, or free and until when. */
function getRoomStatus(bookings: CalendarEvent[], now: Date, timeZone: string) {
  if (bookings.some((booking) => booking.allDay))
    return { busy: true, label: 'Closed today' }
  const times = bookings
    .map((booking) => ({ end: booking.end ?? booking.start, start: booking.start }))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  const current = times.find(({ end, start }) => start <= now && now < end)
  if (current) {
    // Back-to-back bookings keep the room in use.
    let until = current.end
    for (const { end, start } of times) {
      if (start <= until && end > until) until = end
    }
    return { busy: true, label: `In use until ${formatTime(until, timeZone)}` }
  }
  const next = times.find(({ start }) => start > now)
  return {
    busy: false,
    label: next
      ? `Free until ${formatTime(next.start, timeZone)}`
      : 'Free for the rest of today',
  }
}

const Calendar4 = (props: Calendar4Props) => {
  const {
    bookings,
    endHour = 19,
    now,
    onSelectBooking,
    rooms,
    startHour = 7,
    teams,
    timeZone = 'UTC',
  } = props
  const today = getDay(now, timeZone)
  const [day, setDay] = useState(today)
  const [selectedId, setSelectedId] = useState<string>()
  const container = useRef<HTMLDivElement>(null)

  const isToday = day.getTime() === today.getTime()
  const dayBookings = getEventsForDay(bookings, day, timeZone)
  const selected = dayBookings.find((booking) => booking.id === selectedId)
  const resources: CalendarResource[] = rooms.map((room) => {
    const status = isToday
      ? getRoomStatus(
          dayBookings.filter((booking) => booking.resource === room.id),
          now,
          timeZone,
        )
      : undefined
    return {
      description: (
        <>
          <span className='block truncate'>{room.seats} seats</span>
          {status && (
            <span className='flex items-center gap-1.5'>
              <span
                aria-hidden
                className={cn(
                  'size-1.5 shrink-0 rounded-full',
                  status.busy ? 'bg-amber-500' : 'bg-emerald-500',
                )}
              />
              <span className='truncate'>{status.label}</span>
            </span>
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
    <Card className='@container'>
      <CardContent className='flex flex-col gap-4'>
        <CalendarToolbar
          title={formatDay(day, { day: 'numeric', month: 'long', weekday: 'long' })}
          description={`${rooms.length} rooms · ${dayBookings.length} ${dayBookings.length === 1 ? 'booking' : 'bookings'}`}
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
              className='bg-muted/40 rounded-lg border p-4'
            />
          ) : (
            <p className='text-muted-foreground text-sm'>
              Select a booking to see who booked it.
            </p>
          )}
        </div>
        <CalendarLegend calendars={teams} label='Teams' />
      </CardContent>
    </Card>
  )
}

export { Calendar4, exampleProps as calendar4ExampleProps, type Calendar4Props }
