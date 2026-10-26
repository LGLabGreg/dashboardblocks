'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityTime,
  groupActivityByDay,
} from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId } from 'react'

import { Button } from '@/components/ui/button'

interface Activity {
  action: string
  actor: Pick<Person, 'avatar' | 'name'>
  at: Date
  id: string
  target?: string
}

interface ActivityFeed1Props extends BlockStateProps {
  /** Newest first. Leave out, or pass none, to show the empty state. */
  activities?: Activity[]
  /** Defaults to a sentence about how many updates and people the feed holds. */
  description?: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onViewAll?: () => void
  title: string
  timeZone?: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: ActivityFeed1Props = {
  activities: [
    {
      action: 'commented on',
      actor: { avatar: '/images/avatar-02.webp', name: 'Priya Nair' },
      at: minutesAgo(4),
      id: 'a1',
      target: 'Q4 pricing page',
    },
    {
      action: 'invited',
      actor: { name: 'Kenji Watanabe' },
      at: minutesAgo(38),
      id: 'a2',
      target: 'mei@example.com',
    },
    {
      action: 'moved Onboarding checklist to',
      actor: { avatar: '/images/avatar-04.webp', name: 'Mei Tanaka' },
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
      actor: { avatar: '/images/avatar-07.webp', name: 'Lucas Silva' },
      at: minutesAgo(60 * 50),
      id: 'a6',
      target: 'Sprint 24',
    },
  ],
  now: NOW,
  onViewAll: () => {},
  title: 'Recent activity',
}

const summarize = (activities: Activity[], days: number) => {
  if (activities.length === 0) return 'Nothing has happened yet.'
  const people = new Set(activities.map((activity) => activity.actor.name)).size
  const updates = `${activities.length} ${activities.length === 1 ? 'update' : 'updates'}`
  const from = `${people} ${people === 1 ? 'person' : 'people'}`
  return `${updates} from ${from} over the last ${days === 1 ? 'day' : `${days} days`}.`
}

const ActivityFeed1 = (props: ActivityFeed1Props) => {
  const {
    activities = [],
    now,
    onViewAll,
    errorMessage,
    status,
    timeZone = 'UTC',
    title,
  } = props
  const id = useId()
  const days = groupActivityByDay(activities, now, timeZone)
  const { description = summarize(activities, days.length) } = props
  const state = getBlockState(status, activities)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          {onViewAll && (
            <Button variant='outline' size='sm' onClick={onViewAll}>
              View all
              <IconPlaceholder
                lucide='ArrowRightIcon'
                tabler='IconArrowRight'
                hugeicons='ArrowRight01Icon'
                phosphor='ArrowRightIcon'
                remixicon='RiArrowRightLine'
                data-icon='inline-end'
              />
            </Button>
          )}
        </header>
        {state && (
          <div className='border-t'>
            <BlockStateRows rows={6} />
          </div>
        )}
        {!state &&
          days.map((day) => (
            <section
              key={day.key}
              aria-labelledby={`${id}-${day.key}`}
              className='flex flex-col gap-1 border-t pt-3'
            >
              <h3
                id={`${id}-${day.key}`}
                className='text-muted-foreground flex justify-between text-xs font-medium'
              >
                {day.label}
                <span className='font-normal tabular-nums'>
                  {day.items.length} {day.items.length === 1 ? 'update' : 'updates'}
                </span>
              </h3>
              <ActivityFeed>
                {day.items.map((activity) => (
                  <ActivityFeedItem key={activity.id} className='items-start py-2'>
                    <PersonAvatar className='-my-0.5' person={activity.actor} size='sm' />
                    <p className='min-w-0 flex-1 text-sm'>
                      <span className='font-medium'>{activity.actor.name}</span>{' '}
                      <span className='text-muted-foreground'>{activity.action}</span>
                      {activity.target && (
                        <>
                          {' '}
                          <span className='font-medium break-words'>
                            {activity.target}
                          </span>
                        </>
                      )}
                    </p>
                    <ActivityTime
                      className='pt-0.5 tabular-nums'
                      date={activity.at}
                      now={now}
                      timeZone={timeZone}
                    />
                  </ActivityFeedItem>
                ))}
              </ActivityFeed>
            </section>
          ))}
      </section>
    </BlockStateProvider>
  )
}

export {
  ActivityFeed1,
  exampleProps as activityFeed1ExampleProps,
  type Activity,
  type ActivityFeed1Props,
}
