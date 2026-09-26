'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityTime,
  groupActivityByDay,
} from '@/registry/components/dashboardblocks/activity-feed'
import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { useId } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Activity {
  /** "commented on", "invited", "moved … to Done". */
  action: string
  actor: Pick<Person, 'avatar' | 'name'>
  at: Date
  id: string
  /** What the action was on, shown in bold. */
  target?: string
}

interface ActivityFeed01Props {
  /** Newest first. */
  activities: Activity[]
  description: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onViewAll?: () => void
  title: string
  /** Time zone for days and times. @default 'UTC' */
  timeZone?: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: ActivityFeed01Props = {
  activities: [
    {
      action: 'commented on',
      actor: { name: 'Priya Nair' },
      at: minutesAgo(4),
      id: 'a1',
      target: 'Q4 pricing page',
    },
    {
      action: 'invited',
      actor: { name: 'Tomás Rivera' },
      at: minutesAgo(38),
      id: 'a2',
      target: 'mei@example.com',
    },
    {
      action: 'moved Onboarding checklist to',
      actor: { name: 'Mei Tanaka' },
      at: minutesAgo(190),
      id: 'a3',
      target: 'Done',
    },
    {
      action: 'uploaded 3 files to',
      actor: { name: 'Jonah Fischer' },
      at: minutesAgo(60 * 20),
      id: 'a4',
      target: 'Brand assets',
    },
    {
      action: 'created the project',
      actor: { name: 'Amara Okafor' },
      at: minutesAgo(60 * 23),
      id: 'a5',
      target: 'Mobile checkout',
    },
    {
      action: 'closed 12 issues in',
      actor: { name: 'Lucas Silva' },
      at: minutesAgo(60 * 50),
      id: 'a6',
      target: 'Sprint 24',
    },
  ],
  description: 'What your team did across projects',
  now: NOW,
  onViewAll: () => {},
  title: 'Recent activity',
}

const ActivityFeed01 = (props: ActivityFeed01Props) => {
  const { activities, description, now, onViewAll, timeZone = 'UTC', title } = props
  const id = useId()
  const days = groupActivityByDay(activities, now, timeZone)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {onViewAll && (
          <CardAction>
            <Button variant='outline' size='sm' onClick={onViewAll}>
              View all
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        {days.map((day) => (
          <section key={day.key} aria-labelledby={`${id}-${day.key}`}>
            <h3
              id={`${id}-${day.key}`}
              className='text-muted-foreground mb-3 text-xs font-medium'
            >
              {day.label}
            </h3>
            <ActivityFeed className='gap-4'>
              {day.items.map((activity) => (
                <ActivityFeedItem key={activity.id} className='items-start'>
                  <PersonAvatar person={activity.actor} />
                  <p className='min-w-0 flex-1 text-sm'>
                    <span className='font-medium'>{activity.actor.name}</span>{' '}
                    <span className='text-muted-foreground'>{activity.action}</span>
                    {activity.target && (
                      <>
                        {' '}
                        <span className='font-medium break-words'>{activity.target}</span>
                      </>
                    )}
                  </p>
                  <ActivityTime
                    className='mt-0.5'
                    date={activity.at}
                    now={now}
                    timeZone={timeZone}
                  />
                </ActivityFeedItem>
              ))}
            </ActivityFeed>
          </section>
        ))}
      </CardContent>
    </Card>
  )
}

export {
  ActivityFeed01,
  exampleProps as activityFeed01ExampleProps,
  type Activity,
  type ActivityFeed01Props,
}
