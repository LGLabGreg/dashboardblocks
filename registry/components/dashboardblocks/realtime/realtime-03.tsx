'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityIcon,
  type ActivityTone,
} from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  LiveBadge,
  createRandom,
  formatAgo,
  useInterval,
} from '@/registry/components/dashboardblocks/realtime'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

type LiveEventKind = 'order' | 'signup' | 'refund' | 'message'

interface LiveEvent {
  at: Date
  detail: string
  id: string
  kind: LiveEventKind
  label: string
}

interface Realtime3Props extends BlockStateProps {
  description: string
  /** Newest first. Leave out, or pass none, to show the empty state. */
  events?: LiveEvent[]
  limit?: number
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  simulate?: boolean
  title: string
}

const noEvents: LiveEvent[] = []

const kindConfig: Record<LiveEventKind, { icon: ReactNode; tone: ActivityTone }> = {
  message: {
    tone: 'neutral',
    icon: (
      <IconPlaceholder
        lucide='MessageSquareIcon'
        tabler='IconMessage'
        hugeicons='MessageIcon'
        phosphor='ChatCircleIcon'
        remixicon='RiChat1Line'
        aria-hidden
      />
    ),
  },
  order: {
    tone: 'success',
    icon: (
      <IconPlaceholder
        lucide='CreditCardIcon'
        tabler='IconCreditCard'
        hugeicons='CreditCardIcon'
        phosphor='CreditCardIcon'
        remixicon='RiBankCardLine'
        aria-hidden
      />
    ),
  },
  refund: {
    tone: 'warning',
    icon: (
      <IconPlaceholder
        lucide='Undo2Icon'
        tabler='IconArrowBackUp'
        hugeicons='Undo02Icon'
        phosphor='ArrowUUpLeftIcon'
        remixicon='RiArrowGoBackLine'
        aria-hidden
      />
    ),
  },
  signup: {
    tone: 'info',
    icon: (
      <IconPlaceholder
        lucide='UserPlusIcon'
        tabler='IconUserPlus'
        hugeicons='UserAdd01Icon'
        phosphor='UserPlusIcon'
        remixicon='RiUserAddLine'
        aria-hidden
      />
    ),
  },
}

const NOW = new Date(Date.UTC(2026, 8, 26, 14, 30, 0))
const secondsAgo = (seconds: number) => new Date(NOW.getTime() - seconds * 1000)

const exampleProps: Realtime3Props = {
  description: 'Every order, sign-up, refund and support chat as it happens.',
  events: [
    {
      at: secondsAgo(3),
      detail: '$84.00, 2 items',
      id: 'e6',
      kind: 'order',
      label: 'Order #10482',
    },
    {
      at: secondsAgo(18),
      detail: 'Pro trial, from Google',
      id: 'e5',
      kind: 'signup',
      label: 'New sign-up',
    },
    {
      at: secondsAgo(41),
      detail: '"Can I change my plan mid-cycle?"',
      id: 'e4',
      kind: 'message',
      label: 'Support chat',
    },
    {
      at: secondsAgo(75),
      detail: '$212.50, 5 items',
      id: 'e3',
      kind: 'order',
      label: 'Order #10481',
    },
    {
      at: secondsAgo(130),
      detail: '$39.00, damaged in transit',
      id: 'e2',
      kind: 'refund',
      label: 'Refund #3310',
    },
    {
      at: secondsAgo(205),
      detail: 'Team plan, from a referral',
      id: 'e1',
      kind: 'signup',
      label: 'New sign-up',
    },
  ],
  now: NOW,
  simulate: true,
  title: 'Live activity',
}

const DEMO: Omit<LiveEvent, 'at' | 'id'>[] = [
  { detail: '$56.00, 1 item', kind: 'order', label: 'Order' },
  { detail: 'Starter plan, from search', kind: 'signup', label: 'New sign-up' },
  { detail: '$129.00, 3 items', kind: 'order', label: 'Order' },
  { detail: '"Do you support SSO?"', kind: 'message', label: 'Support chat' },
  { detail: '$18.00, wrong size', kind: 'refund', label: 'Refund' },
]

const Realtime3 = (props: Realtime3Props) => {
  const {
    description,
    events: loadedEvents = noEvents,
    limit = 6,
    simulate = false,
    errorMessage,
    status,
    title,
  } = props
  const [events, setEvents] = useState(() => loadedEvents.slice(0, limit))
  const [loaded, setLoaded] = useState(loadedEvents)
  if (loadedEvents !== loaded) {
    setLoaded(loadedEvents)
    setEvents(loadedEvents.slice(0, limit))
  }
  const [now, setNow] = useState(props.now)
  const [paused, setPaused] = useState(false)
  const state = getBlockState(status, events)
  const random = useRef(createRandom(5))
  const count = useRef(0)

  useInterval(
    () => {
      const next = new Date(now.getTime() + 2_500)
      setNow(next)
      if (random.current() < 0.6) return
      count.current += 1
      const template = DEMO[count.current % DEMO.length]
      const label =
        template.kind === 'order' ? `Order #${10_482 + count.current}` : template.label
      setEvents((list) =>
        [{ ...template, at: next, id: `live-${count.current}`, label }, ...list].slice(
          0,
          limit,
        ),
      )
    },
    simulate && !paused && !state ? 2_500 : null,
  )

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {!state && <LiveBadge paused={paused} />}
            <Button
              disabled={Boolean(state)}
              size='sm'
              variant='outline'
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? (
                <IconPlaceholder
                  lucide='PlayIcon'
                  tabler='IconPlayerPlayFilled'
                  hugeicons='PlayIcon'
                  phosphor='PlayIcon'
                  remixicon='RiPlayFill'
                  className='fill-current'
                  data-icon='inline-start'
                />
              ) : (
                <IconPlaceholder
                  lucide='PauseIcon'
                  tabler='IconPlayerPauseFilled'
                  hugeicons='PauseIcon'
                  phosphor='PauseIcon'
                  remixicon='RiPauseFill'
                  className='fill-current'
                  data-icon='inline-start'
                />
              )}
              {paused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        </header>
        {state && (
          <div className='border-t'>
            <BlockStateRows rows={limit} />
          </div>
        )}
        {!state && (
          <ActivityFeed className='border-t pt-1'>
            {events.map((event, index) => {
              const config = kindConfig[event.kind]
              return (
                <ActivityFeedItem
                  key={event.id}
                  className={cn(
                    'items-center border-b py-2.5 last:border-b-0',
                    index === 0 &&
                      event.id.startsWith('live-') &&
                      'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1',
                  )}
                >
                  <ActivityIcon icon={config.icon} tone={config.tone} />
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-medium'>{event.label}</span>
                    <span className='text-muted-foreground truncate text-sm'>
                      {event.detail}
                    </span>
                  </div>
                  <time
                    className='text-muted-foreground shrink-0 text-xs tabular-nums'
                    dateTime={event.at.toISOString()}
                  >
                    {formatAgo(event.at, now)}
                  </time>
                </ActivityFeedItem>
              )
            })}
          </ActivityFeed>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Realtime3,
  exampleProps as realtime3ExampleProps,
  type LiveEvent,
  type Realtime3Props,
}
