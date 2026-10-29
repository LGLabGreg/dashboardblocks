'use client'

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
  NotificationBell,
  NotificationItem,
  NotificationList,
  NotificationsHeader,
} from '@/registry/components/dashboardblocks/notifications'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import { startTransition, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Decision = 'approved' | 'declined'

interface ActionableNotification extends AppNotification {
  request?: { approve: string; decline: string }
}

interface Notifications2Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  notifications?: ActionableNotification[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onDecide?: (id: string, decision: Decision) => Promise<void>
  title: string
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
          <span className='font-medium'>Priya Nair</span> asked to join Acme Store
        </>
      ),
      tone: 'accent',
    },
    {
      at: minutesAgo(55),
      body: 'Item arrived damaged on order #0931.',
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
  title: 'Dashboard',
}

async function saveDecision() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const Notifications2 = (props: Notifications2Props) => {
  const {
    notifications: loaded = [],
    now,
    onDecide = saveDecision,
    errorMessage,
    status,
    title,
  } = props
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set())
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [pending, setPending] = useState<string | null>(null)
  const [tab, setTab] = useState<'all' | 'requests'>('all')
  const state = getBlockState(status, loaded)
  const notifications = loaded.map((notification) =>
    readIds.has(notification.id) ? { ...notification, read: true } : notification,
  )
  const unread = state
    ? 0
    : notifications.filter((notification) => !notification.read).length
  const requests = state
    ? []
    : notifications.filter(
        (notification) => notification.request && !decisions[notification.id],
      )

  function markRead(id: string) {
    setReadIds((current) => new Set(current).add(id))
  }

  async function decide(id: string, decision: Decision) {
    setPending(id)
    try {
      await onDecide(id, decision)
      startTransition(() => {
        setDecisions((current) => ({ ...current, [id]: decision }))
        markRead(id)
      })
    } finally {
      startTransition(() => setPending(null))
    }
  }

  function renderList(items: ActionableNotification[], empty: string) {
    if (state) {
      return (
        <div className='px-4'>
          <BlockStateRows rows={3} />
        </div>
      )
    }
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
                  <p role='status'>
                    <StatusLabel tone={decision === 'approved' ? 'good' : 'neutral'}>
                      {decision === 'approved' ? 'Approved' : 'Declined'}
                    </StatusLabel>
                  </p>
                ) : (
                  <>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={pending === notification.id}
                      onClick={() => void decide(notification.id, 'approved')}
                    >
                      {request.approve}
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
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
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex items-center justify-between gap-3'>
        <h2 className='font-semibold tracking-tight'>{title}</h2>
        <NotificationBell unreadCount={unread}>
          <NotificationsHeader
            description={
              <BlockReady>
                {requests.length > 0
                  ? `${requests.length} ${requests.length === 1 ? 'request is' : 'requests are'} waiting on you.`
                  : 'No requests waiting on you.'}
              </BlockReady>
            }
          />
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as 'all' | 'requests')}
          >
            <TabsList className='mx-4 mb-2'>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='requests'>
                Requests
                {requests.length > 0 && <NavTag>{formatNumber(requests.length)}</NavTag>}
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
      </section>
    </BlockStateProvider>
  )
}

export {
  Notifications2,
  exampleProps as notifications2ExampleProps,
  type Notifications2Props,
}
