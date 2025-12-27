import { Icon } from '@/registry/components/dashboardblocks/icon'
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const events = [
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
]

const statusStyles = {
  success: 'border-green-500 bg-green-100 text-green-500',
  progress: 'border-blue-500 bg-blue-100 text-blue-500',
  error: 'border-red-500 bg-red-100 text-red-500',
  info: 'border-purple-500 bg-purple-100 text-purple-500',
}

export function ActivityFeed2() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='relative space-y-2'>
          <div className='absolute left-5 h-[calc(100%-3rem)] w-px bg-border shadow-xs' />
          {events.map((event) => {
            const EventIcon = event.icon
            return (
              <div key={event.id} className='relative flex items-start gap-4'>
                <Icon
                  icon={EventIcon}
                  size='md'
                  className={statusStyles[event.status as keyof typeof statusStyles]}
                />
                <div className='flex-1 pb-6'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='space-y-1'>
                      <p className='font-medium leading-none'>{event.title}</p>
                      <p className='text-sm text-muted-foreground'>{event.description}</p>
                    </div>
                    <span className='text-xs text-muted-foreground'>{event.time}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
