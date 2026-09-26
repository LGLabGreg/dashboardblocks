'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityTime,
  UnreadDot,
} from '@/registry/components/dashboardblocks/activity-feed'
import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Notification {
  /** "mentioned you in", "assigned you". */
  action: string
  actor: Pick<Person, 'avatar' | 'name'>
  at: Date
  id: string
  /** Mentions get their own tab. */
  mention?: boolean
  /** A line of the comment or message. */
  preview?: string
  read?: boolean
  target: string
}

interface ActivityFeed03Props {
  /** Newest first. */
  notifications: Notification[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** Called with the ids marked read. */
  onRead?: (ids: string[]) => void
  /** Time zone for times. @default 'UTC' */
  timeZone?: string
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: ActivityFeed03Props = {
  notifications: [
    {
      action: 'mentioned you in',
      actor: { name: 'Priya Nair' },
      at: minutesAgo(3),
      id: 'n1',
      mention: true,
      preview: 'Can you check the copy on the annual plan before we ship?',
      target: 'Q4 pricing page',
    },
    {
      action: 'assigned you',
      actor: { name: 'Tomás Rivera' },
      at: minutesAgo(26),
      id: 'n2',
      target: 'Fix invoice rounding',
    },
    {
      action: 'replied to your comment on',
      actor: { name: 'Mei Tanaka' },
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

const ActivityFeed03 = (props: ActivityFeed03Props) => {
  const { notifications, now, onRead, timeZone = 'UTC', title } = props
  const [filter, setFilter] = useState<Filter>('all')
  const [read, setRead] = useState(
    () => new Set(notifications.filter((item) => item.read).map((item) => item.id)),
  )

  const unread = notifications.filter((item) => !read.has(item.id))
  const markRead = (ids: string[]) => {
    const fresh = ids.filter((id) => !read.has(id))
    if (fresh.length === 0) return
    setRead(new Set([...read, ...fresh]))
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button
            disabled={unread.length === 0}
            onClick={() => markRead(unread.map((item) => item.id))}
            size='sm'
            variant='ghost'
          >
            Mark all as read
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList className='mb-2'>
            {filters.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
                {item.value === 'unread' && unread.length > 0 && (
                  <span className='bg-primary text-primary-foreground ml-1.5 rounded-full px-1.5 text-[10px] leading-4 font-semibold tabular-nums'>
                    {unread.length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {filters.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {item.items.length === 0 ? (
                <p className='text-muted-foreground py-8 text-center text-sm'>
                  {item.value === 'unread'
                    ? "You're all caught up."
                    : 'Nothing here yet.'}
                </p>
              ) : (
                <ActivityFeed className='-mx-2'>
                  {item.items.map((notification) => {
                    const isUnread = !read.has(notification.id)
                    return (
                      <ActivityFeedItem key={notification.id}>
                        <button
                          type='button'
                          onClick={() => markRead([notification.id])}
                          className='hover:bg-muted/60 focus-visible:ring-ring/50 flex w-full items-start gap-3 rounded-lg p-2 text-left outline-none focus-visible:ring-[3px]'
                        >
                          <PersonAvatar person={notification.actor} />
                          <span className='flex min-w-0 flex-1 flex-col gap-1'>
                            <span className='text-sm'>
                              <span className='font-medium'>
                                {notification.actor.name}
                              </span>{' '}
                              <span className='text-muted-foreground'>
                                {notification.action}
                              </span>{' '}
                              <span className='font-medium'>{notification.target}</span>
                            </span>
                            {notification.preview && (
                              <span className='text-muted-foreground line-clamp-2 text-sm'>
                                {notification.preview}
                              </span>
                            )}
                            <ActivityTime
                              date={notification.at}
                              now={now}
                              timeZone={timeZone}
                            />
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
      </CardContent>
    </Card>
  )
}

export {
  ActivityFeed03,
  exampleProps as activityFeed03ExampleProps,
  type ActivityFeed03Props,
  type Notification,
}
