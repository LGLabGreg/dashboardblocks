'use client'

import {
  EventRow,
  type ScheduleEvent,
  formatCountdown,
  formatDay,
  getDayOffset,
  groupByDay,
} from '@/registry/components/dashboardblocks/schedule'
import { useId } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Schedule1Props {
  /** How many days ahead to show, starting today. @default 7 */
  days?: number
  events: ScheduleEvent[]
  /** The time days and countdowns are measured from. */
  now: Date
  /** @default 'UTC' */
  timeZone?: string
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const at = (day: number, hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, 28 + day, hour, minute))

const CALENDARS = {
  customers: { calendar: 'Customers', color: 'var(--chart-2)' },
  product: { calendar: 'Product', color: 'var(--chart-1)' },
  team: { calendar: 'Team', color: 'var(--chart-3)' },
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
  const { days = 7, events, now, timeZone = 'UTC', title } = props
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {upcoming.length} {upcoming.length === 1 ? 'event' : 'events'} in the next{' '}
          {days} days
          {next && <> · next {formatCountdown(next.start, now, timeZone)}</>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className='text-muted-foreground py-6 text-center text-sm'>
            Nothing scheduled in the next {days} days.
          </p>
        ) : (
          <div className='flex flex-col gap-5'>
            {groups.map((group) => (
              <section key={group.key} aria-labelledby={`${id}-${group.key}`}>
                <h3
                  id={`${id}-${group.key}`}
                  className='mb-2.5 flex items-baseline gap-2 border-b pb-1.5 text-sm font-semibold'
                >
                  {group.label}
                  <span className='text-muted-foreground text-xs font-normal'>
                    {formatDay(group.day)}
                  </span>
                </h3>
                <ul className='flex flex-col gap-3'>
                  {group.events.map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      now={now}
                      timeZone={timeZone}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { Schedule1, exampleProps as schedule1ExampleProps, type Schedule1Props }
