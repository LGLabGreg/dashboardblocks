'use client'

import {
  type AlertSeverity,
  SeverityIcon,
  formatRelativeTime,
  severityConfig,
} from '@/registry/components/dashboardblocks/alerts'
import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Alerts4Props {
  /** Open alerts by severity. */
  counts: Partial<Record<Exclude<AlertSeverity, 'resolved'>, number>>
  latest?: { firedAt: Date; severity: AlertSeverity; source: string; title: string }
  /** The time relative times are measured from. */
  now: Date
  onViewAll?: () => void
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)

const exampleProps: Alerts4Props = {
  counts: { critical: 2, info: 3, warning: 5 },
  latest: {
    firedAt: new Date(NOW - 4 * 60_000),
    severity: 'critical',
    source: 'checkout-api',
    title: 'Error rate above 5% for 10 minutes',
  },
  now: new Date(NOW),
}

const SEVERITIES = ['critical', 'warning', 'info'] as const

const Alerts4 = (props: Alerts4Props) => {
  const { counts, latest, now, onViewAll } = props
  const total = SEVERITIES.reduce((sum, severity) => sum + (counts[severity] ?? 0), 0)

  return (
    <Card className='@container py-4'>
      <CardContent className='flex flex-col gap-4 px-4 @2xl:flex-row @2xl:items-center @2xl:gap-6'>
        <div className='flex items-center gap-3'>
          <SeverityIcon
            severity={total === 0 ? 'resolved' : (latest?.severity ?? 'warning')}
          />
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>
              {total === 0 ? 'No open alerts' : `${total} open alerts`}
            </span>
            <ul className='text-muted-foreground flex flex-wrap gap-x-3 text-xs'>
              {SEVERITIES.map((severity) => (
                <li key={severity} className='flex items-center gap-1'>
                  <span
                    aria-hidden
                    className={cn('size-2 rounded-full', severityConfig[severity].fill)}
                  />
                  {counts[severity] ?? 0} {severityConfig[severity].label.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {latest && total > 0 && (
          <p className='min-w-0 flex-1 text-sm @2xl:border-l @2xl:pl-6'>
            <span className='text-muted-foreground'>Latest: </span>
            <span className={cn('font-medium', severityConfig[latest.severity].text)}>
              {severityConfig[latest.severity].label}
            </span>{' '}
            {latest.title}{' '}
            <span className='text-muted-foreground'>
              · {latest.source} ·{' '}
              <time dateTime={latest.firedAt.toISOString()}>
                {formatRelativeTime(latest.firedAt, now)}
              </time>
            </span>
          </p>
        )}
        <Button
          variant='outline'
          size='sm'
          className='self-start @2xl:self-center'
          onClick={onViewAll}
        >
          View alerts
          <ArrowRightIcon data-icon='inline-end' />
        </Button>
      </CardContent>
    </Card>
  )
}

export { Alerts4, exampleProps as alerts4ExampleProps, type Alerts4Props }
