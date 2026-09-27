'use client'

import {
  type CalendarEvent,
  CalendarEventDetails,
  CalendarEventList,
  CalendarLegend,
  CalendarMonthView,
  CalendarToolbar,
  CalendarWeekView,
  formatDayRange,
  getEventsForDay,
  getWeekDays,
  startOfMonth,
} from '@/registry/components/dashboardblocks/calendar'
import {
  addDays,
  formatDay,
  getDay,
} from '@/registry/components/dashboardblocks/schedule'
import { useId, useRef, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'

type View = 'month' | 'week'

interface Calendar3Props {
  /** Calendars to filter by. */
  calendars: { color: string; name: string }[]
  events: CalendarEvent[]
  /** Marks today and draws the current time. */
  now: Date
  onSelectEvent?: (event: CalendarEvent) => void
  /** @default 'UTC' */
  timeZone?: string
  /** @default 'month' */
  view?: View
  /** 0 for Sunday, 1 for Monday. @default 0 */
  weekStartsOn?: 0 | 1
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const at = (month: number, day: number, hour = 0, minute = 0) =>
  new Date(Date.UTC(2026, month, day, hour, minute))

const CALENDARS = {
  campaigns: { calendar: 'Campaigns', color: 'var(--chart-1)' },
  content: { calendar: 'Content', color: 'var(--chart-2)' },
  holidays: { calendar: 'Holidays', color: 'var(--chart-5)' },
  social: { calendar: 'Social', color: 'var(--chart-4)' },
  webinars: { calendar: 'Webinars', color: 'var(--chart-3)' },
}

const exampleProps: Calendar3Props = {
  calendars: Object.values(CALENDARS).map(({ calendar, color }) => ({
    color,
    name: calendar,
  })),
  events: [
    {
      ...CALENDARS.holidays,
      allDay: true,
      id: 'labor-day',
      start: at(8, 7),
      title: 'Labor Day',
    },
    {
      ...CALENDARS.content,
      allDay: true,
      attendees: [{ name: 'Hannah Okoro' }],
      description: 'How we moved 10 TB to partitioned tables without downtime.',
      id: 'blog-postgres',
      start: at(8, 8),
      title: 'Blog: Scaling Postgres',
    },
    {
      ...CALENDARS.social,
      end: at(8, 10, 16),
      id: 'linkedin-hiring',
      start: at(8, 10, 15, 30),
      title: 'LinkedIn: We’re hiring',
    },
    {
      ...CALENDARS.content,
      end: at(8, 15, 14, 30),
      id: 'newsletter-sep',
      start: at(8, 15, 14),
      title: 'Newsletter: September',
    },
    {
      ...CALENDARS.webinars,
      attendees: [{ name: 'Ines Duarte' }, { name: 'Sam Whitaker' }],
      description: 'Building your first dashboard, for new customers. 340 registered.',
      end: at(8, 17, 18),
      id: 'webinar-101',
      location: 'Zoom Webinar',
      start: at(8, 17, 17),
      title: 'Webinar: Dashboards 101',
    },
    {
      ...CALENDARS.campaigns,
      allDay: true,
      attendees: [
        { name: 'Ines Duarte' },
        { name: 'Rafael Costa' },
        { name: 'Hannah Okoro' },
      ],
      description:
        'Paid social, search and email for the v4.2 launch. Budget $48,000, goal 1,200 trials.',
      end: at(9, 10),
      id: 'fall-launch',
      start: at(8, 21),
      title: 'Fall launch campaign',
    },
    {
      ...CALENDARS.social,
      end: at(8, 23, 16),
      id: 'teaser',
      start: at(8, 23, 15, 30),
      title: 'Teaser video: v4.2',
    },
    {
      ...CALENDARS.content,
      end: at(8, 28, 10, 30),
      id: 'content-standup',
      location: 'Zoom',
      start: at(8, 28, 10),
      title: 'Content standup',
    },
    {
      ...CALENDARS.social,
      end: at(8, 28, 13),
      id: 'social-planning',
      location: 'Room 3C',
      start: at(8, 28, 12),
      title: 'Social calendar planning',
    },
    {
      ...CALENDARS.campaigns,
      attendees: [
        { name: 'Ines Duarte' },
        { name: 'Rafael Costa' },
        { name: 'Meera Shah' },
      ],
      description:
        'First week of spend: cost per trial by channel, and where to move budget.',
      end: at(8, 29, 12),
      id: 'campaign-review',
      location: 'Boardroom',
      start: at(8, 29, 11),
      title: 'Campaign review',
    },
    {
      ...CALENDARS.social,
      end: at(8, 29, 15, 30),
      id: 'carousel',
      start: at(8, 29, 15),
      title: 'LinkedIn carousel: 4.2 features',
    },
    {
      ...CALENDARS.social,
      attendees: [{ name: 'Rafael Costa' }],
      description: 'Goes live at 12:01 AM PT. Ask the team to comment in the first hour.',
      end: at(8, 30, 8),
      id: 'product-hunt',
      location: 'producthunt.com',
      start: at(8, 30, 7),
      title: 'Product Hunt launch',
    },
    {
      ...CALENDARS.webinars,
      end: at(8, 30, 16),
      id: 'dry-run',
      location: 'Zoom',
      start: at(8, 30, 15),
      title: 'Webinar dry run',
    },
    {
      ...CALENDARS.webinars,
      attendees: [
        { name: 'Ines Duarte' },
        { name: 'Leo Park' },
        { name: 'Maya Lindqvist' },
      ],
      description: 'Live walkthrough of v4.2 with Q&A. 512 registered.',
      end: at(8, 30, 18),
      id: 'webinar-42',
      location: 'Zoom Webinar',
      start: at(8, 30, 17),
      title: "Webinar: What's new in 4.2",
    },
    {
      ...CALENDARS.content,
      allDay: true,
      attendees: [{ name: 'Hannah Okoro' }],
      description: 'How Northwind cut reporting time from two days to twenty minutes.',
      id: 'case-study',
      start: at(9, 1),
      title: 'Case study: Northwind',
    },
    {
      ...CALENDARS.campaigns,
      end: at(9, 1, 13, 45),
      id: 'agency',
      location: 'Google Meet',
      start: at(9, 1, 13),
      title: 'Agency check-in',
    },
    {
      ...CALENDARS.content,
      attendees: [{ name: 'Maya Lindqvist' }, { name: 'Hannah Okoro' }],
      end: at(9, 1, 17),
      id: 'podcast',
      location: 'Studio',
      start: at(9, 1, 16),
      title: 'Podcast: SaaS Weekly',
    },
    {
      ...CALENDARS.content,
      end: at(9, 2, 11),
      id: 'editorial',
      location: 'Room 3C',
      start: at(9, 2, 10),
      title: 'Editorial planning',
    },
    {
      ...CALENDARS.social,
      end: at(9, 6, 15, 30),
      id: 'customer-quote',
      start: at(9, 6, 15),
      title: 'Customer quote: Acme',
    },
    {
      ...CALENDARS.holidays,
      allDay: true,
      id: 'indigenous-peoples-day',
      start: at(9, 12),
      title: "Indigenous Peoples' Day",
    },
    {
      ...CALENDARS.content,
      end: at(9, 13, 14, 30),
      id: 'newsletter-oct',
      start: at(9, 13, 14),
      title: 'Newsletter: October',
    },
    {
      ...CALENDARS.webinars,
      end: at(9, 15, 18),
      id: 'founders',
      location: 'YouTube Live',
      start: at(9, 15, 17),
      title: 'Live Q&A with the founders',
    },
    {
      ...CALENDARS.campaigns,
      allDay: true,
      end: at(9, 31),
      id: 'black-friday',
      start: at(9, 26),
      title: 'Black Friday prep',
    },
    {
      ...CALENDARS.holidays,
      allDay: true,
      id: 'halloween',
      start: at(9, 31),
      title: 'Halloween',
    },
  ],
  now: new Date(NOW),
}

const Calendar3 = (props: Calendar3Props) => {
  const {
    calendars,
    events,
    now,
    onSelectEvent,
    timeZone = 'UTC',
    weekStartsOn = 0,
  } = props
  const today = getDay(now, timeZone)
  const [view, setView] = useState<View>(props.view ?? 'month')
  const [anchor, setAnchor] = useState(today)
  const [month, setMonth] = useState(() => startOfMonth(today))
  const [hidden, setHidden] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string>()
  const container = useRef<HTMLDivElement>(null)
  const id = useId()

  const visible = events.filter((event) => !hidden.includes(event.calendar ?? ''))
  const selected = visible.find((event) => event.id === selectedId)
  const days = getWeekDays(anchor, weekStartsOn)
  const monthLabel = formatDay(month, { month: 'long', year: 'numeric' })

  const goTo = (day: Date) => {
    setAnchor(day)
    setMonth(startOfMonth(day))
  }
  const move = (step: 1 | -1) => {
    if (view === 'week') return goTo(addDays(anchor, step * 7))
    setMonth(startOfMonth(month, step))
    setAnchor(startOfMonth(month, step))
  }
  const select = (event: CalendarEvent) => {
    setSelectedId(event.id)
    onSelectEvent?.(event)
  }
  const closeDetails = () => {
    container.current
      ?.querySelector<HTMLElement>(`[data-event-id="${selectedId}"]`)
      ?.focus()
    setSelectedId(undefined)
  }

  return (
    <Card className='@container'>
      <CardContent className='grid gap-6 @4xl:grid-cols-[13rem_minmax(0,1fr)] @4xl:grid-rows-[auto_1fr]'>
        <section aria-labelledby={id} className='flex flex-col gap-2'>
          <h3 id={id} className='text-sm font-semibold'>
            Calendars
          </h3>
          <CalendarLegend
            calendars={calendars}
            hidden={hidden}
            label='Show calendars'
            onToggle={(name) =>
              setHidden((current) =>
                current.includes(name)
                  ? current.filter((item) => item !== name)
                  : [...current, name],
              )
            }
            className='-mx-2 gap-x-0 gap-y-0 @4xl:flex-col'
          />
        </section>
        <div
          ref={container}
          className='flex min-w-0 flex-col gap-4 @4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-1'
        >
          <CalendarToolbar
            title={view === 'month' ? monthLabel : formatDayRange(days[0], days[6])}
            onToday={() => goTo(today)}
            onPrevious={() => move(-1)}
            onNext={() => move(1)}
            previousLabel={view === 'month' ? 'Previous month' : 'Previous week'}
            nextLabel={view === 'month' ? 'Next month' : 'Next week'}
            view={view}
            views={[
              { label: 'Month', value: 'month' },
              { label: 'Week', value: 'week' },
            ]}
            onViewChange={(next) => {
              // The week of the selected day, or the month of the week shown.
              if (next === 'month') setMonth(startOfMonth(anchor))
              setView(next as View)
            }}
          />
          {view === 'month' ? (
            <div className='@container flex flex-col gap-4'>
              <CalendarMonthView
                events={visible}
                label={monthLabel}
                month={month}
                now={now}
                onMonthChange={setMonth}
                onSelectDay={setAnchor}
                onSelectEvent={select}
                onShowMore={(day) => {
                  setAnchor(day)
                  setView('week')
                }}
                selectedDay={anchor}
                selectedEventId={selected?.id}
                timeZone={timeZone}
                weekStartsOn={weekStartsOn}
              />
              <section
                aria-labelledby={`${id}-day`}
                className='flex flex-col gap-2 @2xl:hidden'
              >
                <h3 id={`${id}-day`} aria-live='polite' className='text-sm font-semibold'>
                  {formatDay(anchor, { day: 'numeric', month: 'long', weekday: 'long' })}
                </h3>
                <CalendarEventList
                  events={getEventsForDay(visible, anchor, timeZone)}
                  now={now}
                  onSelectEvent={select}
                  selectedEventId={selected?.id}
                  timeZone={timeZone}
                  className='-mx-2'
                />
              </section>
            </div>
          ) : (
            <CalendarWeekView
              days={days}
              events={visible}
              now={now}
              onSelectEvent={select}
              selectedEventId={selected?.id}
              timeZone={timeZone}
              className='h-[34rem]'
            />
          )}
        </div>
        <div className='min-w-0 border-t pt-4 @4xl:col-start-1 @4xl:row-start-2'>
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
      </CardContent>
    </Card>
  )
}

export { Calendar3, exampleProps as calendar3ExampleProps, type Calendar3Props }
