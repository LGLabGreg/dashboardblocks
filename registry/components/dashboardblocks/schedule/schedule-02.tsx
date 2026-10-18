'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  EventRow,
  MonthCalendar,
  type ScheduleEvent,
  formatDay,
  formatRelativeDay,
  getDay,
  getDayKey,
} from '@/registry/components/dashboardblocks/schedule'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'

interface Schedule2Props {
  /** Leave out, or pass none, to show the empty state. */
  events?: ScheduleEvent[]
  now: Date
  onSelect?: (day: Date) => void
  status?: BlockStatus
  /** @default 'UTC' */
  timeZone?: string
  title: string
  /** 0 for Sunday, 1 for Monday. */
  weekStartsOn?: 0 | 1
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const at = (month: number, day: number, hour: number, minute = 0) =>
  new Date(Date.UTC(2026, month, day, hour, minute))

const CALENDARS = {
  customers: { calendar: 'Customers', color: 'var(--color-chart-3)' },
  product: { calendar: 'Product', color: 'var(--color-chart-2)' },
  team: { calendar: 'Team', color: 'var(--color-chart-4)' },
}

const exampleProps: Schedule2Props = {
  events: [
    {
      ...CALENDARS.team,
      end: at(8, 2, 17),
      id: 'c1',
      start: at(8, 2, 16),
      title: 'Sprint retro',
    },
    {
      ...CALENDARS.customers,
      end: at(8, 9, 11),
      id: 'c2',
      start: at(8, 9, 10),
      title: 'Kickoff with Initech',
    },
    {
      ...CALENDARS.product,
      end: at(8, 15, 12),
      id: 'c3',
      start: at(8, 15, 11),
      title: 'Pricing workshop',
    },
    {
      ...CALENDARS.team,
      end: at(8, 16, 17),
      id: 'c4',
      start: at(8, 16, 16),
      title: 'Sprint retro',
    },
    {
      ...CALENDARS.customers,
      end: at(8, 22, 15),
      id: 'c5',
      start: at(8, 22, 14),
      title: 'Security review with Umbrella',
    },
    {
      ...CALENDARS.team,
      end: at(8, 28, 9, 15),
      id: 'c6',
      location: 'Zoom',
      start: at(8, 28, 9),
      title: 'Daily standup',
    },
    {
      ...CALENDARS.product,
      end: at(8, 28, 10, 30),
      id: 'c7',
      location: 'Room 4B',
      start: at(8, 28, 9, 30),
      title: 'Roadmap review',
    },
    {
      ...CALENDARS.customers,
      end: at(8, 28, 14, 45),
      id: 'c8',
      location: 'Google Meet',
      start: at(8, 28, 14),
      title: 'Onboarding call with Northwind',
    },
    {
      ...CALENDARS.customers,
      end: at(8, 29, 16, 30),
      id: 'c9',
      location: 'Zoom',
      start: at(8, 29, 15, 30),
      title: 'Quarterly business review: Acme',
    },
    {
      ...CALENDARS.product,
      allDay: true,
      id: 'c10',
      start: at(8, 30, 0),
      title: 'v4.2 release',
    },
    {
      ...CALENDARS.team,
      end: at(9, 2, 17),
      id: 'c11',
      start: at(9, 2, 16),
      title: 'Sprint retro',
    },
    {
      ...CALENDARS.customers,
      end: at(9, 7, 11),
      id: 'c12',
      start: at(9, 7, 10),
      title: 'Renewal call with Globex',
    },
    {
      ...CALENDARS.product,
      end: at(9, 13, 15),
      id: 'c13',
      start: at(9, 13, 13),
      title: 'Planning: Q4 roadmap',
    },
    {
      ...CALENDARS.team,
      allDay: true,
      id: 'c14',
      start: at(9, 16, 0),
      title: 'Company offsite',
    },
  ],
  now: new Date(NOW),
  title: 'Calendar',
}

const monthOf = (day: Date) =>
  new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1))

const Schedule2 = (props: Schedule2Props) => {
  const {
    events = [],
    now,
    onSelect,
    status,
    timeZone = 'UTC',
    title,
    weekStartsOn = 0,
  } = props
  const ready = !status && events.length > 0
  const [selected, setSelected] = useState(() => getDay(now, timeZone))
  const [month, setMonth] = useState(() => monthOf(getDay(now, timeZone)))
  const id = useId()

  const monthLabel = formatDay(month, { month: 'long', year: 'numeric' })
  const monthKey = month.toISOString().slice(0, 7)
  const monthCount = events.filter(
    (event) => getDayKey(event.start, timeZone).slice(0, 7) === monthKey,
  ).length
  const selectedKey = selected.toISOString().slice(0, 10)
  const dayEvents = events
    .filter((event) => getDayKey(event.start, timeZone) === selectedKey)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  const selectedLabel = formatRelativeDay(selected, getDay(now, timeZone))
  const showMonth = (months: number) =>
    setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + months, 1)))

  return (
    <BlockStateProvider state={getBlockState(status, events)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              {monthCount} {monthCount === 1 ? 'event' : 'events'} in{' '}
              {formatDay(month, { month: 'long' })}.
            </p>
          </BlockReady>
        </header>
        <div className='grid gap-6 border-t pt-4 @xl:grid-cols-[18rem_minmax(0,1fr)]'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <h3 id={id} aria-live='polite' className='text-sm font-medium'>
                {monthLabel}
              </h3>
              <div className='flex gap-1'>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  aria-label='Previous month'
                  onClick={() => showMonth(-1)}
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
                  variant='ghost'
                  size='icon-sm'
                  aria-label='Next month'
                  onClick={() => showMonth(1)}
                >
                  <IconPlaceholder
                    lucide='ChevronRightIcon'
                    tabler='IconChevronRight'
                    hugeicons='ArrowRight01Icon'
                    phosphor='CaretRightIcon'
                    remixicon='RiArrowRightSLine'
                  />
                </Button>
              </div>
            </div>
            <MonthCalendar
              events={ready ? events : []}
              label={monthLabel}
              month={month}
              now={now}
              onMonthChange={setMonth}
              onSelect={(day) => {
                setSelected(day)
                onSelect?.(day)
              }}
              selected={selected}
              timeZone={timeZone}
              weekStartsOn={weekStartsOn}
            />
          </div>
          <section
            aria-labelledby={`${id}-day`}
            className='flex min-w-0 flex-col gap-3 border-t pt-4 @xl:border-t-0 @xl:border-l @xl:pt-0 @xl:pl-6'
          >
            <h3 id={`${id}-day`} className='flex flex-col gap-0.5 text-sm font-medium'>
              {selectedLabel}
              <Details className='text-muted-foreground font-normal'>
                {formatDay(selected)}
                {ready &&
                  `${dayEvents.length} ${dayEvents.length === 1 ? 'event' : 'events'}`}
              </Details>
            </h3>
            {!ready ? (
              <BlockStateRows rows={3} />
            ) : dayEvents.length === 0 ? (
              <p className='text-muted-foreground text-sm'>Nothing scheduled.</p>
            ) : (
              <ul className='flex flex-col gap-3'>
                {dayEvents.map((event) => (
                  <EventRow key={event.id} event={event} now={now} timeZone={timeZone} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Schedule2, exampleProps as schedule2ExampleProps, type Schedule2Props }
