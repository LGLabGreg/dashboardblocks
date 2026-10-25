'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartTooltipFrame,
  ChartTooltipItem,
  chartBarCursor,
} from '@/registry/components/dashboardblocks/chart'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  type ConnectionStatus,
  ConnectionStatusLabel,
  CopyButton,
} from '@/registry/components/dashboardblocks/settings'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatPercent, formatRelativeTime } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, YAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

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

interface Settings5Props extends BlockStateProps {
  /** @default a sentence counting the endpoints and any failing ones */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  endpoints?: WebhookEndpoint[]
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

type EndpointStatus = Extract<ConnectionStatus, 'connected' | 'error' | 'paused'>

function getEndpointStatus(endpoint: WebhookEndpoint): EndpointStatus {
  if (!endpoint.enabled) return 'paused'
  const recent = endpoint.deliveries.slice(-3)
  if (recent.length > 0 && recent.every((delivery) => !isSuccess(delivery)))
    return 'error'
  return 'connected'
}

const statusLabel: Record<EndpointStatus, string> = {
  connected: 'Active',
  error: 'Failing',
  paused: 'Disabled',
}

const BAR_SLOT_PX = 10
const DELIVERED_COLOR = 'var(--color-emerald-500)'
const FAILED_COLOR = 'var(--color-red-500)'

function describeStatus(status: number) {
  return status === 0 ? 'Timed out' : String(status)
}

function DeliveryChart({
  deliveries,
  enabled,
  now,
}: {
  deliveries: Delivery[]
  enabled: boolean
  now: Date
}) {
  const data = deliveries.map((delivery) => ({
    ...delivery,
    height: isSuccess(delivery) ? 0.6 : 1,
  }))
  return (
    <div className='h-6 w-full' style={{ maxWidth: deliveries.length * BAR_SLOT_PX }}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          data={data}
          barCategoryGap={1}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          aria-label={`Last ${deliveries.length} deliveries`}
        >
          <YAxis hide domain={[0, 1]} />
          <Tooltip
            cursor={chartBarCursor}
            content={({ active, payload }) => {
              const delivery = payload?.[0]?.payload as Delivery | undefined
              if (!active || !delivery) return null
              return (
                <ChartTooltipFrame>
                  <span className='font-medium'>
                    {formatRelativeTime(delivery.at, now, { style: 'long' })}
                  </span>
                  <ChartTooltipItem
                    color={isSuccess(delivery) ? DELIVERED_COLOR : FAILED_COLOR}
                    name={isSuccess(delivery) ? 'Delivered' : 'Failed'}
                    value={describeStatus(delivery.status)}
                  />
                </ChartTooltipFrame>
              )
            }}
          />
          <Bar dataKey='height' radius={2} maxBarSize={8}>
            {data.map((delivery, index) => (
              <Cell
                key={index}
                fill={isSuccess(delivery) ? DELIVERED_COLOR : FAILED_COLOR}
                fillOpacity={enabled ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const Settings5 = (props: Settings5Props) => {
  const { now, onAdd, onEnabledChange, errorMessage, status: blockStatus, title } = props
  const [endpoints, setEndpoints] = useState(props.endpoints ?? [])
  const failing = endpoints.filter(
    (endpoint) => getEndpointStatus(endpoint) === 'error',
  ).length
  const description =
    props.description ??
    `${endpoints.length} ${endpoints.length === 1 ? 'endpoint gets' : 'endpoints get'} a JSON POST when their events happen${failing > 0 ? `, and ${failing} ${failing === 1 ? 'is' : 'are'} failing` : ''}.`

  return (
    <BlockStateProvider
      errorMessage={errorMessage}
      state={getBlockState(blockStatus, endpoints)}
    >
      <section className='@container flex flex-col gap-3'>
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
            disabled={blockStatus !== undefined}
            onClick={onAdd}
          >
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
        </header>
        {(blockStatus || endpoints.length === 0) && (
          <div className='border-t'>
            <BlockStateRows rows={3} />
          </div>
        )}
        {!blockStatus && endpoints.length > 0 && (
          <ul className='flex flex-col divide-y border-t'>
            {endpoints.map((endpoint) => {
              const status = getEndpointStatus(endpoint)
              const succeeded = endpoint.deliveries.filter(isSuccess).length
              const last = endpoint.deliveries.at(-1)
              return (
                <li key={endpoint.id} className='flex flex-col gap-2 py-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <div className='flex min-w-0 items-center gap-1'>
                        <span className='truncate font-mono text-sm'>{endpoint.url}</span>
                        <CopyButton
                          label={`Copy ${endpoint.url}`}
                          value={endpoint.url}
                          className='-my-1 shrink-0'
                        />
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        <ConnectionStatusLabel
                          status={status}
                          label={statusLabel[status]}
                          className='me-1.5 align-middle'
                        />
                        <span className='font-mono'>{endpoint.events.join(', ')}</span>
                      </p>
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
                    <div className='flex flex-col gap-1 @md:flex-row @md:items-center @md:gap-4'>
                      <DeliveryChart
                        deliveries={endpoint.deliveries}
                        enabled={endpoint.enabled}
                        now={now}
                      />
                      <Details className='text-muted-foreground shrink-0 text-xs tabular-nums'>
                        {`${formatPercent(succeeded / endpoint.deliveries.length, {
                          maximumFractionDigits: 0,
                        })} delivered`}
                        {last && (
                          <>
                            last{' '}
                            <time dateTime={last.at.toISOString()}>
                              {formatRelativeTime(last.at, now, { style: 'long' })}
                            </time>
                            {!isSuccess(last) && (
                              <span className='text-red-700 dark:text-red-400'>
                                {' '}
                                ({describeStatus(last.status).toLowerCase()})
                              </span>
                            )}
                          </>
                        )}
                      </Details>
                    </div>
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

export {
  Settings5,
  exampleProps as settings5ExampleProps,
  getEndpointStatus,
  type Delivery,
  type Settings5Props,
  type WebhookEndpoint,
}
