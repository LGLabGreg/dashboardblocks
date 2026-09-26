'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityIcon,
  ActivityTime,
  type ActivityTone,
} from '@/registry/components/dashboardblocks/activity-feed'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type HistoryKind =
  | 'created'
  | 'assigned'
  | 'changed'
  | 'labelled'
  | 'commented'
  | 'resolved'

interface HistoryEvent {
  /** "opened this ticket", "changed the status". */
  action: string
  actor: string
  at: Date
  /** A value that changed, shown as from → to. */
  change?: { from: string; to: string }
  /** The text of a comment. */
  comment?: string
  id: string
  kind: HistoryKind
}

interface ActivityFeed02Props {
  description: string
  /** Oldest first, so the history reads as a story. */
  events: HistoryEvent[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** The record's current state, e.g. "Resolved". */
  status: string
  /** Time zone for times. @default 'UTC' */
  timeZone?: string
  title: string
}

const kindConfig: Record<HistoryKind, { icon: ReactNode; tone: ActivityTone }> = {
  assigned: {
    icon: (
      <IconPlaceholder
        lucide='UserCheckIcon'
        tabler='IconUserCheck'
        hugeicons='UserCheck01Icon'
        phosphor='UserCheckIcon'
        remixicon='RiUserFollowLine'
      />
    ),
    tone: 'info',
  },
  changed: {
    icon: (
      <IconPlaceholder
        lucide='ArrowRightIcon'
        tabler='IconArrowRight'
        hugeicons='ArrowRight01Icon'
        phosphor='ArrowRightIcon'
        remixicon='RiArrowRightLine'
      />
    ),
    tone: 'accent',
  },
  commented: {
    icon: (
      <IconPlaceholder
        lucide='MessageSquareIcon'
        tabler='IconMessage'
        hugeicons='MessageIcon'
        phosphor='ChatCircleIcon'
        remixicon='RiChat1Line'
      />
    ),
    tone: 'neutral',
  },
  created: {
    icon: (
      <IconPlaceholder
        lucide='CirclePlusIcon'
        tabler='IconCirclePlus'
        hugeicons='AddCircleIcon'
        phosphor='PlusCircleIcon'
        remixicon='RiAddCircleLine'
      />
    ),
    tone: 'neutral',
  },
  labelled: {
    icon: (
      <IconPlaceholder
        lucide='TagIcon'
        tabler='IconTag'
        hugeicons='Tag01Icon'
        phosphor='TagIcon'
        remixicon='RiPriceTag3Line'
      />
    ),
    tone: 'warning',
  },
  resolved: {
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
      />
    ),
    tone: 'success',
  },
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: ActivityFeed02Props = {
  description: 'Checkout fails with a saved card',
  events: [
    {
      action: 'opened this ticket',
      actor: 'Amara Okafor',
      at: minutesAgo(60 * 26),
      id: 'h1',
      kind: 'created',
    },
    {
      action: 'added the labels Payments and Safari',
      actor: 'Priya Nair',
      at: minutesAgo(60 * 25),
      id: 'h2',
      kind: 'labelled',
    },
    {
      action: 'assigned this to Kenji Mori',
      actor: 'Priya Nair',
      at: minutesAgo(60 * 25 - 2),
      id: 'h3',
      kind: 'assigned',
    },
    {
      action: 'changed the priority',
      actor: 'Kenji Mori',
      at: minutesAgo(60 * 6),
      change: { from: 'Normal', to: 'High' },
      id: 'h4',
      kind: 'changed',
    },
    {
      action: 'commented',
      actor: 'Kenji Mori',
      at: minutesAgo(95),
      comment:
        'Reproduced on Safari 18 with a saved card. The card token refreshes after the form submits, so the first charge is declined. Fix is in review.',
      id: 'h5',
      kind: 'commented',
    },
    {
      action: 'changed the status',
      actor: 'Kenji Mori',
      at: minutesAgo(12),
      change: { from: 'In progress', to: 'Resolved' },
      id: 'h6',
      kind: 'resolved',
    },
  ],
  now: NOW,
  status: 'Resolved',
  title: 'Ticket #4821',
}

function Value({ children }: { children: ReactNode }) {
  return (
    <span className='bg-muted text-foreground rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap'>
      {children}
    </span>
  )
}

const ActivityFeed02 = (props: ActivityFeed02Props) => {
  const { description, events, now, status, timeZone = 'UTC', title } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <span className='bg-muted rounded-full px-2 py-0.5 text-xs font-medium'>
            {status}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ActivityFeed aria-label={`History of ${title}`}>
          {events.map((event) => {
            const config = kindConfig[event.kind]
            return (
              <ActivityFeedItem key={event.id} className='pb-5 last:pb-0' connector>
                <ActivityIcon icon={config.icon} tone={config.tone} />
                <div className='flex min-w-0 flex-1 flex-col gap-2 pt-1.5'>
                  <div className='flex items-start justify-between gap-3'>
                    <p className='text-sm'>
                      <span className='font-medium'>{event.actor}</span>{' '}
                      <span className='text-muted-foreground'>{event.action}</span>
                      {event.change && (
                        <>
                          {' '}
                          <Value>{event.change.from}</Value>{' '}
                          <span className='whitespace-nowrap'>
                            <span aria-hidden className='text-muted-foreground'>
                              →
                            </span>
                            <span className='sr-only'>to</span>{' '}
                            <Value>{event.change.to}</Value>
                          </span>
                        </>
                      )}
                    </p>
                    <ActivityTime
                      className='mt-0.5'
                      date={event.at}
                      now={now}
                      timeZone={timeZone}
                    />
                  </div>
                  {event.comment && (
                    <blockquote className='rounded-lg border p-3 text-sm'>
                      {event.comment}
                    </blockquote>
                  )}
                </div>
              </ActivityFeedItem>
            )
          })}
        </ActivityFeed>
      </CardContent>
    </Card>
  )
}

export {
  ActivityFeed02,
  exampleProps as activityFeed02ExampleProps,
  type ActivityFeed02Props,
  type HistoryEvent,
  type HistoryKind,
}
