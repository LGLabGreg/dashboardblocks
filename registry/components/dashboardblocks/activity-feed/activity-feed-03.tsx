import {
  ActivityFeedContent,
  ActivityFeedItem,
} from '@/registry/components/dashboardblocks/activity-feed'
import { ArrowRight } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface UserActivity {
  id: number
  user: {
    name: string
    avatar: string
    initials: string
  }
  action: string
  time: string
}

interface ActivityFeed03Props {
  title: string
  activities: UserActivity[]
}

const exampleProps: ActivityFeed03Props = {
  title: 'Recent Activity',
  activities: [
    {
      id: 1,
      user: { name: 'Sarah Chen', avatar: '/images/women.jpg', initials: 'SC' },
      action: 'commented on Design System v2',
      time: '2m',
    },
    {
      id: 2,
      user: { name: 'Michael Torres', avatar: '/images/man.jpg', initials: 'MT' },
      action: 'assigned you a task',
      time: '15m',
    },
    {
      id: 3,
      user: { name: 'Emma Wilson', avatar: '/images/women.jpg', initials: 'EW' },
      action: 'scheduled Q1 Planning Review',
      time: '1h',
    },
    {
      id: 4,
      user: { name: 'Alex Kumar', avatar: '/images/man.jpg', initials: 'AK' },
      action: 'completed Sprint 24',
      time: '2h',
    },
  ],
}

const ActivityFeed03 = (props: ActivityFeed03Props) => {
  const { title, activities } = props
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
      <CardContent className='space-y-2'>
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <ActivityFeedItem
              align='center'
              className={cn(
                'pb-2',
                index < activities.length - 1 && 'border-b border-border',
              )}
              size='sm'
            >
              <Avatar className='h-8 w-8 shrink-0'>
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback className='text-xs'>
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>
              <ActivityFeedContent className='truncate' layout='inline'>
                <div className='truncate'>
                  <span className='font-medium'>{activity.user.name}</span>{' '}
                  <span className='text-muted-foreground'>{activity.action}</span>
                </div>
              </ActivityFeedContent>
              <span className='text-xs text-muted-foreground'>{activity.time}</span>
            </ActivityFeedItem>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export {
  ActivityFeed03,
  exampleProps as activityFeed03ExampleProps,
  type ActivityFeed03Props,
  type UserActivity,
}
