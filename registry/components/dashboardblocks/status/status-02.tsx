'use client'

import {
  StatusLegend,
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

interface ServiceUptime {
  days: UptimeDay[]
  name: string
}

interface Status2Props {
  description: string
  services: ServiceUptime[]
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

const exampleProps: Status2Props = {
  description: 'Daily status over the last 90 days',
  services: [
    {
      days: exampleDays({
        12: {
          note: 'Slow page loads in EU for 25 min',
          status: 'degraded',
          uptime: 99.4,
        },
        47: { note: 'Scheduled database upgrade', status: 'maintenance', uptime: 100 },
      }),
      name: 'Web app',
    },
    {
      days: exampleDays({
        3: { note: 'Elevated 5xx errors for 42 min', status: 'partial', uptime: 97.1 },
        4: { note: 'Increased latency', status: 'degraded', uptime: 99.6 },
        31: { note: 'Full outage for 1 h 6 min', status: 'major', uptime: 95.4 },
        66: { note: 'Increased latency', status: 'degraded', uptime: 99.8 },
      }),
      name: 'API',
    },
    {
      days: exampleDays({
        ...Object.fromEntries(
          Array.from({ length: 14 }, (_, index) => [
            76 + index,
            { status: 'unknown' as const },
          ]),
        ),
        20: { note: 'Delayed deliveries for 18 min', status: 'degraded', uptime: 99.7 },
      }),
      name: 'Webhooks',
    },
  ],
  title: 'Uptime',
}

const Status2 = (props: Status2Props) => {
  const { description, services, title } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <StatusLegend
          statuses={['operational', 'degraded', 'partial', 'major', 'maintenance']}
        />
        <ul className='flex flex-col gap-6'>
          {services.map((service) => (
            <li key={service.name} className='flex flex-col gap-2'>
              <div className='flex items-baseline justify-between gap-4'>
                <span className='text-sm font-medium'>{service.name}</span>
                <span className='text-muted-foreground text-xs tabular-nums'>
                  <span className='text-foreground font-medium'>
                    {formatUptime(getUptime(service.days))}
                  </span>{' '}
                  uptime
                </span>
              </div>
              <UptimeBar days={service.days} label={service.name} />
            </li>
          ))}
        </ul>
        <div className='text-muted-foreground -mt-3 flex justify-between text-xs'>
          <span>90 days ago</span>
          <span>Today</span>
        </div>
      </CardContent>
    </Card>
  )
}

export { Status2, exampleProps as status2ExampleProps, type Status2Props }
