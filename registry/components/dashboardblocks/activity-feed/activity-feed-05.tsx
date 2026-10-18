'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityTime,
} from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Icons } from '@/registry/components/dashboardblocks/icon'
import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { joinDetails } from '@/registry/lib/dashboardblocks/format'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Platform = 'slack' | 'github'

interface SocialMessage {
  replies?: number
  reactions?: number
  tags?: string[]
  text: string
}

interface SocialEvent {
  action?: string
  author: Pick<Person, 'avatar' | 'name'>
  at: Date
  channel: string
  description: string
  id: string
  message?: SocialMessage
  platform: Platform
}

interface ActivityFeed5Props {
  /** Defaults to a sentence about where the events came from and what waits on you. */
  description?: string
  /** Newest first. Leave out, or pass none, to show the empty state. */
  events?: SocialEvent[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onAction?: (event: SocialEvent) => void
  onViewAll?: () => void
  status?: BlockStatus
  timeZone?: string
  title: string
}

const platformConfig: Record<
  Platform,
  { icon: (typeof Icons)[Platform]; label: string }
> = {
  github: { icon: Icons.github, label: 'GitHub' },
  slack: { icon: Icons.slack, label: 'Slack' },
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: ActivityFeed5Props = {
  events: [
    {
      at: minutesAgo(6),
      author: { name: 'Wanda Kowalski' },
      channel: '#welcome',
      description: 'commented in',
      id: 's1',
      platform: 'slack',
    },
    {
      action: 'Start review',
      at: minutesAgo(19),
      author: { avatar: '/images/avatar-01.webp', name: 'Tiffany Huang' },
      channel: 'acme/dashboard',
      description: 'opened pull request #278 in',
      id: 's2',
      platform: 'github',
    },
    {
      at: minutesAgo(44),
      author: { name: 'Neil Robertson' },
      channel: '#showcase',
      description: 'reacted 🔥 in',
      id: 's3',
      platform: 'slack',
    },
    {
      at: minutesAgo(120),
      author: { avatar: '/images/avatar-05.webp', name: 'Amelia Ortiz' },
      channel: '#product-roadmap',
      description: 'replied to a thread in',
      id: 's4',
      message: {
        reactions: 2,
        replies: 3,
        tags: ['marketing', 'design'],
        text: 'Just shipped the new onboarding flow! Would love feedback on the empty states before we roll it out to everyone.',
      },
      platform: 'slack',
    },
    {
      at: minutesAgo(60 * 6),
      author: { name: 'Tomasz Grzyb' },
      channel: 'acme/dashboard',
      description: 'published release v0.3.2 in',
      id: 's5',
      platform: 'github',
    },
  ],
  now: NOW,
  onViewAll: () => {},
  title: 'Social activity',
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

const describeMessage = (message: SocialMessage) => [
  ...(message.reactions ? [plural(message.reactions, 'reaction', 'reactions')] : []),
  ...(message.replies ? [plural(message.replies, 'reply', 'replies')] : []),
]

const listFormat = new Intl.ListFormat('en-US', { type: 'conjunction' })

const summarize = (events: SocialEvent[]) => {
  if (events.length === 0) return 'Nothing new from your tools.'
  const sources = listFormat.format(
    (Object.keys(platformConfig) as Platform[])
      .map((platform) => ({
        count: events.filter((event) => event.platform === platform).length,
        label: platformConfig[platform].label,
      }))
      .filter((source) => source.count > 0)
      .map((source) => `${source.count} from ${source.label}`),
  )
  const waiting = events.filter((event) => event.action).length
  return `${sources}${waiting > 0 ? `, ${waiting} waiting on you` : ''}.`
}

const ActivityFeed5 = (props: ActivityFeed5Props) => {
  const { events = [], now, onAction, onViewAll, status, timeZone = 'UTC', title } = props
  const { description = summarize(events) } = props
  const state = getBlockState(status, events)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          {onViewAll && (
            <Button variant='outline' size='sm' onClick={onViewAll}>
              View all
              <IconPlaceholder
                lucide='ArrowRightIcon'
                tabler='IconArrowRight'
                hugeicons='ArrowRight01Icon'
                phosphor='ArrowRightIcon'
                remixicon='RiArrowRightLine'
                data-icon='inline-end'
              />
            </Button>
          )}
        </header>
        {state && (
          <div className='border-t'>
            <BlockStateRows rows={5} />
          </div>
        )}
        {!state && (
          <ActivityFeed className='border-t pt-4'>
            {events.map((event) => {
              const platform = platformConfig[event.platform]
              const PlatformIcon = platform.icon
              const details = event.message ? describeMessage(event.message) : []
              const tags = event.message?.tags ?? []
              return (
                <ActivityFeedItem key={event.id} className='pb-6 last:pb-0' connector>
                  <span className='flex size-(--activity-marker) shrink-0 items-center justify-center'>
                    <PersonAvatar
                      className='ring-background ring-4'
                      person={event.author}
                    />
                  </span>
                  <div className='flex min-w-0 flex-1 flex-col gap-3 pt-1.5'>
                    <div className='flex items-start justify-between gap-3'>
                      <p className='text-sm'>
                        <span className='font-medium'>{event.author.name}</span>{' '}
                        <span className='text-muted-foreground'>{event.description}</span>{' '}
                        <span className='font-medium break-words'>{event.channel}</span>
                        <span className='sr-only'> on {platform.label}</span>
                      </p>
                      <span className='text-muted-foreground mt-0.5 flex shrink-0 items-center gap-1.5'>
                        <PlatformIcon aria-hidden className='size-3.5' />
                        <ActivityTime date={event.at} now={now} timeZone={timeZone} />
                      </span>
                    </div>
                    {event.message && (
                      <div className='flex flex-col gap-2 border-l-2 pl-3'>
                        <p className='text-sm'>{event.message.text}</p>
                        {(tags.length > 0 || details.length > 0) && (
                          <div className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
                            {tags.length > 0 && (
                              <ul aria-label='Tags' className='flex flex-wrap gap-1'>
                                {tags.map((tag) => (
                                  <li key={tag}>
                                    <Badge variant='outline'>#{tag}</Badge>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {details.length > 0 && (
                              <p className='text-muted-foreground text-xs tabular-nums'>
                                {joinDetails(...details)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {event.action && (
                      <Button
                        className='self-start'
                        onClick={() => onAction?.(event)}
                        size='sm'
                        variant='outline'
                      >
                        {event.action}
                      </Button>
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
  ActivityFeed5,
  exampleProps as activityFeed5ExampleProps,
  type ActivityFeed5Props,
  type Platform,
  type SocialEvent,
  type SocialMessage,
}
