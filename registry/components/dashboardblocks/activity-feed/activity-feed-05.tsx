'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityTime,
} from '@/registry/components/dashboardblocks/activity-feed'
import { Icons } from '@/registry/components/dashboardblocks/icon'
import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Platform = 'slack' | 'github'

interface SocialMessage {
  replies?: number
  reactions?: number
  /** Channels or labels shown above the message. */
  tags?: string[]
  text: string
}

interface SocialEvent {
  /** A button under the event, e.g. "Start review". */
  action?: string
  author: Pick<Person, 'avatar' | 'name'>
  at: Date
  /** The channel or repository, shown in bold. */
  channel: string
  /** "created pull request #278 in". */
  description: string
  id: string
  /** A message quoted under the event. */
  message?: SocialMessage
  platform: Platform
}

interface ActivityFeed05Props {
  description: string
  /** Newest first. */
  events: SocialEvent[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onAction?: (event: SocialEvent) => void
  onViewAll?: () => void
  /** Time zone for times. @default 'UTC' */
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

const exampleProps: ActivityFeed05Props = {
  description: 'Slack and GitHub, in one place',
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
      author: { name: 'Tiffany Huang' },
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
      author: { name: 'Amelia Ortiz' },
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

const ActivityFeed05 = (props: ActivityFeed05Props) => {
  const { description, events, now, onAction, onViewAll, timeZone = 'UTC', title } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {onViewAll && (
          <CardAction>
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
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <ActivityFeed>
          {events.map((event) => {
            const platform = platformConfig[event.platform]
            const PlatformIcon = platform.icon
            return (
              <ActivityFeedItem key={event.id} className='pb-6 last:pb-0' connector>
                <span className='flex size-(--activity-marker) shrink-0 items-center justify-center'>
                  <PersonAvatar className='ring-card ring-4' person={event.author} />
                </span>
                <div className='flex min-w-0 flex-1 flex-col gap-3 pt-1.5'>
                  <p className='text-sm'>
                    <span className='font-medium'>{event.author.name}</span>{' '}
                    <span className='text-muted-foreground'>{event.description}</span>{' '}
                    <span className='font-medium break-all'>{event.channel}</span>{' '}
                    <PlatformIcon aria-hidden className='-mt-0.5 mr-1 inline size-3.5' />
                    <span className='sr-only'>on {platform.label}, </span>
                    <ActivityTime date={event.at} now={now} timeZone={timeZone} />
                  </p>
                  {event.message && (
                    <div className='bg-muted/50 flex flex-col gap-3 rounded-lg p-4'>
                      {event.message.tags && event.message.tags.length > 0 && (
                        <div className='flex flex-wrap items-center gap-2'>
                          {event.message.tags.map((tag) => (
                            <Badge key={tag} variant='outline'>
                              # {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className='text-sm'>{event.message.text}</p>
                      {!!(event.message.reactions || event.message.replies) && (
                        <div className='text-muted-foreground flex items-center gap-3 text-xs font-medium [&_svg]:size-4'>
                          {!!event.message.reactions && (
                            <span className='flex items-center gap-1'>
                              <IconPlaceholder
                                lucide='SmileIcon'
                                tabler='IconMoodSmile'
                                hugeicons='SmileIcon'
                                phosphor='SmileyIcon'
                                remixicon='RiEmotionLine'
                                aria-hidden
                              />
                              {plural(event.message.reactions, 'reaction', 'reactions')}
                            </span>
                          )}
                          {!!event.message.replies && (
                            <span className='flex items-center gap-1'>
                              <IconPlaceholder
                                lucide='MessageSquareIcon'
                                tabler='IconMessage'
                                hugeicons='MessageIcon'
                                phosphor='ChatCircleIcon'
                                remixicon='RiChat1Line'
                                aria-hidden
                              />
                              {plural(event.message.replies, 'reply', 'replies')}
                            </span>
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
      </CardContent>
    </Card>
  )
}

export {
  ActivityFeed05,
  exampleProps as activityFeed05ExampleProps,
  type ActivityFeed05Props,
  type Platform,
  type SocialEvent,
  type SocialMessage,
}
