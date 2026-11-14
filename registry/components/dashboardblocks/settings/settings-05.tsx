'use client'

import {
  Announcements,
  useAnnouncements,
} from '@/registry/components/dashboardblocks/announcements'
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
import {
  DataTableListItem,
  DataTableRowLink,
} from '@/registry/components/dashboardblocks/table'
import { ButtonLink } from '@/registry/components/dashboardblocks/tooltip-link'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { attempt } from '@/registry/lib/dashboardblocks/attempt'
import {
  formatList,
  formatPercent,
  formatRelativeTime,
} from '@/registry/lib/dashboardblocks/format'
import { startTransition, useOptimistic, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, YAxis } from 'recharts'

import { Button } from '@/components/ui/button'
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
  /** What people call it, shown as the row's name with the URL below. */
  description?: string
  enabled: boolean
  events: string[]
  /** The endpoint's own page: the whole row opens it. */
  href?: string
  id: string
  /**
   * What's wrong while it's failing, in a sentence, such as what the server last said. While it's
   * set, the endpoint reads Failing, whatever its last deliveries were.
   */
  problem?: string
  url: string
}

/** A change that was refused resolves with the reason; the switch goes back. */
type Settings5Result = { message: string; status: 'error' } | { status: 'success' } | void

interface Settings5Props extends BlockStateProps {
  /** @default a sentence counting the endpoints and any failing ones */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  endpoints?: WebhookEndpoint[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** Where Add endpoint goes, such as a page with the new endpoint's form. In place of `onAdd`. */
  addHref?: string
  onAdd?: () => void
  /**
   * Pauses or resumes an endpoint. Return nothing to keep the change in the block, or a promise
   * that resolves once the change is saved and the endpoints you pass show it; the switch shows
   * the change until then. Leave out to keep the change in the block.
   */
  onEnabledChange?: (id: string, enabled: boolean) => void | Promise<Settings5Result>
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
      problem:
        'The last 6 deliveries timed out or got a 500 back, so billing.acme.co missed 6 events.',
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
  if (endpoint.problem) return 'error'
  const recent = endpoint.deliveries.slice(-3)
  if (recent.length > 0 && recent.every((delivery) => !isSuccess(delivery)))
    return 'error'
  return 'connected'
}

const statusLabel: Record<EndpointStatus, string> = {
  connected: 'Active',
  error: 'Failing',
  paused: 'Paused',
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

const ADD_ICON = (
  <IconPlaceholder
    lucide='PlusIcon'
    tabler='IconPlus'
    hugeicons='PlusSignIcon'
    phosphor='PlusIcon'
    remixicon='RiAddLine'
    data-icon='inline-start'
  />
)

const NO_ENDPOINTS: WebhookEndpoint[] = []
const NO_IDS: ReadonlySet<string> = new Set()

const Settings5 = (props: Settings5Props) => {
  const {
    addHref,
    endpoints: given = NO_ENDPOINTS,
    errorMessage,
    now,
    onAdd,
    onEnabledChange,
    status: blockStatus,
    title,
  } = props
  const [own, setOwn] = useState<Readonly<Record<string, boolean>>>({})
  const [refused, setRefused] = useState<Readonly<Record<string, string>>>({})
  const [said, announce] = useAnnouncements()
  const [endpoints, showEnabled] = useOptimistic(
    given.map((endpoint) =>
      endpoint.id in own ? { ...endpoint, enabled: own[endpoint.id] } : endpoint,
    ),
    (current, change: { enabled: boolean; id: string }) =>
      current.map((endpoint) =>
        endpoint.id === change.id ? { ...endpoint, enabled: change.enabled } : endpoint,
      ),
  )
  const [pendingIds, markPending] = useOptimistic(
    NO_IDS,
    (current: ReadonlySet<string>, id: string) => new Set(current).add(id),
  )
  const failing = endpoints.filter(
    (endpoint) => getEndpointStatus(endpoint) === 'error',
  ).length
  const paused = endpoints.filter((endpoint) => !endpoint.enabled).length
  const extra = [
    failing > 0 && `${failing} ${failing === 1 ? 'is' : 'are'} failing`,
    paused > 0 && `${paused} ${paused === 1 ? 'is' : 'are'} paused`,
  ].filter((part): part is string => typeof part === 'string')
  const description =
    props.description ??
    (endpoints.length === 0
      ? 'Endpoints get a JSON POST when their events happen.'
      : `${endpoints.length === 1 ? '1 endpoint gets a JSON POST when its events happen' : `${endpoints.length} endpoints get a JSON POST when their events happen`}${extra.length > 0 ? `, and ${formatList(extra)}` : ''}.`)

  function changeEnabled(endpoint: WebhookEndpoint, enabled: boolean) {
    setRefused((current) => {
      const next = { ...current }
      delete next[endpoint.id]
      return next
    })
    if (!onEnabledChange) {
      setOwn((current) => ({ ...current, [endpoint.id]: enabled }))
      return
    }
    startTransition(async () => {
      showEnabled({ enabled, id: endpoint.id })
      markPending(endpoint.id)
      const result = await attempt(() => onEnabledChange(endpoint.id, enabled))
      startTransition(() => {
        if (result && result.status === 'error') {
          setRefused((current) => ({
            ...current,
            [endpoint.id]: result.message,
          }))
          announce(result.message)
          return
        }
        if (!result) setOwn((current) => ({ ...current, [endpoint.id]: enabled }))
        announce(
          `${enabled ? 'Resumed' : 'Paused'} ${endpoint.description ?? endpoint.url}.`,
        )
      })
    })
  }

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
          {addHref && blockStatus === undefined ? (
            <ButtonLink href={addHref} className='shrink-0'>
              {ADD_ICON}
              Add endpoint
            </ButtonLink>
          ) : (
            <Button
              variant='outline'
              size='sm'
              className='shrink-0'
              disabled={blockStatus !== undefined}
              onClick={onAdd}
            >
              {ADD_ICON}
              Add endpoint
            </Button>
          )}
        </header>
        {(blockStatus || endpoints.length === 0) && (
          <div className='border-t'>
            <BlockStateRows
              rows={3}
              emptyMessage='No endpoints yet. Add one to get a POST when its events happen.'
            />
          </div>
        )}
        {!blockStatus && endpoints.length > 0 && (
          <ul className='flex flex-col divide-y border-t'>
            {endpoints.map((endpoint) => {
              const status = getEndpointStatus(endpoint)
              const succeeded = endpoint.deliveries.filter(isSuccess).length
              const last = endpoint.deliveries.at(-1)
              const pending = pendingIds.has(endpoint.id)
              return (
                <DataTableListItem key={endpoint.id} className='flex flex-col gap-2 py-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      {endpoint.description &&
                        (endpoint.href ? (
                          <DataTableRowLink
                            href={endpoint.href}
                            className='text-sm font-medium'
                          >
                            {endpoint.description}
                          </DataTableRowLink>
                        ) : (
                          <span className='truncate text-sm font-medium'>
                            {endpoint.description}
                          </span>
                        ))}
                      <div className='flex min-w-0 items-center gap-1'>
                        {endpoint.href && !endpoint.description ? (
                          <DataTableRowLink
                            href={endpoint.href}
                            className='font-mono text-sm'
                          >
                            {endpoint.url}
                          </DataTableRowLink>
                        ) : (
                          <span
                            className={cn(
                              'truncate font-mono',
                              endpoint.description
                                ? 'text-muted-foreground text-xs'
                                : 'text-sm',
                            )}
                          >
                            {endpoint.url}
                          </span>
                        )}
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
                      aria-label={`Send to ${endpoint.description ?? endpoint.url}`}
                      aria-disabled={pending || undefined}
                      checked={endpoint.enabled}
                      onCheckedChange={(enabled) => {
                        if (!pending) changeEnabled(endpoint, enabled)
                      }}
                    />
                  </div>
                  {endpoint.problem && (
                    <p
                      className={cn(
                        'text-sm text-pretty',
                        status === 'error'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-muted-foreground',
                      )}
                    >
                      {endpoint.problem}
                    </p>
                  )}
                  {refused[endpoint.id] && (
                    <p className='text-destructive text-sm text-pretty'>
                      {refused[endpoint.id]}
                    </p>
                  )}
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
                              {formatRelativeTime(last.at, now, {
                                style: 'long',
                              })}
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
                </DataTableListItem>
              )
            })}
          </ul>
        )}
        <Announcements said={said} />
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
  type Settings5Result,
  type WebhookEndpoint,
}
