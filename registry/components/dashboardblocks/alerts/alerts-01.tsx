'use client'

import {
  type AlertSeverity,
  SeverityLabel,
} from '@/registry/components/dashboardblocks/alerts'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import { formatRelativeTime } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface AlertItem {
  acknowledged?: boolean
  firedAt: Date
  id: string
  region?: string
  service: string
  severity: AlertSeverity
  title: string
}

interface Alerts1Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  alerts?: AlertItem[]
  /** Defaults to a sentence counting what is still open. */
  description?: string
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
      region: 'eu-west-1',
      service: 'checkout-api',
      severity: 'critical',
      title: 'Error rate above 5% for 10 minutes',
    },
    {
      firedAt: minutesAgo(18),
      id: 'a2',
      service: 'payments-worker',
      severity: 'critical',
      title: 'Queue backlog over 10,000 jobs',
    },
    {
      firedAt: minutesAgo(52),
      id: 'a3',
      region: 'us-east-1',
      service: 'search',
      severity: 'warning',
      title: 'p95 latency above 800 ms',
    },
    {
      acknowledged: true,
      firedAt: minutesAgo(135),
      id: 'a4',
      service: 'postgres-primary',
      severity: 'warning',
      title: 'Disk usage above 80%',
    },
    {
      firedAt: minutesAgo(310),
      id: 'a5',
      service: 'billing',
      severity: 'info',
      title: 'Nightly invoice run took 2× longer than usual',
    },
  ],
  now: new Date(NOW),
  title: 'Alerts',
}

const summarize = (alerts: AlertItem[]) => {
  if (alerts.length === 0) return 'All acknowledged.'
  const critical = alerts.filter((alert) => alert.severity === 'critical').length
  return critical > 0
    ? `${alerts.length} open, ${critical} critical.`
    : `${alerts.length} open.`
}

const Alerts1 = (props: Alerts1Props) => {
  const { alerts = [], now, onAcknowledge, errorMessage, status, title } = props
  const [acknowledged, setAcknowledged] = useState<ReadonlySet<string>>(() => new Set())
  const [announcement, setAnnouncement] = useState('')
  const state = getBlockState(status, alerts)
  const isAcknowledged = (alert: AlertItem) =>
    alert.acknowledged || acknowledged.has(alert.id)
  const open = alerts.filter((alert) => !isAcknowledged(alert))
  const { description = summarize(open) } = props

  const acknowledge = (alert: AlertItem) => {
    setAcknowledged((current) => new Set(current).add(alert.id))
    setAnnouncement(`Acknowledged: ${alert.title}`)
    onAcknowledge?.(alert.id)
  }

  const acknowledgeAll = () => {
    open.forEach((alert) => onAcknowledge?.(alert.id))
    setAcknowledged((current) => new Set([...current, ...open.map((alert) => alert.id)]))
    setAnnouncement('All alerts acknowledged')
  }

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          <Button
            variant='outline'
            size='sm'
            disabled={Boolean(state) || open.length === 0}
            onClick={acknowledgeAll}
          >
            Acknowledge all
          </Button>
        </header>
        <p role='status' className='sr-only'>
          {announcement}
        </p>
        {state && (
          <div className='border-t'>
            <BlockStateRows rows={5} />
          </div>
        )}
        {!state && (
          <ul className='border-t'>
            {alerts.map((alert) => {
              const acknowledgedAlert = isAcknowledged(alert)
              return (
                <li
                  key={alert.id}
                  className='flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0'
                >
                  <div className='flex min-w-0 flex-col gap-0.5'>
                    <p className='text-sm'>
                      <SeverityLabel className='mr-1.5' severity={alert.severity} />
                      <span
                        className={cn(
                          'font-medium break-words',
                          acknowledgedAlert && 'text-muted-foreground font-normal',
                        )}
                      >
                        {alert.title}
                      </span>
                    </p>
                    <Details className='text-muted-foreground text-xs'>
                      {alert.service}
                      {alert.region}
                      <time dateTime={alert.firedAt.toISOString()}>
                        {formatRelativeTime(alert.firedAt, now)}
                      </time>
                    </Details>
                  </div>
                  {acknowledgedAlert ? (
                    <span className='text-muted-foreground shrink-0 px-2.5 text-sm'>
                      Acknowledged
                    </span>
                  ) : (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='shrink-0'
                      onClick={() => acknowledge(alert)}
                      aria-label={`Acknowledge: ${alert.title}`}
                    >
                      Acknowledge
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Alerts1, exampleProps as alerts1ExampleProps, type Alerts1Props }
