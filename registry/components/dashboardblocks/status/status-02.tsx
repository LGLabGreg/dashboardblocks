'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  StatusLegend,
  UptimeBar,
  type UptimeDay,
  formatUptime,
  getUptime,
} from '@/registry/components/dashboardblocks/status'
import { formatDate } from '@/registry/lib/dashboardblocks/format'

interface ServiceUptime {
  days: UptimeDay[]
  name: string
}

interface Status2Props extends BlockStateProps {
  /** Defaults to a sentence naming the service with the lowest uptime. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  services?: ServiceUptime[]
  title: string
}

const PLACEHOLDER_SERVICES = 3

const END_DATE = Date.UTC(2026, 8, 25)
const DAY = 86_400_000

const exampleDays = (
  events: Record<number, Partial<Omit<UptimeDay, 'label'>>>,
): UptimeDay[] =>
  Array.from({ length: 90 }, (_, index) => {
    const daysAgo = 89 - index
    return {
      label: formatDate(new Date(END_DATE - daysAgo * DAY), 'date'),
      status: 'operational',
      uptime: 100,
      ...events[daysAgo],
    }
  })

const exampleProps: Status2Props = {
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

const summarize = (services: ServiceUptime[]) => {
  if (services.length === 0) return 'No services yet.'
  const rated = services.map((service) => ({
    days: service.days.length,
    name: service.name,
    uptime: getUptime(service.days),
  }))
  const lowest = rated.reduce((low, service) =>
    service.uptime < low.uptime ? service : low,
  )
  const period = `over the last ${lowest.days} days`
  if (lowest.uptime >= 100) return `Every service was up the whole time ${period}.`
  return `${lowest.name} had the lowest uptime ${period}, at ${formatUptime(lowest.uptime)}.`
}

const Status2 = (props: Status2Props) => {
  const { services = [], errorMessage, status, title } = props
  const { description = summarize(services) } = props
  const state = getBlockState(status, services)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        {state === 'loading' && (
          <ul aria-hidden className='flex flex-col gap-5'>
            {Array.from({ length: PLACEHOLDER_SERVICES }, (_, index) => (
              <li key={index} className='flex flex-col gap-2 border-t pt-3'>
                <SkeletonText className='w-32 text-sm' />
                <UptimeBar days={[]} label='' />
              </li>
            ))}
          </ul>
        )}
        {(state === 'error' || state === 'empty') && (
          <div className='border-t'>
            <BlockStateRows />
          </div>
        )}
        {!state && (
          <ul className='flex flex-col gap-5'>
            {services.map((service) => (
              <li key={service.name} className='flex flex-col gap-2 border-t pt-3'>
                <div className='flex items-baseline justify-between gap-4'>
                  <span className='text-sm font-medium'>{service.name}</span>
                  <span className='text-muted-foreground text-sm tabular-nums'>
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
        )}
        {state !== 'error' && state !== 'empty' && (
          <div className='flex flex-col gap-3'>
            {!state && (
              <div className='text-muted-foreground flex justify-between text-xs'>
                <span>{services[0]?.days.length ?? 0} days ago</span>
                <span>Today</span>
              </div>
            )}
            <StatusLegend
              statuses={['operational', 'degraded', 'partial', 'major', 'maintenance']}
            />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Status2, exampleProps as status2ExampleProps, type Status2Props }
