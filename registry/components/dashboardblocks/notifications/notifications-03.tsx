'use client'

import { groupActivityByDay } from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { NavTag } from '@/registry/components/dashboardblocks/nav-tag'
import {
  type AppNotification,
  NotificationItem,
  NotificationList,
} from '@/registry/components/dashboardblocks/notifications'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface InboxNotification extends AppNotification {
  mention?: boolean
}

type Filter = 'all' | 'unread' | 'mentions'

interface Notifications3Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  notifications?: InboxNotification[]
  /** Pass a fixed date, so times and day headings render the same on the server and in the browser. */
  now: Date
  /** @default 'UTC' */
  timeZone?: string
  title: string
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
  title: 'Inbox',
}

const Notifications3 = (props: Notifications3Props) => {
  const {
    notifications: loaded = [],
    now,
    errorMessage,
    status,
    timeZone = 'UTC',
    title,
  } = props
  const [readOverrides, setReadOverrides] = useState<ReadonlyMap<string, boolean>>(
    () => new Map(),
  )
  const [archived, setArchived] = useState<ReadonlySet<string>>(() => new Set())
  const [filter, setFilter] = useState<Filter>('all')
  const state = getBlockState(status, loaded)
  const notifications = loaded
    .filter((notification) => !archived.has(notification.id))
    .map((notification) => ({
      ...notification,
      read: readOverrides.get(notification.id) ?? notification.read,
    }))
  const unread = notifications.filter((notification) => !notification.read).length
  const unreadMentions = notifications.filter(
    (notification) => !notification.read && notification.mention,
  ).length

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
    setReadOverrides((current) => {
      const next = new Map(current)
      for (const id of ids) next.set(id, read)
      return next
    })
  }

  function archive(id: string) {
    setArchived((current) => new Set(current).add(id))
  }

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>
                {unread === 0
                  ? 'You’re all caught up.'
                  : `${unread} unread${unreadMentions > 0 ? `, ${unreadMentions} mentioning you` : ''}.`}
              </p>
            </BlockReady>
          </div>
          <Button
            variant='outline'
            size='sm'
            disabled={Boolean(state) || unread === 0}
            onClick={() =>
              setRead(
                notifications.map((notification) => notification.id),
                true,
              )
            }
          >
            <IconPlaceholder
              lucide='CheckCheckIcon'
              tabler='IconChecks'
              hugeicons='TickDouble02Icon'
              phosphor='ChecksIcon'
              remixicon='RiCheckDoubleLine'
              data-icon='inline-start'
            />
            Mark all as read
          </Button>
        </header>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList>
            {filters.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
                {!state && item.value !== 'all' && item.items.length > 0 && (
                  <NavTag>{formatNumber(item.items.length)}</NavTag>
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
                <p className='text-muted-foreground border-t py-12 text-center text-sm'>
                  {item.value === 'unread'
                    ? 'You’re all caught up.'
                    : 'Nothing here yet.'}
                </p>
              ) : (
                groupActivityByDay(item.items, now, timeZone).map((group) => (
                  <section key={group.key} aria-labelledby={`${item.value}-${group.key}`}>
                    <h3
                      id={`${item.value}-${group.key}`}
                      className='text-muted-foreground border-b pt-4 pb-2 text-xs font-medium'
                    >
                      {group.label}
                    </h3>
                    <NotificationList label={group.label}>
                      {group.items.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          className='px-2'
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
      </section>
    </BlockStateProvider>
  )
}

export {
  Notifications3,
  exampleProps as notifications3ExampleProps,
  type Notifications3Props,
}
