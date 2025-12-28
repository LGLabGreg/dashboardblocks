import {
  ActivityFeedContent,
  ActivityFeedItem,
} from '@/registry/components/dashboardblocks/activity-feed'
import { ArrowRight } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const activities = [
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
]

export function ActivityFeed03() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          Recent Activity
          <Button variant='outline' size='sm'>
            View all
            <ArrowRight />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <ActivityFeedItem align='center' className='pb-2' size='sm'>
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
            {index < activities.length - 1 && <div className='h-px bg-border' />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
