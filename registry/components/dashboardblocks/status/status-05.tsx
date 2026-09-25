'use client'

import {
  StatusBadge,
  type StatusLevel,
  UptimeBar,
  type UptimeDay,
  formatUptime,
  getUptime,
} from '@/registry/components/dashboardblocks/status'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Incident {
  date: string
  duration: string
  severity: StatusLevel
  title: string
}

interface Status5Props {
  days: UptimeDay[]
  description: string
  downtime: string
  incidents: Incident[]
  title: string
}

const END_DATE = Date.UTC(2026, 8, 25)
const DAY = 86_400_000

/** Builds 90 days of example data, with overrides keyed by days ago. */
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
  description: 'api.example.com, last 90 days',
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
  const { days, description, downtime, incidents, title } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='@container flex flex-col gap-6'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Uptime</dt>
            <dd className='text-3xl font-semibold tracking-tight'>
              {formatUptime(getUptime(days))}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Incidents</dt>
            <dd className='text-2xl font-semibold tracking-tight @md:text-3xl'>
              {incidents.length}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Downtime</dt>
            <dd className='text-2xl font-semibold tracking-tight whitespace-nowrap @md:text-3xl'>
              {downtime}
            </dd>
          </div>
        </dl>
        <div className='flex flex-col gap-2'>
          <UptimeBar days={days} label={title} />
          <div className='text-muted-foreground flex justify-between text-xs'>
            <span>90 days ago</span>
            <span>Today</span>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <h4 className='text-muted-foreground text-xs font-medium'>Recent incidents</h4>
          <ul className='flex flex-col'>
            {incidents.map((incident) => (
              <li
                key={`${incident.date}-${incident.title}`}
                className='flex flex-col items-start gap-x-4 gap-y-1.5 border-b py-2.5 last:border-b-0 @md:flex-row @md:items-center @md:justify-between'
              >
                <div className='flex min-w-0 flex-col'>
                  <span className='text-sm font-medium'>{incident.title}</span>
                  <span className='text-muted-foreground text-xs tabular-nums'>
                    {incident.date} · {incident.duration}
                  </span>
                </div>
                <StatusBadge status={incident.severity} />
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export { Status5, exampleProps as status5ExampleProps, type Status5Props }
