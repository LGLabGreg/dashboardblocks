'use client'

import { ActivityTime } from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  type AuditSeverity,
  AuditSeverityLabel,
} from '@/registry/components/dashboardblocks/security'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

interface AuditEvent {
  actor: string
  action: string
  at: Date
  id: string
  ip?: string
  severity: AuditSeverity
  target?: string
}

interface Security2Props {
  /** Defaults to a sentence counting the changes and the critical ones. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  events?: AuditEvent[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  status?: BlockStatus
  /** @default 'UTC' */
  timeZone?: string
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 16, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: Security2Props = {
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

const summarize = (events: AuditEvent[]) => {
  const critical = events.filter((event) => event.severity === 'critical').length
  const changes = `${events.length} ${events.length === 1 ? 'change' : 'changes'} to access, keys and settings`
  return critical > 0 ? `${changes}, ${critical} of them critical.` : `${changes}.`
}

const Security2 = (props: Security2Props) => {
  const { description, events = [], now, status, timeZone, title } = props
  const [importantOnly, setImportantOnly] = useState(false)
  const state = getBlockState(status, events.length === 0)
  const shown = importantOnly
    ? events.filter((event) => event.severity !== 'info')
    : events

  return (
    <BlockStateProvider status={status} empty={events.length === 0}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            {description ? (
              <p className='text-muted-foreground text-sm'>{description}</p>
            ) : (
              <BlockReady className='text-sm'>
                <p className='text-muted-foreground text-sm'>{summarize(events)}</p>
              </BlockReady>
            )}
          </div>
          <Button
            aria-pressed={importantOnly}
            disabled={state !== undefined}
            size='sm'
            variant={importantOnly ? 'secondary' : 'outline'}
            onClick={() => setImportantOnly((value) => !value)}
          >
            Warnings only
          </Button>
        </header>
        <BlockStateRows className='border-t' rows={6} />
        {!state && (
          <ol className='flex flex-col border-t'>
            {shown.map((event) => (
              <li key={event.id} className='flex items-start gap-3 border-b py-2.5'>
                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                  <p className='text-sm text-pretty'>
                    <span className='font-medium'>{event.actor}</span> {event.action}
                    {event.target && <span className='font-medium'> {event.target}</span>}
                  </p>
                  <Details className='text-muted-foreground text-xs'>
                    <ActivityTime date={event.at} now={now} timeZone={timeZone} />
                    {event.ip && <span className='font-mono'>{event.ip}</span>}
                  </Details>
                </div>
                {event.severity !== 'info' && (
                  <AuditSeverityLabel severity={event.severity} />
                )}
              </li>
            ))}
            {shown.length === 0 && (
              <li className='text-muted-foreground border-b py-6 text-center text-sm'>
                No warnings in this log.
              </li>
            )}
          </ol>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Security2,
  exampleProps as security2ExampleProps,
  type AuditEvent,
  type Security2Props,
}
