'use client'

import {
  type CalendarEvent,
  CalendarEventDetails,
  CalendarLegend,
  CalendarToolbar,
  CalendarWeekView,
  formatDayRange,
  getWeekDays,
} from '@/registry/components/dashboardblocks/calendar'
import { addDays, getDay } from '@/registry/components/dashboardblocks/schedule'
import { useRef, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'

interface Calendar2Props {
  /** Calendars to explain in the legend. */
  calendars: { color: string; name: string }[]
  events: CalendarEvent[]
  /** Marks today, draws the current time and picks the first event to show. */
  now: Date
  onSelectEvent?: (event: CalendarEvent) => void
  /** @default 'UTC' */
  timeZone?: string
  /** 0 for Sunday, 1 for Monday. @default 0 */
  weekStartsOn?: 0 | 1
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const at = (month: number, day: number, hour = 0, minute = 0) =>
  new Date(Date.UTC(2026, month, day, hour, minute))

const CALENDARS = {
  customers: { calendar: 'Customers', color: 'var(--chart-2)' },
  focus: { calendar: 'Focus', color: 'var(--chart-4)' },
  away: { calendar: 'Out of office', color: 'var(--chart-5)' },
  product: { calendar: 'Product', color: 'var(--chart-1)' },
  team: { calendar: 'Team', color: 'var(--chart-3)' },
}

const TEAM = [
  { name: 'Maya Lindqvist' },
  { name: 'Tomás Herrera' },
  { name: 'Priya Raman' },
  { name: 'Jonah Adeyemi' },
]

/** Standup every weekday from August 31 to October 30. */
const standups: CalendarEvent[] = Array.from({ length: 63 }, (_, index) =>
  addDays(new Date(Date.UTC(2026, 7, 30)), index),
)
  .filter((day) => day.getUTCDay() > 0 && day.getUTCDay() < 6)
  .map((day) => ({
    ...CALENDARS.team,
    attendees: TEAM,
    end: new Date(day.getTime() + (9 * 60 + 15) * 60_000),
    id: `standup-${day.toISOString().slice(0, 10)}`,
    location: 'Zoom',
    start: new Date(day.getTime() + 9 * 3_600_000),
    title: 'Standup',
  }))

const exampleProps: Calendar2Props = {
  calendars: Object.values(CALENDARS).map(({ calendar, color }) => ({
    color,
    name: calendar,
  })),
  events: [
    ...standups,
    {
      ...CALENDARS.away,
      end: at(8, 27, 21, 30),
      id: 'flight',
      location: 'SFO → JFK, UA 1542',
      start: at(8, 27, 16, 5),
      title: 'Flight to New York',
    },
    {
      ...CALENDARS.product,
      allDay: true,
      description: 'Only fixes for release blockers merge until the release ships.',
      end: at(8, 30),
      id: 'freeze',
      start: at(8, 28),
      title: 'v4.2 code freeze',
    },
    {
      ...CALENDARS.product,
      attendees: [
        { name: 'Maya Lindqvist' },
        { name: 'Tomás Herrera' },
        { name: 'Ana Sousa' },
      ],
      description:
        'Walk through the Q4 roadmap and agree what moves to Q1. Bring your top three risks.',
      end: at(8, 28, 10, 30),
      id: 'roadmap',
      location: 'Room 4B',
      start: at(8, 28, 9, 30),
      title: 'Roadmap review',
    },
    {
      ...CALENDARS.product,
      attendees: [{ name: 'Ana Sousa' }, { name: 'Leo Park' }],
      end: at(8, 28, 11),
      id: 'critique',
      location: 'Figma',
      start: at(8, 28, 10),
      title: 'Design critique',
    },
    {
      ...CALENDARS.team,
      attendees: [{ name: 'Maya Lindqvist' }, { name: 'Jonah Adeyemi' }],
      end: at(8, 28, 10, 45),
      id: 'one-on-one',
      start: at(8, 28, 10, 15),
      title: '1:1 Maya / Jonah',
    },
    {
      ...CALENDARS.customers,
      attendees: [{ name: 'Priya Raman' }, { name: 'Dana Whitfield' }],
      description: 'Connect their warehouse and set up the first three dashboards.',
      end: at(8, 28, 14, 45),
      id: 'northwind',
      location: 'Google Meet',
      start: at(8, 28, 14),
      title: 'Northwind onboarding',
    },
    {
      ...CALENDARS.team,
      end: at(8, 28, 17),
      id: 'hiring',
      location: 'Room 2A',
      start: at(8, 28, 16),
      title: 'Hiring panel: Staff engineer',
    },
    {
      ...CALENDARS.team,
      attendees: TEAM,
      end: at(8, 29, 10, 45),
      id: 'sync',
      location: 'Zoom',
      start: at(8, 29, 10),
      title: 'Team sync',
    },
    {
      ...CALENDARS.focus,
      end: at(8, 29, 15),
      id: 'focus-1',
      start: at(8, 29, 13),
      title: 'Focus time',
    },
    {
      ...CALENDARS.customers,
      attendees: [
        { name: 'Priya Raman' },
        { name: 'Marcus Reid' },
        { name: 'Ellen Park' },
      ],
      description:
        'Quarterly business review: usage, open tickets and the renewal in January.',
      end: at(8, 29, 16, 30),
      id: 'acme',
      location: 'Zoom',
      start: at(8, 29, 15, 30),
      title: 'Acme QBR',
    },
    {
      ...CALENDARS.product,
      allDay: true,
      id: 'v42',
      start: at(8, 30),
      title: 'v4.2 release',
    },
    {
      ...CALENDARS.away,
      allDay: true,
      end: at(9, 3),
      id: 'priya-ooo',
      start: at(8, 30),
      title: 'Priya out of office',
    },
    {
      ...CALENDARS.product,
      end: at(8, 30, 9),
      id: 'go-no-go',
      location: 'Zoom',
      start: at(8, 30, 8, 30),
      title: 'Release go/no-go',
    },
    {
      ...CALENDARS.product,
      end: at(8, 30, 11, 30),
      id: 'launch-sync',
      start: at(8, 30, 11),
      title: 'Launch sync',
    },
    {
      ...CALENDARS.customers,
      description: 'Live walkthrough of v4.2 for customers, with Q&A.',
      end: at(8, 30, 18),
      id: 'webinar',
      location: 'Zoom Webinar',
      start: at(8, 30, 17),
      title: "Webinar: What's new in 4.2",
    },
    {
      ...CALENDARS.product,
      end: at(9, 1, 13),
      id: 'pricing',
      location: 'Boardroom',
      start: at(9, 1, 11),
      title: 'Pricing workshop',
    },
    {
      ...CALENDARS.team,
      end: at(9, 1, 13),
      id: 'lunch-learn',
      location: 'Kitchen',
      start: at(9, 1, 12),
      title: 'Lunch & learn: Postgres at scale',
    },
    {
      ...CALENDARS.customers,
      end: at(9, 1, 15, 30),
      id: 'initech',
      location: 'Zoom',
      start: at(9, 1, 15),
      title: 'Initech demo',
    },
    {
      ...CALENDARS.focus,
      end: at(9, 2, 12),
      id: 'focus-2',
      start: at(9, 2, 9, 30),
      title: 'Focus time',
    },
    {
      ...CALENDARS.team,
      attendees: TEAM,
      end: at(9, 2, 17),
      id: 'retro',
      location: 'Room 4B',
      start: at(9, 2, 16),
      title: 'Sprint retro',
    },
    {
      ...CALENDARS.team,
      end: at(9, 6, 11),
      id: 'planning',
      location: 'Room 4B',
      start: at(9, 6, 10),
      title: 'Sprint planning',
    },
    {
      ...CALENDARS.customers,
      end: at(9, 7, 15),
      id: 'globex',
      location: 'Zoom',
      start: at(9, 7, 14),
      title: 'Globex renewal',
    },
  ],
  now: new Date(NOW),
}

const Calendar2 = (props: Calendar2Props) => {
  const {
    calendars,
    events,
    now,
    onSelectEvent,
    timeZone = 'UTC',
    weekStartsOn = 0,
  } = props
  const today = getDay(now, timeZone)
  const [anchor, setAnchor] = useState(today)
  // Start with the event in progress, or the next one.
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () =>
      [...events]
        .filter((event) => !event.allDay && (event.end ?? event.start) > now)
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0]?.id,
  )

  const container = useRef<HTMLDivElement>(null)

  const days = getWeekDays(anchor, weekStartsOn)
  const selected = events.find((event) => event.id === selectedId)

  const closeDetails = () => {
    // Return focus to the event the details belonged to.
    container.current
      ?.querySelector<HTMLElement>(`[data-event-id="${selectedId}"]`)
      ?.focus()
    setSelectedId(undefined)
  }

  return (
    <Card className='@container'>
      <CardContent className='flex flex-col gap-4'>
        <CalendarToolbar
          title={formatDayRange(days[0], days[6])}
          onToday={() => setAnchor(today)}
          onPrevious={() => setAnchor(addDays(anchor, -7))}
          onNext={() => setAnchor(addDays(anchor, 7))}
          previousLabel='Previous week'
          nextLabel='Next week'
        />
        <div ref={container} className='grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_17rem]'>
          <CalendarWeekView
            days={days}
            events={events}
            now={now}
            onSelectEvent={(event) => {
              setSelectedId(event.id)
              onSelectEvent?.(event)
            }}
            selectedEventId={selectedId}
            timeZone={timeZone}
            minColumnWidth='5.5rem'
            className='h-[30rem]'
          />
          <div className='min-w-0 border-t pt-4 @5xl:border-t-0 @5xl:border-l @5xl:pt-0 @5xl:pl-6'>
            {selected ? (
              <CalendarEventDetails
                event={selected}
                timeZone={timeZone}
                onClose={closeDetails}
              />
            ) : (
              <p className='text-muted-foreground text-sm'>
                Select an event to see its details.
              </p>
            )}
          </div>
        </div>
        <CalendarLegend calendars={calendars} />
      </CardContent>
    </Card>
  )
}

export { Calendar2, exampleProps as calendar2ExampleProps, type Calendar2Props }
