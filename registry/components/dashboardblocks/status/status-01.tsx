'use client'

import {
  StatusBadge,
  StatusIndicator,
  type StatusLevel,
  getWorstStatus,
} from '@/registry/components/dashboardblocks/status'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Service {
  description?: string
  name: string
  status: StatusLevel
}

interface Status1Props {
  description: string
  services: Service[]
  title: string
}

const exampleProps: Status1Props = {
  description: 'Updated 2 minutes ago',
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
}

const summaryLabel: Record<StatusLevel, string> = {
  degraded: 'Degraded performance',
  maintenance: 'Maintenance in progress',
  major: 'Major outage',
  operational: 'All systems operational',
  partial: 'Partial outage',
  unknown: 'Status unknown',
}

const Status1 = (props: Status1Props) => {
  const { description, services, title } = props
  const overall = getWorstStatus(services.map((service) => service.status))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <StatusBadge label={summaryLabel[overall]} status={overall} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col'>
          {services.map((service) => (
            <li
              key={service.name}
              className='flex items-center justify-between gap-4 border-b py-3 first:pt-0 last:border-b-0 last:pb-0'
            >
              <div className='flex min-w-0 flex-col'>
                <span className='text-sm font-medium'>{service.name}</span>
                {service.description && (
                  <span className='text-muted-foreground truncate text-xs'>
                    {service.description}
                  </span>
                )}
              </div>
              <StatusIndicator className='shrink-0 text-xs' status={service.status} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export { Status1, exampleProps as status1ExampleProps, type Status1Props }
