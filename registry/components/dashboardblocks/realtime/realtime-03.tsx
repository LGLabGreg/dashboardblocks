'use client'

import {
  LiveBadge,
  createRandom,
  formatAgo,
  useInterval,
} from '@/registry/components/dashboardblocks/realtime'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

type LiveEventKind = 'order' | 'signup' | 'refund' | 'message'

interface LiveEvent {
  at: Date
  detail: string
  id: string
  kind: LiveEventKind
  label: string
}

interface Realtime3Props {
  description: string
  /** Newest first. */
  events: LiveEvent[]
  /** How many events to keep. @default 6 */
  limit?: number
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** Makes up new events, for demos. Replace with your own feed. */
  simulate?: boolean
  title: string
}

const kindConfig: Record<LiveEventKind, { className: string; icon: ReactNode }> = {
  message: {
    className: 'bg-muted text-muted-foreground',
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
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
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
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
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
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
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
  description: 'Orders, sign-ups, refunds and messages as they happen',
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
  const { description, limit = 6, simulate = false, title } = props
  const [events, setEvents] = useState(props.events.slice(0, limit))
  const [now, setNow] = useState(props.now)
  const [paused, setPaused] = useState(false)
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
    simulate && !paused ? 2_500 : null,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className='flex items-center gap-2'>
          <LiveBadge paused={paused} />
          <Button
            size='sm'
            variant='outline'
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? 'Resume' : 'Pause'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ol className='flex flex-col'>
          {events.map((event, index) => {
            const config = kindConfig[event.kind]
            return (
              <li
                key={event.id}
                className={cn(
                  'flex items-center gap-3 border-b py-2.5 last:border-b-0',
                  index === 0 &&
                    event.id.startsWith('live-') &&
                    'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4',
                    config.className,
                  )}
                >
                  {config.icon}
                </span>
                <div className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-sm font-medium'>{event.label}</span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {event.detail}
                  </span>
                </div>
                <time
                  className='text-muted-foreground shrink-0 text-xs tabular-nums'
                  dateTime={event.at.toISOString()}
                >
                  {formatAgo(event.at, now)}
                </time>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

export {
  Realtime3,
  exampleProps as realtime3ExampleProps,
  type LiveEvent,
  type Realtime3Props,
}
