import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'

const events = [
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

const statusStyles = {
  success: 'bg-green-200 [&>div]:bg-green-600',
  progress: 'bg-blue-200 [&>div]:bg-blue-600',
  error: 'bg-red-200 [&>div]:bg-red-600',
  info: 'bg-purple-200 [&>div]:bg-purple-600',
}

export function ActivityFeed04() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='relative space-y-6'>
          <div className='absolute left-20.5 h-full w-px bg-border' />
          {events.map((event) => {
            return (
              <div key={event.id} className='relative flex items-start gap-4'>
                <div className='flex items-center justify-end text-xs w-14 text-center mt-0.5'>
                  <div>{event.time}</div>
                </div>
                <div
                  className={cn(
                    'flex items-center justify-center size-5 rounded-full',
                    statusStyles[event.status as keyof typeof statusStyles],
                  )}
                >
                  <div
                    className={cn('flex items-center justify-center size-2 rounded-full')}
                  ></div>
                </div>
                <div className='flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='space-y-1'>
                      <p className='font-medium leading-none'>{event.title}</p>
                      <p className='text-sm text-muted-foreground'>{event.description}</p>
                    </div>
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
