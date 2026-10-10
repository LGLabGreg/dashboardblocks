'use client'

import {
  type ConnectionStatus,
  ConnectionStatusLabel,
  CopyButton,
  formatRelative,
} from '@/registry/components/dashboardblocks/settings'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

import { cn } from '@/lib/utils'

interface Delivery {
  at: Date
  /** The HTTP status, or 0 for a timeout. */
  status: number
}

interface WebhookEndpoint {
  /** Recent deliveries, oldest first. */
  deliveries: Delivery[]
  enabled: boolean
  events: string[]
  id: string
  url: string
}

interface Settings5Props {
  description: string
  endpoints: WebhookEndpoint[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onAdd?: () => void
  onEnabledChange?: (id: string, enabled: boolean) => void
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 16, 0))

function exampleDeliveries(count: number, failEvery: number, failFrom = count) {
  return Array.from({ length: count }, (_, index) => ({
    at: new Date(NOW.getTime() - (count - index) * 37 * 60_000),
    status:
      index >= failFrom
        ? index % 2
          ? 500
          : 0
        : failEvery > 0 && index % failEvery === failEvery - 1
          ? 502
          : 200,
  }))
}

const exampleProps: Settings5Props = {
  description: 'We POST a JSON payload to each endpoint when its events happen.',
  endpoints: [
    {
      deliveries: exampleDeliveries(30, 0),
      enabled: true,
      events: ['alert.triggered', 'alert.resolved'],
      id: 'w1',
      url: 'https://api.acme.co/hooks/alerts',
    },
    {
      deliveries: exampleDeliveries(30, 9, 24),
      enabled: true,
      events: ['invoice.paid', 'invoice.failed', 'subscription.updated'],
      id: 'w2',
      url: 'https://billing.acme.co/webhooks/dashboardblocks',
    },
    {
      deliveries: exampleDeliveries(12, 0),
      enabled: false,
      events: ['report.ready'],
      id: 'w3',
      url: 'https://hooks.zapier.com/hooks/catch/1234/abcd',
    },
  ],
  now: NOW,
  title: 'Webhooks',
}

const isSuccess = (delivery: Delivery) => delivery.status >= 200 && delivery.status < 300

function getEndpointStatus(endpoint: WebhookEndpoint): ConnectionStatus {
  if (!endpoint.enabled) return 'paused'
  const recent = endpoint.deliveries.slice(-3)
  if (recent.length > 0 && recent.every((delivery) => !isSuccess(delivery)))
    return 'error'
  return 'connected'
}

const statusLabel: Record<ConnectionStatus, string> = {
  connected: 'Active',
  disconnected: 'Not set up',
  error: 'Failing',
  paused: 'Disabled',
}

const Settings5 = (props: Settings5Props) => {
  const { description, now, onAdd, onEnabledChange, title } = props
  const [endpoints, setEndpoints] = useState(props.endpoints)

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button variant='outline' size='sm' onClick={onAdd}>
            <IconPlaceholder
              lucide='PlusIcon'
              tabler='IconPlus'
              hugeicons='PlusSignIcon'
              phosphor='PlusIcon'
              remixicon='RiAddLine'
              data-icon='inline-start'
            />
            Add endpoint
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col divide-y border-t'>
          {endpoints.map((endpoint) => {
            const status = getEndpointStatus(endpoint)
            const succeeded = endpoint.deliveries.filter(isSuccess).length
            const rate =
              endpoint.deliveries.length > 0
                ? Math.round((succeeded / endpoint.deliveries.length) * 100)
                : null
            const last = endpoint.deliveries.at(-1)
            return (
              <li key={endpoint.id} className='flex flex-col gap-3 py-4'>
                <div className='flex items-start gap-3'>
                  <div className='flex min-w-0 flex-1 flex-col gap-1'>
                    <div className='flex min-w-0 items-center gap-1'>
                      <span className='truncate font-mono text-sm'>{endpoint.url}</span>
                      <CopyButton
                        label={`Copy ${endpoint.url}`}
                        value={endpoint.url}
                        className='-my-1 shrink-0'
                      />
                    </div>
                    <div className='flex flex-wrap items-center gap-1.5'>
                      <ConnectionStatusLabel
                        status={status}
                        label={statusLabel[status]}
                        className='mr-1'
                      />
                      {endpoint.events.map((event) => (
                        <Badge key={event} variant='secondary' className='font-mono'>
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Switch
                    aria-label={`Send to ${endpoint.url}`}
                    checked={endpoint.enabled}
                    onCheckedChange={(enabled) => {
                      setEndpoints((current) =>
                        current.map((item) =>
                          item.id === endpoint.id ? { ...item, enabled } : item,
                        ),
                      )
                      onEnabledChange?.(endpoint.id, enabled)
                    }}
                  />
                </div>
                {endpoint.deliveries.length > 0 && (
                  <div className='flex flex-col gap-1.5'>
                    <ol
                      aria-label={`Last ${endpoint.deliveries.length} deliveries`}
                      className='flex h-6 items-end gap-0.5'
                    >
                      {endpoint.deliveries.map((delivery, index) => {
                        const ok = isSuccess(delivery)
                        return (
                          <li
                            key={index}
                            title={`${delivery.status || 'Timed out'} · ${formatRelative(delivery.at, now)}`}
                            className={cn(
                              'max-w-2 min-w-0.5 flex-1 rounded-[2px]',
                              ok
                                ? 'h-3/5 bg-emerald-600/70 dark:bg-emerald-500/70'
                                : 'h-full bg-red-600 dark:bg-red-500',
                              !endpoint.enabled && 'opacity-40',
                            )}
                          >
                            <span className='sr-only'>
                              {ok ? 'Delivered' : 'Failed'},{' '}
                              {delivery.status || 'timed out'}
                            </span>
                          </li>
                        )
                      })}
                    </ol>
                    <p className='text-muted-foreground text-xs'>
                      {rate}% delivered
                      {last && (
                        <>
                          {' '}
                          · last{' '}
                          <time dateTime={last.at.toISOString()}>
                            {formatRelative(last.at, now)}
                          </time>
                          {!isSuccess(last) && (
                            <span className='text-red-700 dark:text-red-400'>
                              {' '}
                              ({last.status || 'timed out'})
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  Settings5,
  exampleProps as settings5ExampleProps,
  getEndpointStatus,
  type Delivery,
  type Settings5Props,
  type WebhookEndpoint,
}
