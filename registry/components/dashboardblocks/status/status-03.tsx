'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
} from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  StatusIndicator,
  type StatusLevel,
} from '@/registry/components/dashboardblocks/status'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface IncidentUpdate {
  message: string
  stage: 'Investigating' | 'Identified' | 'Monitoring' | 'Resolved'
  time: string
}

interface Status3Props {
  affected: string[]
  onSubscribe?: () => void
  severity: StatusLevel
  started: string
  status?: BlockStatus
  title: string
  /** Newest first. Leave out, or pass none, to show the empty state. */
  updates?: IncidentUpdate[]
}

const exampleProps: Status3Props = {
  affected: ['API', 'Webhooks'],
  severity: 'partial',
  started: 'Started today at 14:02 UTC',
  title: 'Elevated API error rates',
  updates: [
    {
      message:
        'A fix has been deployed and error rates are back to normal. We are monitoring the results.',
      stage: 'Monitoring',
      time: '14:40 UTC',
    },
    {
      message:
        'We traced the errors to a misconfigured load balancer in us-east-1 and are rolling back.',
      stage: 'Identified',
      time: '14:18 UTC',
    },
    {
      message: 'We are investigating increased 5xx responses on API requests.',
      stage: 'Investigating',
      time: '14:05 UTC',
    },
  ],
}

const listFormat = new Intl.ListFormat('en-US', { type: 'conjunction' })

const Status3 = (props: Status3Props) => {
  const { affected, onSubscribe, severity, started, status, title, updates = [] } = props
  const state = getBlockState(status, updates.length === 0)

  return (
    <BlockStateProvider status={status} empty={updates.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-1'>
            <BlockReady className='w-32 text-sm'>
              <StatusIndicator status={severity} />
            </BlockReady>
            <h2 className='font-semibold tracking-tight text-balance'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>
                {[
                  started,
                  affected.length > 0 && `Affects ${listFormat.format(affected)}`,
                ]
                  .filter(Boolean)
                  .map((sentence) => `${sentence}.`)
                  .join(' ')}
              </p>
            </BlockReady>
          </div>
          <Button variant='outline' size='sm' onClick={onSubscribe}>
            <IconPlaceholder
              lucide='BellIcon'
              tabler='IconBell'
              hugeicons='NotificationIcon'
              phosphor='BellIcon'
              remixicon='RiNotificationLine'
              data-icon='inline-start'
            />
            Subscribe
          </Button>
        </header>
        {state && (
          <div className='border-t'>
            <BlockStateRows rows={3} />
          </div>
        )}
        {!state && (
          <ActivityFeed className='border-t pt-4 [--activity-marker:0.75rem]'>
            {updates.map((update, index) => (
              <ActivityFeedItem
                key={`${update.stage}-${update.time}`}
                connector
                className='pb-5 last:pb-0'
              >
                <span
                  aria-hidden
                  className={cn(
                    'ring-background relative mt-1 size-(--activity-marker) shrink-0 rounded-full ring-4',
                    index === 0 ? 'bg-foreground' : 'bg-muted-foreground/40',
                  )}
                />
                <div className='flex min-w-0 flex-col gap-1'>
                  <p className='flex flex-wrap items-baseline gap-x-2 text-sm'>
                    <span className='font-medium'>{update.stage}</span>
                    <span className='text-muted-foreground text-xs tabular-nums'>
                      {update.time}
                    </span>
                  </p>
                  <p className='text-muted-foreground text-sm text-pretty'>
                    {update.message}
                  </p>
                </div>
              </ActivityFeedItem>
            ))}
          </ActivityFeed>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Status3, exampleProps as status3ExampleProps, type Status3Props }
