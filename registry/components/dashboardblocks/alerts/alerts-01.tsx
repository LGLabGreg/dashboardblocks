'use client'

import {
  type AlertSeverity,
  SeverityIcon,
  formatRelativeTime,
  severityConfig,
} from '@/registry/components/dashboardblocks/alerts'
import { CheckIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface AlertItem {
  acknowledged?: boolean
  firedAt: Date
  id: string
  severity: AlertSeverity
  source: string
  title: string
}

interface Alerts1Props {
  alerts: AlertItem[]
  /** The time relative times are measured from. */
  now: Date
  onAcknowledge?: (id: string) => void
  title: string
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)
const minutesAgo = (minutes: number) => new Date(NOW - minutes * 60_000)

const exampleProps: Alerts1Props = {
  alerts: [
    {
      firedAt: minutesAgo(4),
      id: 'a1',
      severity: 'critical',
      source: 'checkout-api · eu-west-1',
      title: 'Error rate above 5% for 10 minutes',
    },
    {
      firedAt: minutesAgo(18),
      id: 'a2',
      severity: 'critical',
      source: 'payments-worker',
      title: 'Queue backlog over 10,000 jobs',
    },
    {
      firedAt: minutesAgo(52),
      id: 'a3',
      severity: 'warning',
      source: 'search · us-east-1',
      title: 'p95 latency above 800 ms',
    },
    {
      acknowledged: true,
      firedAt: minutesAgo(135),
      id: 'a4',
      severity: 'warning',
      source: 'postgres-primary',
      title: 'Disk usage above 80%',
    },
    {
      firedAt: minutesAgo(310),
      id: 'a5',
      severity: 'info',
      source: 'billing',
      title: 'Nightly invoice run took 2× longer than usual',
    },
  ],
  now: new Date(NOW),
  title: 'Alerts',
}

const Alerts1 = (props: Alerts1Props) => {
  const { alerts, now, onAcknowledge, title } = props
  const [acknowledged, setAcknowledged] = useState(
    () => new Set(alerts.filter((alert) => alert.acknowledged).map((alert) => alert.id)),
  )
  const [announcement, setAnnouncement] = useState('')
  const open = alerts.filter((alert) => !acknowledged.has(alert.id)).length

  const acknowledge = (alert: AlertItem) => {
    setAcknowledged((current) => new Set(current).add(alert.id))
    setAnnouncement(`Acknowledged: ${alert.title}`)
    onAcknowledge?.(alert.id)
  }

  return (
    <Card className='@container gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {open} open, {alerts.length - open} acknowledged
        </CardDescription>
        <CardAction>
          <Button
            variant='outline'
            size='sm'
            disabled={open === 0}
            onClick={() => {
              alerts
                .filter((alert) => !acknowledged.has(alert.id))
                .forEach((alert) => onAcknowledge?.(alert.id))
              setAcknowledged(new Set(alerts.map((alert) => alert.id)))
              setAnnouncement('All alerts acknowledged')
            }}
          >
            Acknowledge all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='px-0'>
        <p role='status' className='sr-only'>
          {announcement}
        </p>
        <ul>
          {alerts.map((alert) => {
            const isAcknowledged = acknowledged.has(alert.id)
            const config = severityConfig[alert.severity]
            return (
              <li
                key={alert.id}
                className={cn(
                  'flex flex-col gap-3 border-b px-6 py-4 last:border-b-0 @md:flex-row @md:items-center',
                  isAcknowledged && 'bg-muted/30',
                )}
              >
                <div className='flex min-w-0 flex-1 items-start gap-3'>
                  <SeverityIcon severity={alert.severity} />
                  <div className='flex min-w-0 flex-col gap-0.5'>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isAcknowledged && 'text-muted-foreground',
                      )}
                    >
                      <span className={cn('mr-1.5 text-xs font-semibold', config.text)}>
                        {config.label}
                      </span>
                      {alert.title}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {alert.source} ·{' '}
                      <time dateTime={alert.firedAt.toISOString()}>
                        {formatRelativeTime(alert.firedAt, now)}
                      </time>
                    </p>
                  </div>
                </div>
                <div className='pl-11 @md:pl-0'>
                  {isAcknowledged ? (
                    <span className='text-muted-foreground inline-flex h-8 items-center gap-1 text-xs'>
                      <CheckIcon aria-hidden className='size-3.5' />
                      Acknowledged
                    </span>
                  ) : (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => acknowledge(alert)}
                      aria-label={`Acknowledge: ${alert.title}`}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export { Alerts1, exampleProps as alerts1ExampleProps, type Alerts1Props }
