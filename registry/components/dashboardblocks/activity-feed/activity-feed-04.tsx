import {
  ActivityFeedContent,
  ActivityFeedIndicator,
  ActivityFeedItem,
  ActivityFeedTimeline,
} from '@/registry/components/dashboardblocks/activity-feed'
import { ArrowRight, MoreHorizontalIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type EventStatus = 'error' | 'info' | 'progress' | 'success'

const events: {
  description: string
  id: number
  status: EventStatus
  time: string
  title: string
}[] = [
  {
    id: 1,
    title: 'Deployment Successful',
    description: 'Production v2.4.1 deployed to all regions',
    time: '10:32 AM',
    status: 'success',
  },
  {
    id: 2,
    title: 'Build Started',
    description: 'Building production bundle...',
    time: '10:30 AM',
    status: 'progress',
  },
  {
    id: 3,
    title: 'Critical Alert',
    description: 'CPU usage exceeded 90% threshold',
    time: '9:15 AM',
    status: 'error',
  },
  {
    id: 4,
    title: 'Performance Optimized',
    description: 'Cache hit rate improved by 23%',
    time: '8:45 AM',
    status: 'info',
  },
]

export function ActivityFeed04() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          Recent Deployments
          <Button variant='outline' size='sm'>
            View all
            <ArrowRight />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityFeedTimeline linePosition='center'>
          {events.map((event) => {
            return (
              <ActivityFeedItem key={event.id}>
                <div className='mt-0.5 flex w-14 justify-end text-center text-xs text-muted-foreground'>
                  {event.time}
                </div>
                <ActivityFeedIndicator status={event.status} variant='ring' />
                <ActivityFeedContent>
                  <div className='space-y-1'>
                    <p className='font-medium leading-none'>{event.title}</p>
                    <p className='text-sm text-muted-foreground'>{event.description}</p>
                  </div>
                </ActivityFeedContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <MoreHorizontalIcon /> <span className='sr-only'>More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>View deployment</DropdownMenuItem>
                    <DropdownMenuItem>Download logs</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Contact support</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ActivityFeedItem>
            )
          })}
        </ActivityFeedTimeline>
      </CardContent>
    </Card>
  )
}
