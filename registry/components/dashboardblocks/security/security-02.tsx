'use client'

import {
  type AuditSeverity,
  AuditSeverityIcon,
  formatSince,
} from '@/registry/components/dashboardblocks/security'
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

interface AuditEvent {
  /** Who did it. */
  actor: string
  /** What they did, e.g. "changed the role of". */
  action: string
  at: Date
  id: string
  ip?: string
  severity: AuditSeverity
  /** What it was done to, e.g. "Dana Kim to Admin". */
  target?: string
}

interface Security2Props {
  description: string
  events: AuditEvent[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 16, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: Security2Props = {
  description: 'Changes to access, keys and settings',
  events: [
    {
      action: 'created an API key',
      actor: 'Kenji Mori',
      at: minutesAgo(4),
      id: 'a1',
      ip: '203.0.113.24',
      severity: 'info',
      target: 'CI deploys',
    },
    {
      action: 'changed the role of',
      actor: 'Ana Lima',
      at: minutesAgo(31),
      id: 'a2',
      ip: '198.51.100.7',
      severity: 'warning',
      target: 'Dana Kim to Admin',
    },
    {
      action: 'turned off SSO enforcement',
      actor: 'Ana Lima',
      at: minutesAgo(35),
      id: 'a3',
      ip: '198.51.100.7',
      severity: 'critical',
    },
    {
      action: 'invited',
      actor: 'Sara Okafor',
      at: minutesAgo(120),
      id: 'a4',
      ip: '192.0.2.61',
      severity: 'info',
      target: 'tom@example.com',
    },
    {
      action: 'exported the audit log',
      actor: 'Kenji Mori',
      at: minutesAgo(260),
      id: 'a5',
      ip: '203.0.113.24',
      severity: 'info',
    },
    {
      action: 'revoked the API key',
      actor: 'Sara Okafor',
      at: minutesAgo(1_500),
      id: 'a6',
      ip: '192.0.2.61',
      severity: 'warning',
      target: 'Old staging token',
    },
  ],
  now: NOW,
  title: 'Audit log',
}

const Security2 = (props: Security2Props) => {
  const { description, events, now, title } = props
  const [importantOnly, setImportantOnly] = useState(false)
  const shown = importantOnly
    ? events.filter((event) => event.severity !== 'info')
    : events

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button
            aria-pressed={importantOnly}
            size='sm'
            variant={importantOnly ? 'secondary' : 'outline'}
            onClick={() => setImportantOnly((value) => !value)}
          >
            Warnings only
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ol className='flex flex-col'>
          {shown.map((event) => (
            <li
              key={event.id}
              className='flex gap-3 border-b py-2.5 first:pt-0 last:border-b-0 last:pb-0'
            >
              <AuditSeverityIcon severity={event.severity} />
              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <p className='text-sm'>
                  <span className='font-medium'>{event.actor}</span> {event.action}
                  {event.target && <span className='font-medium'> {event.target}</span>}
                </p>
                <span className='text-muted-foreground flex flex-wrap gap-x-2 text-xs'>
                  <time dateTime={event.at.toISOString()}>
                    {formatSince(event.at, now)}
                  </time>
                  {event.ip && <span className='font-mono'>{event.ip}</span>}
                </span>
              </div>
            </li>
          ))}
          {shown.length === 0 && (
            <li className='text-muted-foreground py-6 text-center text-sm'>
              Nothing to show.
            </li>
          )}
        </ol>
      </CardContent>
    </Card>
  )
}

export {
  Security2,
  exampleProps as security2ExampleProps,
  type AuditEvent,
  type Security2Props,
}
