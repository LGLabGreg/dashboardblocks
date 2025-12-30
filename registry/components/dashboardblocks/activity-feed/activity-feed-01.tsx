import {
  ActivityFeedContent,
  ActivityFeedItem,
} from '@/registry/components/dashboardblocks/activity-feed'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import { Bell, DollarSign, FileText, LucideIcon, Settings, UserPlus } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Activity {
  id: number
  user: string
  avatar: string
  action: string
  target: string
  time: string
  icon: LucideIcon
  iconColor: string
}

interface ActivityFeed01Props {
  title: string
  badgeCount: number
  activities: Activity[]
}

const exampleProps: ActivityFeed01Props = {
  title: 'Recent Activity',
  badgeCount: 4,
  activities: [
    {
      id: 1,
      user: 'Sarah Chen',
      avatar: '/images/women.jpg',
      action: 'created a new document',
      target: 'Q4 Revenue Report',
      time: '2 minutes ago',
      icon: FileText,
      iconColor: 'text-blue-600 bg-blue-600/10',
    },
    {
      id: 2,
      user: 'Michael Scott',
      avatar: '/images/man.jpg',
      action: 'invited',
      target: 'Jim Halpert',
      time: '15 minutes ago',
      icon: UserPlus,
      iconColor: 'text-teal-600 bg-teal-600/10',
    },
    {
      id: 3,
      user: 'Pam Beesly',
      avatar: '/images/women.jpg',
      action: 'updated settings for',
      target: 'Marketing Campaign',
      time: '1 hour ago',
      icon: Settings,
      iconColor: 'text-orange-600 bg-orange-600/10',
    },
    {
      id: 4,
      user: 'Dwight Schrute',
      avatar: '/images/man.jpg',
      action: 'processed payment of',
      target: '$2,450.00',
      time: '3 hours ago',
      icon: DollarSign,
      iconColor: 'text-violet-600 bg-violet-600/10',
    },
  ],
}

const ActivityFeed01 = (props: ActivityFeed01Props) => {
  const { title, badgeCount, activities } = props
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          {title}
          <Badge variant='secondary' className='bg-blue-600 text-white'>
            <Bell />
            {badgeCount} New
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {activities.map((activity) => {
          const ActivityIcon = activity.icon
          return (
            <ActivityFeedItem key={activity.id}>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={activity.avatar} alt={activity.user} />
                <AvatarFallback>{activity.user.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <ActivityFeedContent className='space-y-0.5'>
                <p>
                  <span className='font-medium'>{activity.user}</span>{' '}
                  <span className='text-muted-foreground'>{activity.action}</span>{' '}
                  <span className='font-medium'>{activity.target}</span>
                </p>
                <span className='text-xs text-muted-foreground'>{activity.time}</span>
              </ActivityFeedContent>
              <Icon
                icon={ActivityIcon}
                shape='circle'
                size='sm'
                className={cn('hidden md:flex', activity.iconColor)}
              />
            </ActivityFeedItem>
          )
        })}
      </CardContent>
    </Card>
  )
}

export {
  ActivityFeed01,
  exampleProps as activityFeed01ExampleProps,
  type ActivityFeed01Props,
  type Activity,
}
