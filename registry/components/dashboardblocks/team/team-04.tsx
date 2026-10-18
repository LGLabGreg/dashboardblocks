'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import {
  type Person,
  PersonAvatar,
  PresenceLabel,
} from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId } from 'react'

import { Button } from '@/components/ui/button'

interface Shift {
  end: Date
  person: Person
  start: Date
}

interface Team4Props {
  description: string
  now: Date
  onPage?: (person: Person) => void
  /** Leave out, or pass none, to show the empty state. */
  shifts?: Shift[]
  status?: BlockStatus
  /** @default 'UTC' */
  timeZone?: string
  title: string
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)
const monday = (weeks: number) => new Date(Date.UTC(2026, 8, 21 + weeks * 7, 9))

const exampleProps: Team4Props = {
  description: 'Platform, primary rotation',
  now: new Date(NOW),
  shifts: [
    {
      end: monday(0),
      person: {
        avatar: '/images/avatar-06.webp',
        id: 'm4',
        name: 'Mateo García',
        presence: 'online',
      },
      start: monday(-1),
    },
    {
      end: monday(1),
      person: {
        avatar: '/images/avatar-04.webp',
        id: 'm2',
        name: 'Liam Chen',
        presence: 'online',
      },
      start: monday(0),
    },
    {
      end: monday(2),
      person: {
        avatar: '/images/avatar-01.webp',
        id: 'm3',
        name: 'Sofia Rossi',
        presence: 'away',
      },
      start: monday(1),
    },
    {
      end: monday(3),
      person: {
        avatar: '/images/avatar-07.webp',
        id: 'm6',
        name: 'Jonas Weber',
        presence: 'offline',
      },
      start: monday(2),
    },
    {
      end: monday(4),
      person: {
        avatar: '/images/avatar-05.webp',
        id: 'm1',
        name: 'Amara Okafor',
        presence: 'online',
      },
      start: monday(3),
    },
  ],
  title: 'On call',
}

const MINUTE = 60_000

function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.round(ms / MINUTE))
  const days = Math.floor(minutes / 1_440)
  const hours = Math.floor((minutes % 1_440) / 60)
  const rest = minutes % 60
  if (days > 0) return hours > 0 ? `${days} d ${hours} h` : `${days} d`
  if (hours > 0) return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`
  return `${rest} min`
}

const Team4 = (props: Team4Props) => {
  const { description, now, onPage, shifts = [], status, timeZone = 'UTC', title } = props
  const state = getBlockState(status, shifts.length === 0)
  const id = useId()
  const handoverFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: 'short',
    timeZone,
    timeZoneName: 'short',
    weekday: 'short',
  })
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone,
  })
  const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone,
    weekday: 'short',
  })

  const upcoming = shifts.filter((shift) => shift.end.getTime() > now.getTime())
  const current = upcoming[0]?.start.getTime() <= now.getTime() ? upcoming[0] : undefined
  const comingUp = current ? upcoming.slice(1) : upcoming
  const next = comingUp.at(0)
  const elapsed = current
    ? (now.getTime() - current.start.getTime()) /
      (current.end.getTime() - current.start.getTime())
    : 0

  const summary = current
    ? `${current.person.name} until ${weekdayFormatter.format(current.end)}${next ? `, then ${next.person.name}` : ''}.`
    : next
      ? `Nobody right now. ${next.person.name} starts ${weekdayFormatter.format(next.start)}.`
      : 'Nobody is on call.'

  return (
    <BlockStateProvider status={status} empty={shifts.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {description}. <BlockReady className='text-sm'>{summary}</BlockReady>
          </p>
        </header>
        <section
          aria-labelledby={`${id}-now`}
          className='flex flex-col gap-3 border-t pt-4'
        >
          <h3 id={`${id}-now`} className='text-sm font-medium'>
            On call now
          </h3>
          {state ? (
            <BlockStateRows rows={1} />
          ) : current ? (
            <>
              <div className='flex flex-wrap items-center gap-3'>
                <PersonAvatar person={current.person} showPresence size='lg' />
                <div className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-2xl font-light tracking-tight'>
                    {current.person.name}
                  </span>
                  {current.person.presence && (
                    <PresenceLabel
                      presence={current.person.presence}
                      className='text-xs'
                    />
                  )}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onPage?.(current.person)}
                >
                  <IconPlaceholder
                    lucide='BellRingIcon'
                    tabler='IconBellRinging'
                    hugeicons='NotificationSquareIcon'
                    phosphor='BellRingingIcon'
                    remixicon='RiNotification3Line'
                    data-icon='inline-start'
                  />
                  Page<span className='sr-only'> {current.person.name}</span>
                </Button>
              </div>
              <div aria-hidden>
                <ProgressBar
                  className='h-1.5'
                  fillClassName='motion-reduce:transition-none'
                  percentage={elapsed * 100}
                />
              </div>
              <p className='text-muted-foreground flex flex-wrap justify-between gap-x-4 gap-y-0.5 text-xs'>
                <span>
                  Hands over{' '}
                  <time
                    className='text-foreground font-medium'
                    dateTime={current.end.toISOString()}
                  >
                    {handoverFormatter.format(current.end)}
                  </time>
                </span>
                <span className='tabular-nums'>
                  in {formatDuration(current.end.getTime() - now.getTime())}
                </span>
              </p>
            </>
          ) : (
            <p className='text-muted-foreground text-sm'>Nobody is on call right now.</p>
          )}
        </section>
        {!state && next && (
          <section
            aria-labelledby={`${id}-next`}
            className='flex flex-col gap-1 border-t pt-4'
          >
            <h3 id={`${id}-next`} className='text-sm font-medium'>
              Coming up
            </h3>
            <ol className='flex flex-col divide-y'>
              {comingUp.map((shift) => (
                <li
                  key={`${shift.person.id}-${shift.start.toISOString()}`}
                  className='flex items-center gap-3 py-2.5'
                >
                  <PersonAvatar person={shift.person} size='sm' />
                  <span className='min-w-0 flex-1 truncate text-sm'>
                    {shift.person.name}
                  </span>
                  <span className='text-muted-foreground shrink-0 text-xs tabular-nums'>
                    <time dateTime={shift.start.toISOString()}>
                      {dayFormatter.format(shift.start)}
                    </time>
                    {' – '}
                    <time dateTime={shift.end.toISOString()}>
                      {dayFormatter.format(shift.end)}
                    </time>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Team4, exampleProps as team4ExampleProps, type Team4Props }
