'use client'

import {
  type CalendarEvent,
  CalendarLegend,
  CalendarMonthView,
  CalendarToolbar,
  getEventDays,
  getEventsForDay,
  startOfMonth,
} from '@/registry/components/dashboardblocks/calendar'
import {
  EventRow,
  formatDay,
  formatRelativeDay,
  getDay,
} from '@/registry/components/dashboardblocks/schedule'
import { useId, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Calendar1Props {
  calendars: { color: string; name: string }[]
  events: CalendarEvent[]
  now: Date
  onSelectDay?: (day: Date) => void
  onSelectEvent?: (event: CalendarEvent) => void
  /** @default 'UTC' */
  timeZone?: string
  /** 0 for Sunday, 1 for Monday. */
  weekStartsOn?: 0 | 1
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const at = (month: number, day: number, hour = 0, minute = 0) =>
  new Date(Date.UTC(2026, month, day, hour, minute))

const CALENDARS = {
  customers: { calendar: 'Customers', color: 'var(--chart-3)' },
  holidays: { calendar: 'Holidays', color: 'var(--chart-5)' },
  launches: { calendar: 'Launches', color: 'var(--chart-2)' },
  team: { calendar: 'Team', color: 'var(--chart-4)' },
  travel: { calendar: 'Travel', color: 'var(--chart-1)' },
}

const teamSyncs: CalendarEvent[] = Array.from({ length: 9 }, (_, week) => ({
  ...CALENDARS.team,
  end: at(8, 1 + week * 7, 10, 45),
  id: `sync-${week}`,
  location: 'Zoom',
  start: at(8, 1 + week * 7, 10),
  title: 'Team sync',
}))

const exampleProps: Calendar1Props = {
  calendars: Object.values(CALENDARS).map(({ calendar, color }) => ({
    color,
    name: calendar,
  })),
  events: [
    ...teamSyncs,
    {
      ...CALENDARS.team,
      allDay: true,
      end: at(8, 3),
      id: 'offsite',
      location: 'Sonoma',
      start: at(8, 1),
      title: 'Q4 planning offsite',
    },
    {
      ...CALENDARS.customers,
      end: at(8, 3, 17, 30),
      id: 'hooli',
      location: 'Google Meet',
      start: at(8, 3, 17),
      title: 'Demo for Hooli',
    },
    {
      ...CALENDARS.team,
      end: at(8, 4, 17),
      id: 'retro-1',
      start: at(8, 4, 16),
      title: 'Sprint retro',
    },
    {
      ...CALENDARS.holidays,
      allDay: true,
      id: 'labor-day',
      start: at(8, 7),
      title: 'Labor Day',
    },
    {
      ...CALENDARS.customers,
      end: at(8, 9, 11),
      id: 'initech',
      location: 'Zoom',
      start: at(8, 9, 10),
      title: 'Kickoff with Initech',
    },
    {
      ...CALENDARS.launches,
      allDay: true,
      id: 'v41',
      start: at(8, 10),
      title: 'v4.1 release',
    },
    {
      ...CALENDARS.travel,
      allDay: true,
      end: at(8, 18),
      id: 'saastr',
      location: 'San Mateo, CA',
      start: at(8, 15),
      title: 'SaaStr Annual',
    },
    {
      ...CALENDARS.customers,
      end: at(8, 16, 21),
      id: 'stark',
      location: 'Pausa, San Mateo',
      start: at(8, 16, 19),
      title: 'Dinner with Stark Industries',
    },
    {
      ...CALENDARS.team,
      end: at(8, 18, 17),
      id: 'retro-2',
      start: at(8, 18, 16),
      title: 'Sprint retro',
    },
    {
      ...CALENDARS.team,
      allDay: true,
      end: at(8, 26),
      id: 'priya-ooo',
      start: at(8, 21),
      title: 'Priya out of office',
    },
    {
      ...CALENDARS.customers,
      end: at(8, 22, 15),
      id: 'umbrella',
      location: 'Zoom',
      start: at(8, 22, 14),
      title: 'Security review with Umbrella',
    },
    {
      ...CALENDARS.team,
      end: at(8, 24, 13, 30),
      id: 'lunch',
      location: 'Tartine Manufactory',
      start: at(8, 24, 12, 30),
      title: 'Team lunch',
    },
    {
      ...CALENDARS.launches,
      allDay: true,
      end: at(8, 30),
      id: 'freeze',
      start: at(8, 28),
      title: 'v4.2 code freeze',
    },
    {
      ...CALENDARS.team,
      end: at(8, 28, 10, 30),
      id: 'roadmap',
      location: 'Room 4B',
      start: at(8, 28, 9, 30),
      title: 'Roadmap review',
    },
    {
      ...CALENDARS.customers,
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
      ...CALENDARS.customers,
      end: at(8, 29, 16, 30),
      id: 'acme',
      location: 'Zoom',
      start: at(8, 29, 15, 30),
      title: 'Acme QBR',
    },
    {
      ...CALENDARS.launches,
      allDay: true,
      id: 'v42',
      start: at(8, 30),
      title: 'v4.2 release',
    },
    {
      ...CALENDARS.team,
      end: at(9, 2, 17),
      id: 'retro-3',
      start: at(9, 2, 16),
      title: 'Sprint retro',
    },
    {
      ...CALENDARS.travel,
      allDay: true,
      end: at(9, 9),
      id: 'london',
      location: 'London',
      start: at(9, 6),
      title: 'Customer visits, London',
    },
    {
      ...CALENDARS.customers,
      end: at(9, 7, 11),
      id: 'globex',
      location: 'Globex, Canary Wharf',
      start: at(9, 7, 10),
      title: 'Globex renewal',
    },
    {
      ...CALENDARS.holidays,
      allDay: true,
      id: 'indigenous-peoples-day',
      start: at(9, 12),
      title: "Indigenous Peoples' Day",
    },
    {
      ...CALENDARS.team,
      end: at(9, 16, 17),
      id: 'retro-4',
      start: at(9, 16, 16),
      title: 'Sprint retro',
    },
    {
      ...CALENDARS.launches,
      allDay: true,
      id: 'pricing',
      start: at(9, 21),
      title: 'New pricing live',
    },
  ],
  now: new Date(NOW),
}

const Calendar1 = (props: Calendar1Props) => {
  const {
    calendars,
    events,
    now,
    onSelectDay,
    onSelectEvent,
    timeZone = 'UTC',
    weekStartsOn = 0,
  } = props
  const today = getDay(now, timeZone)
  const [month, setMonth] = useState(() => startOfMonth(today))
  const [selectedDay, setSelectedDay] = useState(today)
  const [selectedEventId, setSelectedEventId] = useState<string>()
  const id = useId()

  const monthLabel = formatDay(month, { month: 'long', year: 'numeric' })
  const dayEvents = getEventsForDay(events, selectedDay, timeZone)
  const relative = formatRelativeDay(selectedDay, today)

  const selectDay = (day: Date) => {
    setSelectedDay(day)
    setSelectedEventId(undefined)
    onSelectDay?.(day)
  }

  return (
    <Card className='@container'>
      <CardContent className='flex flex-col gap-4'>
        <CalendarToolbar
          title={monthLabel}
          onToday={() => {
            setMonth(startOfMonth(today))
            selectDay(today)
          }}
          onPrevious={() => setMonth(startOfMonth(month, -1))}
          onNext={() => setMonth(startOfMonth(month, 1))}
          previousLabel='Previous month'
          nextLabel='Next month'
        />
        <div className='grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_16rem]'>
          <CalendarMonthView
            events={events}
            label={monthLabel}
            month={month}
            now={now}
            onMonthChange={setMonth}
            onSelectDay={selectDay}
            onSelectEvent={(event) => {
              setSelectedDay(getEventDays(event, timeZone).first)
              setSelectedEventId(event.id)
              onSelectEvent?.(event)
            }}
            selectedDay={selectedDay}
            selectedEventId={selectedEventId}
            timeZone={timeZone}
            weekStartsOn={weekStartsOn}
          />
          <section
            aria-labelledby={id}
            className='flex min-w-0 flex-col gap-3 @4xl:border-l @4xl:pl-6'
          >
            <h3
              id={id}
              aria-live='polite'
              className='flex flex-col text-sm font-semibold'
            >
              {formatDay(selectedDay, { day: 'numeric', month: 'long', weekday: 'long' })}
              <span className='text-muted-foreground text-xs font-normal'>
                {['Today', 'Tomorrow', 'Yesterday'].includes(relative) &&
                  `${relative} · `}
                {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
              </span>
            </h3>
            {dayEvents.length === 0 ? (
              <p className='text-muted-foreground text-sm'>Nothing scheduled.</p>
            ) : (
              <ul className='flex flex-col gap-1'>
                {dayEvents.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    now={now}
                    timeZone={timeZone}
                    className={cn(
                      '-mx-2 rounded-md px-2 py-1.5',
                      event.id === selectedEventId && 'bg-muted',
                    )}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
        <CalendarLegend calendars={calendars} />
      </CardContent>
    </Card>
  )
}

export { Calendar1, exampleProps as calendar1ExampleProps, type Calendar1Props }
