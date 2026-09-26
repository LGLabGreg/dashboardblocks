'use client'

import {
  type AlertSeverity,
  SeverityBadge,
  formatRelativeTime,
} from '@/registry/components/dashboardblocks/alerts'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/registry/components/dashboardblocks/data-table'
import { useState } from 'react'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface AlertRule {
  channels: string[]
  condition: string
  enabled: boolean
  id: string
  lastTriggered?: Date
  name: string
  severity: AlertSeverity
}

interface Alerts3Props {
  /** The time relative times are measured from. */
  now: Date
  onEnabledChange?: (id: string, enabled: boolean) => void
  rules: AlertRule[]
  title: string
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)
const hoursAgo = (hours: number) => new Date(NOW - hours * 3_600_000)

const exampleProps: Alerts3Props = {
  now: new Date(NOW),
  rules: [
    {
      channels: ['PagerDuty', 'Slack'],
      condition: 'Error rate > 5% for 5 min',
      enabled: true,
      id: 'r1',
      lastTriggered: hoursAgo(0.1),
      name: 'API errors',
      severity: 'critical',
    },
    {
      channels: ['Slack'],
      condition: 'p95 latency > 800 ms for 10 min',
      enabled: true,
      id: 'r2',
      lastTriggered: hoursAgo(0.9),
      name: 'Slow search',
      severity: 'warning',
    },
    {
      channels: ['Email'],
      condition: 'Disk usage > 80%',
      enabled: true,
      id: 'r3',
      lastTriggered: hoursAgo(26),
      name: 'Database disk',
      severity: 'warning',
    },
    {
      channels: ['Slack', 'Email'],
      condition: 'Daily signups < 50% of 7-day average',
      enabled: false,
      id: 'r4',
      name: 'Signup drop',
      severity: 'info',
    },
  ],
  title: 'Alert rules',
}

const Alerts3 = (props: Alerts3Props) => {
  const { now, onEnabledChange, rules, title } = props
  const [enabled, setEnabled] = useState(
    () => new Map(rules.map((rule) => [rule.id, rule.enabled])),
  )
  const active = [...enabled.values()].filter(Boolean).length

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription aria-live='polite'>
          {active} of {rules.length} rules active
        </CardDescription>
      </CardHeader>
      <DataTable>
        <caption className='sr-only'>{title}</caption>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead>Rule</DataTableHead>
            <DataTableHead>Severity</DataTableHead>
            <DataTableHead>Notifies</DataTableHead>
            <DataTableHead>Last triggered</DataTableHead>
            <DataTableHead>Status</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {rules.map((rule) => {
            const isEnabled = enabled.get(rule.id) ?? false
            return (
              <DataTableRow key={rule.id}>
                <DataTableCell primary truncate>
                  <span className='block truncate'>{rule.name}</span>
                  <span className='text-muted-foreground block font-mono text-xs font-normal whitespace-normal'>
                    {rule.condition}
                  </span>
                </DataTableCell>
                <DataTableCell label='Severity'>
                  <SeverityBadge severity={rule.severity} />
                </DataTableCell>
                <DataTableCell
                  label='Notifies'
                  className='text-muted-foreground whitespace-nowrap'
                >
                  {rule.channels.join(', ')}
                </DataTableCell>
                <DataTableCell
                  label='Last triggered'
                  className='text-muted-foreground whitespace-nowrap'
                >
                  {rule.lastTriggered ? (
                    <time dateTime={rule.lastTriggered.toISOString()}>
                      {formatRelativeTime(rule.lastTriggered, now)}
                    </time>
                  ) : (
                    'Never'
                  )}
                </DataTableCell>
                <DataTableCell label='Status'>
                  <div className='inline-flex min-h-6 items-center gap-2 text-sm whitespace-nowrap'>
                    <Switch
                      aria-label={rule.name}
                      checked={isEnabled}
                      onCheckedChange={(checked) => {
                        setEnabled((current) => new Map(current).set(rule.id, checked))
                        onEnabledChange?.(rule.id, checked)
                      }}
                    />
                    <span aria-hidden className='w-12'>
                      {isEnabled ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </DataTableCell>
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
    </Card>
  )
}

export { Alerts3, exampleProps as alerts3ExampleProps, type Alerts3Props }
