'use client'

import {
  type AppNotification,
  NotificationBell,
  NotificationItem,
  NotificationList,
  NotificationsHeader,
} from '@/registry/components/dashboardblocks/notifications'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Decision = 'approved' | 'declined'

interface ActionableNotification extends AppNotification {
  request?: { approve: string; decline: string }
}

interface Notifications2Props {
  notifications: ActionableNotification[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onDecide?: (id: string, decision: Decision) => Promise<void>
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const minutesAgo = (minutes: number) => new Date(exampleNow.getTime() - minutes * 60_000)

const exampleProps: Notifications2Props = {
  notifications: [
    {
      at: minutesAgo(8),
      icon: (
        <IconPlaceholder
          lucide='UserPlusIcon'
          tabler='IconUserPlus'
          hugeicons='UserAdd01Icon'
          phosphor='UserPlusIcon'
          remixicon='RiUserAddLine'
        />
      ),
      id: '1',
      read: false,
      request: { approve: 'Approve', decline: 'Decline' },
      title: (
        <>
          <span className='font-medium'>Sam Rivera</span> asked to join Acme Store
        </>
      ),
      tone: 'accent',
    },
    {
      at: minutesAgo(55),
      body: 'Order #0931 · Item arrived damaged',
      icon: (
        <IconPlaceholder
          lucide='CreditCardIcon'
          tabler='IconCreditCard'
          hugeicons='CreditCardIcon'
          phosphor='CreditCardIcon'
          remixicon='RiBankCardLine'
        />
      ),
      id: '2',
      read: false,
      request: { approve: 'Refund', decline: 'Reject' },
      title: 'Refund of $94.50 requested',
      tone: 'warning',
    },
    {
      at: minutesAgo(240),
      body: '“Looks good, shipping it tomorrow.”',
      icon: (
        <IconPlaceholder
          lucide='MessageSquareIcon'
          tabler='IconMessage'
          hugeicons='MessageIcon'
          phosphor='ChatCircleIcon'
          remixicon='RiChat1Line'
        />
      ),
      id: '3',
      read: true,
      title: (
        <>
          <span className='font-medium'>Lena Fischer</span> replied to your comment
        </>
      ),
      tone: 'info',
    },
  ],
  now: exampleNow,
}

async function saveDecision() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const Notifications2 = (props: Notifications2Props) => {
  const { notifications: initial, now, onDecide = saveDecision } = props
  const [notifications, setNotifications] = useState(initial)
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [pending, setPending] = useState<string | null>(null)
  const [tab, setTab] = useState<'all' | 'requests'>('all')
  const unread = notifications.filter((notification) => !notification.read).length
  const requests = notifications.filter(
    (notification) => notification.request && !decisions[notification.id],
  )

  function markRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    )
  }

  async function decide(id: string, decision: Decision) {
    setPending(id)
    try {
      await onDecide(id, decision)
      setDecisions((current) => ({ ...current, [id]: decision }))
      markRead(id)
    } finally {
      setPending(null)
    }
  }

  function renderList(items: ActionableNotification[], empty: string) {
    if (items.length === 0) {
      return (
        <p className='text-muted-foreground px-4 py-10 text-center text-sm'>{empty}</p>
      )
    }
    return (
      <NotificationList className='max-h-96 overflow-y-auto'>
        {items.map((notification) => {
          const decision = decisions[notification.id]
          const { request } = notification
          return (
            <NotificationItem
              key={notification.id}
              notification={notification}
              now={now}
              onOpen={() => markRead(notification.id)}
              actions={
                request &&
                (decision ? (
                  <p className='text-muted-foreground text-sm' role='status'>
                    {decision === 'approved' ? 'Approved' : 'Declined'}
                  </p>
                ) : (
                  <>
                    <Button
                      size='sm'
                      disabled={pending === notification.id}
                      onClick={() => void decide(notification.id, 'approved')}
                    >
                      {request.approve}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={pending === notification.id}
                      onClick={() => void decide(notification.id, 'declined')}
                    >
                      {request.decline}
                    </Button>
                  </>
                ))
              }
            />
          )
        })}
      </NotificationList>
    )
  }

  return (
    <div className='bg-card text-card-foreground flex items-center justify-between rounded-xl px-4 py-2 ring-1 ring-foreground/10'>
      <span className='text-sm font-medium'>Dashboard</span>
      <NotificationBell unreadCount={unread}>
        <NotificationsHeader />
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'all' | 'requests')}>
          <TabsList className='mx-4 mb-2'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='requests'>
              Requests
              {requests.length > 0 && (
                <span className='text-muted-foreground tabular-nums'>
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='all' className='border-t'>
            {renderList(notifications, 'You’re all caught up.')}
          </TabsContent>
          <TabsContent value='requests' className='border-t'>
            {renderList(requests, 'No requests waiting for you.')}
          </TabsContent>
        </Tabs>
      </NotificationBell>
    </div>
  )
}

export {
  Notifications2,
  exampleProps as notifications2ExampleProps,
  type Notifications2Props,
}
