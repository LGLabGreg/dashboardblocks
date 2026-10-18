'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  StatusIndicator,
  type StatusLevel,
  getWorstStatus,
  statusConfig,
} from '@/registry/components/dashboardblocks/status'

interface Service {
  description?: string
  name: string
  status: StatusLevel
}

interface Status1Props {
  /** Defaults to a sentence naming every service that isn't operational. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  services?: Service[]
  status?: BlockStatus
  title: string
  /** Follows the description, such as `Updated 2 minutes ago.` */
  updated?: string
}

const exampleProps: Status1Props = {
  services: [
    { description: 'Dashboard and settings', name: 'Web app', status: 'operational' },
    { description: 'REST and GraphQL endpoints', name: 'API', status: 'degraded' },
    {
      description: 'Event ingestion and delivery',
      name: 'Webhooks',
      status: 'operational',
    },
    { description: 'Scheduled exports', name: 'Background jobs', status: 'maintenance' },
    { description: 'Email and SMS', name: 'Notifications', status: 'operational' },
  ],
  title: 'System status',
  updated: 'Updated 2 minutes ago.',
}

const summaryLabel: Record<StatusLevel, string> = {
  degraded: 'Degraded performance',
  maintenance: 'Maintenance in progress',
  major: 'Major outage',
  operational: 'All systems operational',
  partial: 'Partial outage',
  unknown: 'Status unknown',
}

const listFormat = new Intl.ListFormat('en-US', { type: 'conjunction' })

const summarize = (services: Service[]) => {
  const affected = services.filter((service) => service.status !== 'operational')
  if (affected.length === 0) return `All ${services.length} services are operational.`
  const states = affected.map(
    (service) => `${service.name} ${statusConfig[service.status].phrase}`,
  )
  const rest = services.length - affected.length
  if (rest === 0) return `${listFormat.format(states)}.`
  return `${listFormat.format(states)}; the other ${rest} ${rest === 1 ? 'is' : 'are'} operational.`
}

const Status1 = (props: Status1Props) => {
  const { services = [], status, title, updated } = props
  const { description = summarize(services) } = props
  const state = getBlockState(status, services.length === 0)
  const overall = getWorstStatus(services.map((service) => service.status))

  return (
    <BlockStateProvider status={status} empty={services.length === 0}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-1'>
          <BlockReady className='w-40 text-sm'>
            <StatusIndicator label={summaryLabel[overall]} status={overall} />
          </BlockReady>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>
                {description}
                {updated && ` ${updated}`}
              </p>
            </BlockReady>
          </div>
        </header>
        {state && (
          <div className='border-t'>
            <BlockStateRows rows={5} />
          </div>
        )}
        {!state && (
          <ul className='flex flex-col border-t'>
            {services.map((service) => (
              <li
                key={service.name}
                className='flex items-center justify-between gap-4 border-b py-2.5'
              >
                <div className='flex min-w-0 flex-col'>
                  <span className='text-sm font-medium'>{service.name}</span>
                  {service.description && (
                    <span className='text-muted-foreground text-xs'>
                      {service.description}
                    </span>
                  )}
                </div>
                <StatusIndicator className='shrink-0' status={service.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Status1, exampleProps as status1ExampleProps, type Status1Props }
