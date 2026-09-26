'use client'

import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import {
  type Person,
  PersonAvatar,
  PresenceIndicator,
} from '@/registry/components/dashboardblocks/team'
import { BellRingIcon } from 'lucide-react'
import { useId } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Shift {
  end: Date
  person: Person
  start: Date
}

interface Team4Props {
  description: string
  /** The time the current shift is found from. */
  now: Date
  onPage?: (person: Person) => void
  /** Consecutive shifts in order. Past shifts are skipped. */
  shifts: Shift[]
  /**
   * The time zone handover times are shown in.
   * @default 'UTC'
   */
  timeZone?: string
  title: string
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)
/** Weekly shifts that hand over on Mondays at 09:00 UTC. */
const monday = (weeks: number) => new Date(Date.UTC(2026, 8, 21 + weeks * 7, 9))

const exampleProps: Team4Props = {
  description: 'Platform, primary rotation',
  now: new Date(NOW),
  shifts: [
    {
      end: monday(0),
      person: { id: 'm4', name: 'Mateo García', presence: 'online' },
      start: monday(-1),
    },
    {
      end: monday(1),
      person: { id: 'm2', name: 'Liam Chen', presence: 'online' },
      start: monday(0),
    },
    {
      end: monday(2),
      person: { id: 'm3', name: 'Sofia Rossi', presence: 'away' },
      start: monday(1),
    },
    {
      end: monday(3),
      person: { id: 'm6', name: 'Jonas Weber', presence: 'offline' },
      start: monday(2),
    },
    {
      end: monday(4),
      person: { id: 'm1', name: 'Amara Okafor', presence: 'online' },
      start: monday(3),
    },
  ],
  title: 'On call',
}

const MINUTE = 60_000

/** "2 d 18 h", "5 h 20 min", "45 min". */
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
  const { description, now, onPage, shifts, timeZone = 'UTC', title } = props
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

  const upcoming = shifts.filter((shift) => shift.end.getTime() > now.getTime())
  const current = upcoming[0]?.start.getTime() <= now.getTime() ? upcoming[0] : undefined
  const [next, ...later] = current ? upcoming.slice(1) : upcoming
  const elapsed = current
    ? (now.getTime() - current.start.getTime()) /
      (current.end.getTime() - current.start.getTime())
    : 0

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <section aria-labelledby={`${id}-now`} className='flex flex-col gap-3'>
          <h4 id={`${id}-now`} className='text-muted-foreground text-xs font-medium'>
            On call now
          </h4>
          {current ? (
            <>
              <div className='flex flex-wrap items-center gap-3'>
                <PersonAvatar person={current.person} showPresence size='lg' />
                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                  <span className='truncate text-base font-semibold'>
                    {current.person.name}
                  </span>
                  {current.person.presence && (
                    <PresenceIndicator presence={current.person.presence} />
                  )}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onPage?.(current.person)}
                >
                  <BellRingIcon data-icon='inline-start' />
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
        {next && (
          <section
            aria-labelledby={`${id}-next`}
            className='flex flex-col gap-3 border-t pt-4'
          >
            <h4 id={`${id}-next`} className='text-muted-foreground text-xs font-medium'>
              Next
            </h4>
            <div className='flex items-center gap-3'>
              <PersonAvatar person={next.person} />
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='truncate text-sm font-medium'>{next.person.name}</span>
                <span className='text-muted-foreground text-xs'>
                  From{' '}
                  <time dateTime={next.start.toISOString()}>
                    {handoverFormatter.format(next.start)}
                  </time>
                  {/* With someone on call, the countdown above already says when this starts. */}
                  {!current &&
                    `, in ${formatDuration(next.start.getTime() - now.getTime())}`}
                </span>
              </div>
            </div>
          </section>
        )}
        {later.length > 0 && (
          <section
            aria-labelledby={`${id}-later`}
            className='flex flex-col gap-2 border-t pt-4'
          >
            <h4 id={`${id}-later`} className='text-muted-foreground text-xs font-medium'>
              Later
            </h4>
            <ol className='flex flex-col'>
              {later.map((shift) => (
                <li
                  key={`${shift.person.id}-${shift.start.toISOString()}`}
                  className='flex items-center gap-3 py-1.5'
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
      </CardContent>
    </Card>
  )
}

export { Team4, exampleProps as team4ExampleProps, type Team4Props }
