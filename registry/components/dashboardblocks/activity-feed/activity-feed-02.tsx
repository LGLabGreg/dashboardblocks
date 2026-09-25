import {
  ActivityFeedContent,
  ActivityFeedItem,
  ActivityFeedTimeline,
} from '@/registry/components/dashboardblocks/activity-feed'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  LucideIcon,
  Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type EventStatus = 'success' | 'progress' | 'error' | 'info'

interface DeploymentEvent {
  id: number
  title: string
  description: string
  time: string
  status: EventStatus
  icon: LucideIcon
}

interface ActivityFeed02Props {
  title: string
  events: DeploymentEvent[]
}

const statusStyles: Record<EventStatus, string> = {
  success:
    'bg-[color-mix(in_oklab,var(--color-green-500)_10%,var(--card))] text-green-600 dark:text-green-500',
  progress:
    'bg-[color-mix(in_oklab,var(--color-blue-500)_10%,var(--card))] text-blue-600 dark:text-blue-500',
  error:
    'bg-[color-mix(in_oklab,var(--color-red-500)_10%,var(--card))] text-red-600 dark:text-red-500',
  info: 'bg-[color-mix(in_oklab,var(--color-purple-500)_10%,var(--card))] text-purple-600 dark:text-purple-500',
}

const exampleProps: ActivityFeed02Props = {
  title: 'Recent Deployments',
  events: [
    {
      id: 1,
      title: 'Deployment Successful',
      description: 'Production v2.4.1 deployed to all regions',
      time: '10:32 AM',
      status: 'success',
      icon: CheckCircle2,
    },
    {
      id: 2,
      title: 'Build Started',
      description: 'Building production bundle...',
      time: '10:30 AM',
      status: 'progress',
      icon: Clock,
    },
    {
      id: 3,
      title: 'Critical Alert',
      description: 'CPU usage exceeded 90% threshold',
      time: '9:15 AM',
      status: 'error',
      icon: AlertCircle,
    },
    {
      id: 4,
      title: 'Performance Optimized',
      description: 'Cache hit rate improved by 23%',
      time: '8:45 AM',
      status: 'info',
      icon: Zap,
    },
  ],
}

const ActivityFeed02 = (props: ActivityFeed02Props) => {
  const { title, events } = props
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          {title}
          <Button variant='outline' size='sm' className='has-[>svg]:ps-3'>
            View all
            <ArrowRight />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityFeedTimeline>
          {events.map((event) => {
            const EventIcon = event.icon
            return (
              <ActivityFeedItem key={event.id}>
                <Icon icon={EventIcon} size='md' className={statusStyles[event.status]} />
                <ActivityFeedContent>
                  <div className='space-y-1'>
                    <p className='font-medium mb-0.5'>{event.title}</p>
                    <p className='text-sm text-muted-foreground'>{event.description}</p>
                  </div>
                </ActivityFeedContent>
                <span className='text-xs text-muted-foreground'>{event.time}</span>
              </ActivityFeedItem>
            )
          })}
        </ActivityFeedTimeline>
      </CardContent>
    </Card>
  )
}

export {
  ActivityFeed02,
  exampleProps as activityFeed02ExampleProps,
  type ActivityFeed02Props,
  type DeploymentEvent,
  type EventStatus,
}
