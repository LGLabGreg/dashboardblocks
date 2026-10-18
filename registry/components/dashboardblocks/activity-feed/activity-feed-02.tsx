'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityIcon,
  ActivityTime,
  type ActivityTone,
} from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

type HistoryKind =
  | 'created'
  | 'assigned'
  | 'changed'
  | 'labelled'
  | 'commented'
  | 'resolved'

interface HistoryEvent {
  action: string
  actor: string
  at: Date
  change?: { from: string; to: string }
  comment?: string
  id: string
  kind: HistoryKind
}

type RecordStatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface ActivityFeed2Props {
  /** What the record is about; a sentence on its history follows it. */
  description: string
  /** Oldest first, so the history reads as a story. Leave out, or pass none, to show the empty state. */
  events?: HistoryEvent[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  recordStatus: { label: string; tone?: RecordStatusTone }
  status?: BlockStatus
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
    tone: 'accent',
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

const exampleProps: ActivityFeed2Props = {
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
  recordStatus: { label: 'Resolved', tone: 'success' },
  title: 'Ticket #4821',
}

const statusTones: Record<RecordStatusTone, StatusTone> = {
  danger: 'bad',
  info: 'info',
  neutral: 'neutral',
  success: 'good',
  warning: 'warning',
}

const HOUR = 3_600_000

function formatSpan(from: Date, to: Date) {
  const hours = Math.round((to.getTime() - from.getTime()) / HOUR)
  if (hours < 1) return 'under an hour'
  if (hours < 48) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  return `${Math.round(hours / 24)} days`
}

const summarize = (events: HistoryEvent[]) => {
  const first = events[0]
  const last = events[events.length - 1]
  if (!first || !last) return 'No history yet.'
  const people = new Set(events.map((event) => event.actor)).size
  return `${events.length} ${events.length === 1 ? 'change' : 'changes'} by ${people} ${people === 1 ? 'person' : 'people'} over ${formatSpan(first.at, last.at)}.`
}

const ActivityFeed2 = (props: ActivityFeed2Props) => {
  const {
    description,
    events = [],
    now,
    recordStatus,
    status,
    timeZone = 'UTC',
    title,
  } = props
  const state = getBlockState(status, events)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>
              {description}. <BlockReady>{summarize(events)}</BlockReady>
            </p>
          </div>
          <BlockReady className='w-20 text-sm'>
            <StatusLabel tone={statusTones[recordStatus.tone ?? 'neutral']}>
              {recordStatus.label}
            </StatusLabel>
          </BlockReady>
        </header>
        {state && (
          <div className='border-t'>
            <BlockStateRows rows={5} />
          </div>
        )}
        {!state && (
          <ActivityFeed aria-label={`History of ${title}`} className='border-t pt-4'>
            {events.map((event) => {
              const config = kindConfig[event.kind]
              return (
                <ActivityFeedItem key={event.id} className='pb-5 last:pb-0' connector>
                  <ActivityIcon
                    className='ring-background'
                    icon={config.icon}
                    tone={config.tone}
                  />
                  <div className='flex min-w-0 flex-1 flex-col gap-2 pt-1.5'>
                    <div className='flex items-start justify-between gap-3'>
                      <p className='text-sm'>
                        <span className='font-medium'>{event.actor}</span>{' '}
                        <span className='text-muted-foreground'>{event.action}</span>
                        {event.change && (
                          <>
                            <span className='sr-only'> from</span>{' '}
                            <span className='text-muted-foreground line-through decoration-1'>
                              {event.change.from}
                            </span>{' '}
                            <span className='whitespace-nowrap'>
                              <span aria-hidden className='text-muted-foreground'>
                                →
                              </span>
                              <span className='sr-only'>to</span>{' '}
                              <span className='font-medium'>{event.change.to}</span>
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
                      <blockquote className='border-l-2 pl-3 text-sm'>
                        {event.comment}
                      </blockquote>
                    )}
                  </div>
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
  ActivityFeed2,
  exampleProps as activityFeed2ExampleProps,
  type ActivityFeed2Props,
  type HistoryEvent,
  type HistoryKind,
  type RecordStatusTone,
}
