'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type ConnectionStatus,
  ConnectionStatusLabel,
} from '@/registry/components/dashboardblocks/settings'
import { getAvatarColor } from '@/registry/components/dashboardblocks/team'
import { type ReactNode, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { cn } from '@/lib/utils'

interface Integration {
  category: string
  description: string
  detail?: string
  id: string
  logo?: ReactNode
  name: string
  status: ConnectionStatus
}

interface Settings4Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  integrations?: Integration[]
  onConfigure?: (id: string) => void
  onConnect?: (id: string) => void
  onDisconnect?: (id: string) => void
  status?: BlockStatus
  title: string
}

const exampleProps: Settings4Props = {
  description: 'Send alerts and reports to the tools your team already uses.',
  integrations: [
    {
      category: 'Messaging',
      description: 'Post alerts and weekly summaries to channels.',
      detail: 'Posting to #alerts',
      id: 'slack',
      name: 'Slack',
      status: 'connected',
    },
    {
      category: 'Data',
      description: 'Sync tables on a schedule for dashboards.',
      detail: 'Credentials expired 2 days ago',
      id: 'bigquery',
      name: 'BigQuery',
      status: 'error',
    },
    {
      category: 'Developer',
      description: 'Mark deploys on charts and link incidents to commits.',
      detail: 'Paused by Liam Chen',
      id: 'github',
      name: 'GitHub',
      status: 'paused',
    },
    {
      category: 'Incidents',
      description: 'Page the on-call engineer when a critical alert fires.',
      id: 'pagerduty',
      name: 'PagerDuty',
      status: 'disconnected',
    },
    {
      category: 'Payments',
      description: 'Import revenue, refunds and subscriptions.',
      detail: 'Last sync 12 minutes ago',
      id: 'stripe',
      name: 'Stripe',
      status: 'connected',
    },
    {
      category: 'Messaging',
      description: 'Send alerts to a team channel.',
      id: 'teams',
      name: 'Microsoft Teams',
      status: 'disconnected',
    },
  ],
  title: 'Integrations',
}

type Filter = 'all' | 'connected' | 'available'

const Settings4 = (props: Settings4Props) => {
  const { description, onConfigure, onConnect, onDisconnect, status, title } = props
  const [integrations, setIntegrations] = useState(props.integrations ?? [])
  const ready = !status && integrations.length > 0
  const [filter, setFilter] = useState<Filter>('all')

  const setStatus = (id: string, status: ConnectionStatus) =>
    setIntegrations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status, detail: undefined } : item,
      ),
    )

  const connected = integrations.filter((item) => item.status !== 'disconnected')
  const views: { empty: string; items: Integration[]; label: string; value: Filter }[] = [
    { empty: 'No integrations.', items: integrations, label: 'All', value: 'all' },
    {
      empty: 'Nothing connected yet.',
      items: connected,
      label: 'Connected',
      value: 'connected',
    },
    {
      empty: 'Everything is connected.',
      items: integrations.filter((item) => item.status === 'disconnected'),
      label: 'Available',
      value: 'available',
    },
  ]

  const attention = integrations.filter((item) => item.status === 'error').length

  return (
    <BlockStateProvider state={getBlockState(status, integrations)}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {description}
            {ready && (
              <>
                {' '}
                {connected.length} of {integrations.length} connected
                {attention > 0 &&
                  `, ${attention} ${attention === 1 ? 'needs' : 'need'} attention`}
                .
              </>
            )}
          </p>
        </header>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList>
            {views.map((view) => (
              <TabsTrigger key={view.value} value={view.value}>
                {view.label}
                {ready && view.value !== 'all' && view.items.length > 0 && (
                  <span className='text-muted-foreground tabular-nums'>
                    {view.items.length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {views.map((view) => (
            <TabsContent key={view.value} value={view.value} className='mt-2'>
              {!ready ? (
                <div className='border-t'>
                  <BlockStateRows rows={4} />
                </div>
              ) : view.items.length === 0 ? (
                <p className='text-muted-foreground border-t py-8 text-center text-sm'>
                  {view.empty}
                </p>
              ) : (
                <ul className='flex flex-col divide-y border-t'>
                  {view.items.map((item) => (
                    <li
                      key={item.id}
                      className='flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5'
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold [&_svg]:size-4',
                          !item.logo && getAvatarColor(item.name),
                          item.logo && 'border',
                        )}
                      >
                        {item.logo ?? item.name[0]}
                      </span>
                      <div className='flex min-w-0 flex-1 basis-48 flex-col gap-0.5'>
                        <span className='flex flex-wrap items-baseline gap-x-2'>
                          <span className='text-sm font-medium'>{item.name}</span>
                          <ConnectionStatusLabel status={item.status} />
                        </span>
                        <span className='text-muted-foreground text-xs text-pretty'>
                          {item.description}
                        </span>
                        {item.detail && (
                          <span
                            className={cn(
                              'text-muted-foreground text-xs',
                              item.status === 'error' && 'text-red-700 dark:text-red-400',
                            )}
                          >
                            {item.detail}
                          </span>
                        )}
                      </div>
                      <div className='ms-auto flex shrink-0 gap-1'>
                        {item.status === 'disconnected' ? (
                          <Button
                            variant='outline'
                            size='sm'
                            aria-label={`Connect ${item.name}`}
                            onClick={() => {
                              setStatus(item.id, 'connected')
                              onConnect?.(item.id)
                            }}
                          >
                            Connect
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              aria-label={`Disconnect ${item.name}`}
                              onClick={() => {
                                setStatus(item.id, 'disconnected')
                                onDisconnect?.(item.id)
                              }}
                            >
                              Disconnect
                            </Button>
                            <Button
                              variant={item.status === 'error' ? 'default' : 'outline'}
                              size='sm'
                              aria-label={`${item.status === 'error' ? 'Reconnect' : 'Configure'} ${item.name}`}
                              onClick={() => {
                                if (item.status === 'error')
                                  setStatus(item.id, 'connected')
                                onConfigure?.(item.id)
                              }}
                            >
                              {item.status === 'error' ? 'Reconnect' : 'Configure'}
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </BlockStateProvider>
  )
}

export {
  Settings4,
  exampleProps as settings4ExampleProps,
  type Integration,
  type Settings4Props,
}
