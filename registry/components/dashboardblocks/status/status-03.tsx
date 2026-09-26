'use client'

import {
  StatusBadge,
  type StatusLevel,
} from '@/registry/components/dashboardblocks/status'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface IncidentUpdate {
  message: string
  stage: 'Investigating' | 'Identified' | 'Monitoring' | 'Resolved'
  time: string
}

interface Status3Props {
  affected: string[]
  onSubscribe?: () => void
  severity: StatusLevel
  started: string
  title: string
  updates: IncidentUpdate[]
}

const exampleProps: Status3Props = {
  affected: ['API', 'Webhooks'],
  severity: 'partial',
  started: 'Started today at 14:02 UTC',
  title: 'Elevated API error rates',
  updates: [
    {
      message:
        'A fix has been deployed and error rates are back to normal. We are monitoring the results.',
      stage: 'Monitoring',
      time: '14:40 UTC',
    },
    {
      message:
        'We traced the errors to a misconfigured load balancer in us-east-1 and are rolling back.',
      stage: 'Identified',
      time: '14:18 UTC',
    },
    {
      message: 'We are investigating increased 5xx responses on API requests.',
      stage: 'Investigating',
      time: '14:05 UTC',
    },
  ],
}

const Status3 = (props: Status3Props) => {
  const { affected, onSubscribe, severity, started, title, updates } = props

  return (
    <Card>
      <CardHeader className='gap-2'>
        <StatusBadge className='w-fit' status={severity} />
        <CardTitle className='text-base'>{title}</CardTitle>
        <CardDescription>{started}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <span className='text-muted-foreground'>Affected</span>
          {affected.map((component) => (
            <span key={component} className='bg-muted rounded-md px-2 py-0.5 font-medium'>
              {component}
            </span>
          ))}
        </div>
        <ol className='flex flex-col'>
          {updates.map((update, index) => {
            const isLatest = index === 0
            return (
              <li
                key={`${update.stage}-${update.time}`}
                className='relative flex gap-3 pb-5 last:pb-0'
              >
                {index < updates.length - 1 && (
                  <span
                    aria-hidden
                    className='bg-border absolute top-4 bottom-0 left-[5px] w-px'
                  />
                )}
                <span
                  aria-hidden
                  className={cn(
                    'ring-card relative mt-1 size-[11px] shrink-0 rounded-full ring-4',
                    isLatest ? 'bg-foreground' : 'bg-muted-foreground/40',
                  )}
                />
                <div className='flex min-w-0 flex-col gap-1'>
                  <div className='flex flex-wrap items-baseline gap-x-2 text-sm'>
                    <span className='font-medium'>{update.stage}</span>
                    <span className='text-muted-foreground text-xs tabular-nums'>
                      {update.time}
                    </span>
                  </div>
                  <p className='text-muted-foreground text-sm text-pretty'>
                    {update.message}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
      <CardFooter className='border-t'>
        <Button variant='outline' size='sm' onClick={onSubscribe}>
          <IconPlaceholder
            lucide='BellIcon'
            tabler='IconBell'
            hugeicons='NotificationIcon'
            phosphor='BellIcon'
            remixicon='RiNotificationLine'
            data-icon='inline-start'
          />
          Subscribe to updates
        </Button>
      </CardFooter>
    </Card>
  )
}

export { Status3, exampleProps as status3ExampleProps, type Status3Props }
