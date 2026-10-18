'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityTime,
  UnreadDot,
} from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { cn } from '@/lib/utils'

interface Notification {
  action: string
  actor: Pick<Person, 'avatar' | 'name'>
  at: Date
  id: string
  mention?: boolean
  preview?: string
  read?: boolean
  target: string
}

interface ActivityFeed3Props {
  /** Newest first. Leave out, or pass none, to show the empty state. */
  notifications?: Notification[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onRead?: (ids: string[]) => void
  status?: BlockStatus
  timeZone?: string
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: ActivityFeed3Props = {
  notifications: [
    {
      action: 'mentioned you in',
      actor: { avatar: '/images/avatar-02.webp', name: 'Priya Nair' },
      at: minutesAgo(3),
      id: 'n1',
      mention: true,
      preview: 'Can you check the copy on the annual plan before we ship?',
      target: 'Q4 pricing page',
    },
    {
      action: 'assigned you',
      actor: { name: 'Kenji Watanabe' },
      at: minutesAgo(26),
      id: 'n2',
      target: 'Fix invoice rounding',
    },
    {
      action: 'replied to your comment on',
      actor: { avatar: '/images/avatar-04.webp', name: 'Mei Tanaka' },
      at: minutesAgo(80),
      id: 'n3',
      preview: 'Good catch, updated the empty state.',
      target: 'Onboarding flow',
    },
    {
      action: 'mentioned you in',
      actor: { name: 'Jonah Fischer' },
      at: minutesAgo(60 * 7),
      id: 'n4',
      mention: true,
      read: true,
      target: 'Launch plan',
    },
    {
      action: 'shared a file with you',
      actor: { name: 'Amara Okafor' },
      at: minutesAgo(60 * 26),
      id: 'n5',
      read: true,
      target: 'Brand guidelines.pdf',
    },
  ],
  now: NOW,
  title: 'Notifications',
}

type Filter = 'all' | 'mentions' | 'unread'

const describe = (unread: Notification[]) => {
  if (unread.length === 0) return "You're all caught up."
  const mentions = unread.filter((item) => item.mention).length
  const count = `${unread.length} unread`
  return mentions === 0 ? `${count}.` : `${count}, ${mentions} mentioning you.`
}

const ActivityFeed3 = (props: ActivityFeed3Props) => {
  const { notifications = [], now, onRead, status, timeZone = 'UTC', title } = props
  const [filter, setFilter] = useState<Filter>('all')
  const [markedRead, setMarkedRead] = useState<ReadonlySet<string>>(() => new Set())
  const state = getBlockState(status, notifications.length === 0)

  const isRead = (item: Notification) => item.read || markedRead.has(item.id)
  const unread = notifications.filter((item) => !isRead(item))
  const markRead = (ids: string[]) => {
    const fresh = ids.filter((id) => unread.some((item) => item.id === id))
    if (fresh.length === 0) return
    setMarkedRead(new Set([...markedRead, ...fresh]))
    onRead?.(fresh)
  }

  const filters: { items: Notification[]; label: string; value: Filter }[] = [
    { items: notifications, label: 'All', value: 'all' },
    {
      items: notifications.filter((item) => item.mention),
      label: 'Mentions',
      value: 'mentions',
    },
    { items: unread, label: 'Unread', value: 'unread' },
  ]

  return (
    <BlockStateProvider status={status} empty={notifications.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{describe(unread)}</p>
            </BlockReady>
          </div>
          <Button
            disabled={Boolean(state) || unread.length === 0}
            onClick={() => markRead(unread.map((item) => item.id))}
            size='sm'
            variant='ghost'
          >
            Mark all as read
          </Button>
        </header>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList>
            {filters.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
                {!state && item.value !== 'all' && item.items.length > 0 && (
                  <span className='text-muted-foreground tabular-nums'>
                    {item.items.length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {filters.map((item) => (
            <TabsContent key={item.value} value={item.value} className='mt-2'>
              {state ? (
                <div className='border-t'>
                  <BlockStateRows rows={5} />
                </div>
              ) : item.items.length === 0 ? (
                <p className='text-muted-foreground border-t py-8 text-center text-sm'>
                  {item.value === 'unread'
                    ? "You're all caught up."
                    : 'Nothing here yet.'}
                </p>
              ) : (
                <ActivityFeed className='border-t'>
                  {item.items.map((notification) => {
                    const isUnread = !isRead(notification)
                    return (
                      <ActivityFeedItem key={notification.id} className='border-b'>
                        <button
                          type='button'
                          onClick={() => markRead([notification.id])}
                          className='hover:bg-muted/50 focus-visible:ring-ring/50 flex w-full items-start gap-3 px-2 py-3 text-left outline-none focus-visible:ring-[3px]'
                        >
                          <PersonAvatar person={notification.actor} />
                          <span className='flex min-w-0 flex-1 flex-col gap-1'>
                            <span className='flex items-baseline justify-between gap-3'>
                              <span
                                className={cn(
                                  'text-sm',
                                  !isUnread && 'text-muted-foreground',
                                )}
                              >
                                <span className='font-medium'>
                                  {notification.actor.name}
                                </span>{' '}
                                <span className='text-muted-foreground'>
                                  {notification.action}
                                </span>{' '}
                                <span className='font-medium'>{notification.target}</span>
                              </span>
                              <ActivityTime
                                className='tabular-nums'
                                date={notification.at}
                                now={now}
                                timeZone={timeZone}
                              />
                            </span>
                            {notification.preview && (
                              <span className='text-muted-foreground border-l-2 pl-2 text-sm'>
                                <span className='line-clamp-2'>
                                  {notification.preview}
                                </span>
                              </span>
                            )}
                          </span>
                          <span className='flex h-5 w-2 items-center'>
                            {isUnread && <UnreadDot />}
                          </span>
                        </button>
                      </ActivityFeedItem>
                    )
                  })}
                </ActivityFeed>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </BlockStateProvider>
  )
}

export {
  ActivityFeed3,
  exampleProps as activityFeed3ExampleProps,
  type ActivityFeed3Props,
  type Notification,
}
