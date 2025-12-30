import {
  ActivityFeedContent,
  ActivityFeedItem,
  ActivityFeedTimeline,
} from '@/registry/components/dashboardblocks/activity-feed'
import { Icons } from '@/registry/components/dashboardblocks/icon'
import { ArrowRight, MessageSquare, Smile } from 'lucide-react'
import { ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Platform = 'slack' | 'github'

interface SocialEvent {
  id: number
  author: string
  description: string
  channel: string
  time: string
  platform: Platform
  avatar: string
  extra?: ReactNode
}

interface ActivityFeed05Props {
  title: string
  events: SocialEvent[]
}

const exampleProps: ActivityFeed05Props = {
  title: 'Social Activity',
  events: [
    {
      id: 1,
      author: 'Wanda Maximoff',
      description: 'added comment in',
      channel: 'Welcome',
      time: '11:08 AM',
      platform: 'slack',
      avatar: '/images/women.jpg',
    },
    {
      id: 2,
      author: 'Tiffany Heyman',
      description: 'created pull request #278 in',
      channel: 'LGLabGreg/dashboardblocks',
      time: '10:55 AM',
      platform: 'github',
      avatar: '/images/women.jpg',
      extra: (
        <Button variant='outline' size='sm'>
          Start review
        </Button>
      ),
    },
    {
      id: 3,
      author: 'Neil Robertson',
      description: 'added reaction 🔥 in',
      channel: '#showcase',
      time: '10:30 AM',
      platform: 'slack',
      avatar: '/images/man.jpg',
    },
    {
      id: 4,
      author: 'Amelia Earhart',
      description: 'sent message to thread in channel',
      channel: '#product-roadmap',
      time: '9:15 AM',
      platform: 'slack',
      avatar: '/images/women.jpg',
      extra: (
        <Card className='py-4 rounded-md'>
          <CardContent className='px-4 space-y-4'>
            <div className='flex items-center gap-2'>
              <Badge variant='outline'># marketing</Badge>
              <Badge variant='outline'># design</Badge>
            </div>
            <p className='text-sm'>
              Hello everyone, just shipped the new onboarding flow! Would love feedback on
              the empty states before we roll out to everyone.
            </p>
            <div className='flex items-center gap-2 text-xs text-muted-foreground font-medium'>
              <div className='flex items-center gap-1'>
                <Smile className='size-4' />2 reactions
              </div>
              <div className='flex items-center gap-1'>
                <MessageSquare className='size-4' />3 replies
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 5,
      author: 'Tomasz Grzyb',
      description: 'created release v0.3.2 in',
      channel: 'LGLabGreg/dashboardblocks',
      time: '8:45 AM',
      platform: 'github',
      avatar: '/images/man.jpg',
    },
  ],
}

const ActivityFeed05 = (props: ActivityFeed05Props) => {
  const { title, events } = props
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          {title}
          <Button variant='outline' size='sm'>
            View all
            <ArrowRight />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityFeedTimeline lineClassName='left-4'>
          {events.map((event) => {
            const PlatformIcon = Icons[event.platform as keyof typeof Icons]
            return (
              <div key={event.id}>
                <ActivityFeedItem size='sm'>
                  <Avatar className='size-8'>
                    <AvatarImage src={event.avatar} alt={event.author} />
                    <AvatarFallback>{event.author.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <ActivityFeedContent className='pt-1.5 space-y-4'>
                    <p>
                      <span className='font-medium'>{event.author}</span>{' '}
                      <span className='text-muted-foreground'>{event.description}</span>{' '}
                      <span className='font-medium'>{event.channel}</span>{' '}
                      <PlatformIcon className='inline-flex size-4 mx-0.5 -mt-0.5' />{' '}
                      <span className='text-xs text-muted-foreground'>{event.time}</span>
                    </p>
                    {event.extra}
                  </ActivityFeedContent>
                </ActivityFeedItem>
              </div>
            )
          })}
        </ActivityFeedTimeline>
      </CardContent>
    </Card>
  )
}

export {
  ActivityFeed05,
  exampleProps as activityFeed05ExampleProps,
  type ActivityFeed05Props,
  type SocialEvent,
  type Platform,
}
