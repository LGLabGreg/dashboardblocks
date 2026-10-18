'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  StatusIndicator,
  type StatusLevel,
  UptimeBar,
  type UptimeDay,
  formatUptime,
  getUptime,
} from '@/registry/components/dashboardblocks/status'

interface Incident {
  date: string
  duration: string
  severity: StatusLevel
  title: string
}

interface Status5Props {
  /** Oldest first. Leave out, or pass none, to show the empty state. */
  days?: UptimeDay[]
  description: string
  downtime?: string
  /** Newest first. */
  incidents?: Incident[]
  status?: BlockStatus
  title: string
}

const END_DATE = Date.UTC(2026, 8, 25)
const DAY = 86_400_000

const exampleDays = (
  events: Record<number, Partial<Omit<UptimeDay, 'label'>>>,
): UptimeDay[] =>
  Array.from({ length: 90 }, (_, index) => {
    const daysAgo = 89 - index
    return {
      label: new Date(END_DATE - daysAgo * DAY).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
        year: 'numeric',
      }),
      status: 'operational',
      uptime: 100,
      ...events[daysAgo],
    }
  })

const exampleProps: Status5Props = {
  days: exampleDays({
    3: { note: 'Elevated 5xx errors for 42 min', status: 'partial', uptime: 97.1 },
    31: { note: 'Full outage for 1 h 6 min', status: 'major', uptime: 95.4 },
    66: { note: 'Increased latency for 3 min', status: 'degraded', uptime: 99.8 },
  }),
  description:
    'api.example.com over the last 90 days. The last incident was resolved on Sep 22.',
  downtime: '1 h 51 min',
  incidents: [
    {
      date: 'Sep 22',
      duration: '42 min',
      severity: 'partial',
      title: 'Elevated API error rates',
    },
    {
      date: 'Aug 25',
      duration: '1 h 6 min',
      severity: 'major',
      title: 'API unavailable',
    },
    {
      date: 'Jul 21',
      duration: '3 min',
      severity: 'degraded',
      title: 'Increased latency',
    },
  ],
  title: 'API uptime',
}

const Status5 = (props: Status5Props) => {
  const { days = [], description, downtime, incidents = [], status, title } = props
  const state = getBlockState(status, days.length === 0)

  return (
    <BlockStateProvider status={status} empty={days.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @md:grid-cols-[1fr_auto_auto]'>
          <div className='col-span-2 flex flex-col gap-1 @md:col-span-1'>
            <dt className='text-muted-foreground text-sm'>Uptime</dt>
            {state ? (
              <dd>
                <KPIValue />
              </dd>
            ) : (
              <dd className='text-4xl font-light tracking-tight tabular-nums'>
                {formatUptime(getUptime(days))}
              </dd>
            )}
          </div>
          {state !== 'error' && state !== 'empty' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Incidents</dt>
                <dd>
                  <KPIValue className='text-2xl' value={incidents.length} />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Downtime</dt>
                {state ? (
                  <dd>
                    <KPIValue className='text-2xl' />
                  </dd>
                ) : (
                  <dd className='text-2xl font-light tracking-tight whitespace-nowrap tabular-nums'>
                    {downtime}
                  </dd>
                )}
              </div>
            </>
          )}
        </dl>
        <div className='flex flex-col gap-2'>
          <UptimeBar days={days} label={title} />
          {!state && (
            <div className='text-muted-foreground flex justify-between text-xs'>
              <span>{days.length} days ago</span>
              <span>Today</span>
            </div>
          )}
        </div>
        {state !== 'error' && state !== 'empty' && (
          <div className='flex flex-col gap-1'>
            <h3 className='text-sm font-medium'>Recent incidents</h3>
            {state === 'loading' && (
              <div className='border-t'>
                <BlockStateRows rows={3} />
              </div>
            )}
            {!state && (
              <ul className='flex flex-col border-t'>
                {incidents.map((incident) => (
                  <li
                    key={`${incident.date}-${incident.title}`}
                    className='flex flex-col items-start gap-x-4 gap-y-1 border-b py-2.5 @md:flex-row @md:items-center @md:justify-between'
                  >
                    <div className='flex min-w-0 flex-col'>
                      <span className='text-sm font-medium'>{incident.title}</span>
                      <span className='text-muted-foreground text-xs tabular-nums'>
                        {incident.date}
                      </span>
                    </div>
                    <div className='flex shrink-0 items-center gap-4'>
                      <StatusIndicator status={incident.severity} />
                      <span className='text-muted-foreground w-16 text-right text-sm tabular-nums'>
                        <span className='sr-only'>Lasted </span>
                        {incident.duration}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Status5, exampleProps as status5ExampleProps, type Status5Props }
