import { Icon } from '@/registry/components/dashboardblocks/icon'
import { Bell, DollarSign, FileText, Settings, UserPlus } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'

const activities = [
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
]

export function ActivityFeed1() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          Classic Feed
          <Badge variant='secondary'>
            <Bell />4 New
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {activities.map((activity) => {
          const ActivityIcon = activity.icon
          return (
            <div key={activity.id} className='flex items-start gap-4'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={activity.avatar} alt={activity.user} />
                <AvatarFallback>{activity.user.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className='flex-1 space-y-1'>
                <p className='text-sm'>
                  <span className='font-medium'>{activity.user}</span>{' '}
                  <span className='text-muted-foreground'>{activity.action}</span>{' '}
                  <span className='font-medium'>{activity.target}</span>
                </p>
                <p className='text-xs text-muted-foreground'>{activity.time}</p>
              </div>
              <Icon
                icon={ActivityIcon}
                shape='circle'
                size='sm'
                className={cn('hidden md:flex', activity.iconColor)}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
