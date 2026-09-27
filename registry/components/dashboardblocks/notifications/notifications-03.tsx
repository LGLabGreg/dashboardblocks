'use client'

import { groupActivityByDay } from '@/registry/components/dashboardblocks/activity-feed'
import {
  type AppNotification,
  NotificationItem,
  NotificationList,
} from '@/registry/components/dashboardblocks/notifications'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface InboxNotification extends AppNotification {
  mention?: boolean
}

type Filter = 'all' | 'unread' | 'mentions'

interface Notifications3Props {
  notifications: InboxNotification[]
  /** Pass a fixed date, so times and day headings render the same on the server and in the browser. */
  now: Date
  /** @default 'UTC' */
  timeZone?: string
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)

const mentionIcon = (
  <IconPlaceholder
    lucide='AtSignIcon'
    tabler='IconAt'
    hugeicons='AtIcon'
    phosphor='AtIcon'
    remixicon='RiAtLine'
  />
)

const exampleProps: Notifications3Props = {
  notifications: [
    {
      at: hoursAgo(0.2),
      body: '“@Amara can you check the refund flow before release?”',
      icon: mentionIcon,
      id: '1',
      mention: true,
      read: false,
      title: (
        <>
          <span className='font-medium'>Priya Nair</span> mentioned you in TCK-381
        </>
      ),
      tone: 'info',
    },
    {
      at: hoursAgo(1.5),
      icon: (
        <IconPlaceholder
          lucide='TriangleAlertIcon'
          tabler='IconAlertTriangle'
          hugeicons='Alert02Icon'
          phosphor='WarningIcon'
          remixicon='RiErrorWarningLine'
        />
      ),
      id: '2',
      read: false,
      title: 'Deploy to production failed on the migration step',
      tone: 'danger',
    },
    {
      at: hoursAgo(5),
      icon: (
        <IconPlaceholder
          lucide='CircleCheckIcon'
          tabler='IconCircleCheckFilled'
          hugeicons='CheckmarkCircle01Icon'
          phosphor='CheckCircleIcon'
          remixicon='RiCheckboxCircleFill'
        />
      ),
      id: '3',
      read: true,
      title: 'Weekly revenue report is ready',
      tone: 'success',
    },
    {
      at: hoursAgo(28),
      body: '“Moved the launch to Thursday, see the updated plan.”',
      icon: mentionIcon,
      id: '4',
      mention: true,
      read: true,
      title: (
        <>
          <span className='font-medium'>Lena Fischer</span> mentioned you in Launch plan
        </>
      ),
      tone: 'info',
    },
    {
      at: hoursAgo(31),
      icon: (
        <IconPlaceholder
          lucide='CreditCardIcon'
          tabler='IconCreditCard'
          hugeicons='CreditCardIcon'
          phosphor='CreditCardIcon'
          remixicon='RiBankCardLine'
        />
      ),
      id: '5',
      read: false,
      title: 'Invoice INV-2026-09 for $1,240.00 was paid',
      tone: 'neutral',
    },
  ],
  now: exampleNow,
}

const Notifications3 = (props: Notifications3Props) => {
  const { notifications: initial, now, timeZone = 'UTC' } = props
  const [notifications, setNotifications] = useState(initial)
  const [filter, setFilter] = useState<Filter>('all')
  const unread = notifications.filter((notification) => !notification.read).length

  const filters: { items: InboxNotification[]; label: string; value: Filter }[] = [
    { items: notifications, label: 'All', value: 'all' },
    {
      items: notifications.filter((notification) => !notification.read),
      label: 'Unread',
      value: 'unread',
    },
    {
      items: notifications.filter((notification) => notification.mention),
      label: 'Mentions',
      value: 'mentions',
    },
  ]

  function setRead(ids: string[], read: boolean) {
    setNotifications((current) =>
      current.map((notification) =>
        ids.includes(notification.id) ? { ...notification, read } : notification,
      ),
    )
  }

  function archive(id: string) {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
        <CardDescription>
          {unread > 0 ? `${unread} unread` : 'All caught up'}
        </CardDescription>
        <CardAction>
          <Button
            variant='outline'
            size='sm'
            disabled={unread === 0}
            onClick={() =>
              setRead(
                notifications.map((notification) => notification.id),
                true,
              )
            }
          >
            Mark all as read
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='px-0'>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList className='mx-6 mb-2'>
            {filters.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {filters.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {item.items.length === 0 ? (
                <p className='text-muted-foreground py-12 text-center text-sm'>
                  Nothing here.
                </p>
              ) : (
                groupActivityByDay(item.items, now, timeZone).map((group) => (
                  <section key={group.key} aria-labelledby={`${item.value}-${group.key}`}>
                    <h3
                      id={`${item.value}-${group.key}`}
                      className='text-muted-foreground bg-muted/40 border-y px-6 py-1.5 text-xs font-medium'
                    >
                      {group.label}
                    </h3>
                    <NotificationList label={group.label}>
                      {group.items.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          className='px-6'
                          notification={notification}
                          now={now}
                          onOpen={() => setRead([notification.id], true)}
                          trailing={
                            <div className='flex gap-1'>
                              <Button
                                variant='ghost'
                                size='icon-sm'
                                aria-label={
                                  notification.read ? 'Mark as unread' : 'Mark as read'
                                }
                                onClick={() =>
                                  setRead([notification.id], !notification.read)
                                }
                              >
                                {notification.read ? (
                                  <IconPlaceholder
                                    lucide='MailIcon'
                                    tabler='IconMail'
                                    hugeicons='MailIcon'
                                    phosphor='EnvelopeIcon'
                                    remixicon='RiMailLine'
                                  />
                                ) : (
                                  <IconPlaceholder
                                    lucide='MailOpenIcon'
                                    tabler='IconMailOpened'
                                    hugeicons='MailOpen01Icon'
                                    phosphor='EnvelopeOpenIcon'
                                    remixicon='RiMailOpenLine'
                                  />
                                )}
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon-sm'
                                aria-label='Archive'
                                onClick={() => archive(notification.id)}
                              >
                                <IconPlaceholder
                                  lucide='ArchiveIcon'
                                  tabler='IconArchive'
                                  hugeicons='Archive01Icon'
                                  phosphor='ArchiveIcon'
                                  remixicon='RiArchiveLine'
                                />
                              </Button>
                            </div>
                          }
                        />
                      ))}
                    </NotificationList>
                  </section>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export {
  Notifications3,
  exampleProps as notifications3ExampleProps,
  type Notifications3Props,
}
