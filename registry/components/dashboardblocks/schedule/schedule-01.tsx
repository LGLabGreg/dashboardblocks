'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import {
  EventRow,
  type ScheduleEvent,
  formatCountdown,
  formatDay,
  getDayOffset,
  groupByDay,
} from '@/registry/components/dashboardblocks/schedule'
import { useId } from 'react'

interface Schedule1Props {
  days?: number
  /** Leave out, or pass none, to show the empty state. */
  events?: ScheduleEvent[]
  now: Date
  status?: BlockStatus
  /** @default 'UTC' */
  timeZone?: string
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const at = (day: number, hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, 28 + day, hour, minute))

const CALENDARS = {
  customers: { calendar: 'Customers', color: 'var(--color-chart-3)' },
  product: { calendar: 'Product', color: 'var(--color-chart-2)' },
  team: { calendar: 'Team', color: 'var(--color-chart-4)' },
}

const exampleProps: Schedule1Props = {
  events: [
    {
      ...CALENDARS.team,
      end: at(0, 9, 15),
      id: 'e1',
      location: 'Zoom',
      start: at(0, 9),
      title: 'Daily standup',
    },
    {
      ...CALENDARS.product,
      end: at(0, 10, 30),
      id: 'e2',
      location: 'Room 4B',
      start: at(0, 9, 30),
      title: 'Roadmap review',
    },
    {
      ...CALENDARS.customers,
      end: at(0, 14, 45),
      id: 'e3',
      location: 'Google Meet',
      start: at(0, 14),
      title: 'Onboarding call with Northwind',
    },
    {
      ...CALENDARS.team,
      end: at(1, 13),
      id: 'e4',
      location: 'Cafeteria',
      start: at(1, 12),
      title: 'Team lunch',
    },
    {
      ...CALENDARS.customers,
      end: at(1, 16, 30),
      id: 'e5',
      location: 'Zoom',
      start: at(1, 15, 30),
      title: 'Quarterly business review: Acme',
    },
    {
      ...CALENDARS.product,
      allDay: true,
      id: 'e6',
      start: at(2, 0),
      title: 'v4.2 release',
    },
    {
      ...CALENDARS.product,
      end: at(2, 11),
      id: 'e7',
      location: 'Room 2A',
      start: at(2, 10),
      title: 'Design critique',
    },
    {
      ...CALENDARS.team,
      end: at(4, 17),
      id: 'e8',
      location: 'Zoom',
      start: at(4, 16),
      title: 'Sprint retro',
    },
    {
      ...CALENDARS.customers,
      end: at(9, 11),
      id: 'e9',
      start: at(9, 10),
      title: 'Renewal call with Globex',
    },
  ],
  now: new Date(NOW),
  title: 'Upcoming',
}

const Schedule1 = (props: Schedule1Props) => {
  const { days = 7, events = [], now, status, timeZone = 'UTC', title } = props
  const upcoming = events.filter((event) => {
    const offset = getDayOffset(event.start, now, timeZone)
    return offset >= 0 && offset < days
  })
  const groups = groupByDay(upcoming, now, timeZone)
  const id = useId()
  const next = upcoming
    .filter((event) => !event.allDay && event.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0]

  return (
    <BlockStateProvider status={status} empty={events.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              {upcoming.length} {upcoming.length === 1 ? 'event' : 'events'} in the next{' '}
              {days} days.
              {next && (
                <>
                  {' '}
                  Next up is {next.title}, {formatCountdown(next.start, now, timeZone)}.
                </>
              )}
            </p>
          </BlockReady>
        </header>
        {status || events.length === 0 ? (
          <div className='border-t'>
            <BlockStateRows rows={4} />
          </div>
        ) : groups.length === 0 ? (
          <p className='text-muted-foreground border-t pt-3 text-sm'>
            Nothing scheduled in the next {days} days.
          </p>
        ) : (
          groups.map((group) => (
            <section
              key={group.key}
              aria-labelledby={`${id}-${group.key}`}
              className='flex flex-col gap-3 border-t pt-3'
            >
              <h3
                id={`${id}-${group.key}`}
                className='text-muted-foreground flex justify-between text-xs font-medium'
              >
                {group.label}
                <span className='font-normal tabular-nums'>
                  {formatDay(group.day, { day: 'numeric', month: 'short' })}
                </span>
              </h3>
              <ul className='flex flex-col gap-3'>
                {group.events.map((event) => (
                  <EventRow key={event.id} event={event} now={now} timeZone={timeZone} />
                ))}
              </ul>
            </section>
          ))
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Schedule1, exampleProps as schedule1ExampleProps, type Schedule1Props }
