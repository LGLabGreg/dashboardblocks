'use client'

import {
  type ConnectionStatus,
  ConnectionStatusLabel,
} from '@/registry/components/dashboardblocks/settings'
import { getAvatarColor } from '@/registry/components/dashboardblocks/team'
import { type ReactNode, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { cn } from '@/lib/utils'

interface Integration {
  category: string
  description: string
  /** A detail under the status, e.g. "Token expired" or "Syncing #alerts". */
  detail?: string
  id: string
  /** Your own logo element. Without one, the tile shows the first letter. */
  logo?: ReactNode
  name: string
  status: ConnectionStatus
}

interface Settings4Props {
  description: string
  integrations: Integration[]
  onConfigure?: (id: string) => void
  onConnect?: (id: string) => void
  onDisconnect?: (id: string) => void
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
  const { description, onConfigure, onConnect, onDisconnect, title } = props
  const [integrations, setIntegrations] = useState(props.integrations)
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

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} {connected.length} of {integrations.length} connected.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList className='mb-2'>
            {views.map((view) => (
              <TabsTrigger key={view.value} value={view.value}>
                {view.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {views.map((view) => (
            <TabsContent key={view.value} value={view.value}>
              {view.items.length === 0 ? (
                <p className='text-muted-foreground py-6 text-center text-sm'>
                  {view.empty}
                </p>
              ) : (
                <ul className='grid gap-3 @lg:grid-cols-2'>
                  {view.items.map((item) => (
                    <li
                      key={item.id}
                      className='flex min-w-0 flex-col gap-3 rounded-lg border p-4'
                    >
                      {/* In a narrow card the status drops under the name rather than over it. */}
                      <div className='flex flex-wrap items-start gap-x-3 gap-y-2'>
                        <span
                          aria-hidden
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold [&_svg]:size-5',
                            !item.logo && getAvatarColor(item.name),
                            item.logo && 'border',
                          )}
                        >
                          {item.logo ?? item.name[0]}
                        </span>
                        <div className='flex min-w-24 flex-1 flex-col gap-0.5'>
                          <span className='text-sm font-medium break-words'>
                            {item.name}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            {item.category}
                          </span>
                        </div>
                        <ConnectionStatusLabel status={item.status} />
                      </div>
                      <p className='text-muted-foreground text-sm'>{item.description}</p>
                      {item.detail && (
                        <p
                          className={cn(
                            'text-xs',
                            item.status === 'error'
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-muted-foreground',
                          )}
                        >
                          {item.detail}
                        </p>
                      )}
                      <div className='mt-auto flex flex-wrap gap-2'>
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
      </CardContent>
    </Card>
  )
}

export {
  Settings4,
  exampleProps as settings4ExampleProps,
  type Integration,
  type Settings4Props,
}
