'use client'

import {
  ActivityIcon,
  type ActivityTone,
} from '@/registry/components/dashboardblocks/activity-feed'
import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ActivityCount {
  icon: ReactNode
  label: string
  /** The count for the period before. */
  previous: number
  tone?: ActivityTone
  value: number
}

interface Contributor extends Pick<Person, 'avatar' | 'name'> {
  /** Actions this period. */
  count: number
}

interface ActivityFeed04Props {
  /** Most active first. Shows the first five. */
  contributors: Contributor[]
  counts: ActivityCount[]
  description: string
  title: string
}

const exampleProps: ActivityFeed04Props = {
  contributors: [
    { count: 64, name: 'Kenji Mori' },
    { count: 51, name: 'Priya Nair' },
    { count: 38, name: 'Mei Tanaka' },
    { count: 22, name: 'Tomás Rivera' },
    { count: 17, name: 'Amara Okafor' },
  ],
  counts: [
    {
      icon: (
        <IconPlaceholder
          lucide='CircleCheckIcon'
          tabler='IconCircleCheck'
          hugeicons='CheckmarkCircle02Icon'
          phosphor='CheckCircleIcon'
          remixicon='RiCheckboxCircleLine'
        />
      ),
      label: 'Tasks done',
      previous: 41,
      tone: 'success',
      value: 48,
    },
    {
      icon: (
        <IconPlaceholder
          lucide='MessageSquareIcon'
          tabler='IconMessage'
          hugeicons='MessageIcon'
          phosphor='ChatCircleIcon'
          remixicon='RiChat1Line'
        />
      ),
      label: 'Comments',
      previous: 142,
      tone: 'info',
      value: 126,
    },
    {
      icon: (
        <IconPlaceholder
          lucide='CirclePlusIcon'
          tabler='IconCirclePlus'
          hugeicons='AddCircleIcon'
          phosphor='PlusCircleIcon'
          remixicon='RiAddCircleLine'
        />
      ),
      label: 'Tasks created',
      previous: 37,
      tone: 'accent',
      value: 44,
    },
    {
      icon: (
        <IconPlaceholder
          lucide='UserPlusIcon'
          tabler='IconUserPlus'
          hugeicons='UserAdd01Icon'
          phosphor='UserPlusIcon'
          remixicon='RiUserAddLine'
        />
      ),
      label: 'New members',
      previous: 1,
      tone: 'warning',
      value: 3,
    },
  ],
  description: 'Sep 20 – 26, compared with the week before',
  title: 'This week',
}

const number = new Intl.NumberFormat('en-US')

/** "+7" or "−16", with the direction for screen readers. Activity isn't good or bad, so it stays neutral. */
function Change({ previous, value }: { previous: number; value: number }) {
  const difference = value - previous
  if (difference === 0)
    return <span className='text-muted-foreground text-xs'>No change</span>
  return (
    <span className='text-muted-foreground text-xs tabular-nums'>
      <span aria-hidden>
        {difference > 0 ? '↑ +' : '↓ −'}
        {number.format(Math.abs(difference))}
      </span>
      <span className='sr-only'>
        {difference > 0 ? 'up' : 'down'} {number.format(Math.abs(difference))}
      </span>{' '}
      vs last week
    </span>
  )
}

const ActivityFeed04 = (props: ActivityFeed04Props) => {
  const { contributors, counts, description, title } = props
  const top = contributors.slice(0, 5)
  const max = Math.max(...top.map((person) => person.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <dl className='grid grid-cols-2 gap-x-4 gap-y-5'>
          {counts.map((count) => (
            <div key={count.label} className='flex items-start gap-3'>
              <ActivityIcon className='ring-0' icon={count.icon} tone={count.tone} />
              <div className='flex min-w-0 flex-col'>
                <dt className='text-muted-foreground truncate text-xs'>{count.label}</dt>
                <dd className='text-xl font-semibold tracking-tight tabular-nums'>
                  {number.format(count.value)}
                </dd>
                <dd>
                  <Change previous={count.previous} value={count.value} />
                </dd>
              </div>
            </div>
          ))}
        </dl>
        <section aria-label='Most active' className='flex flex-col gap-3 border-t pt-4'>
          <h3 className='text-muted-foreground text-xs font-medium'>Most active</h3>
          <ol className='flex flex-col gap-2.5'>
            {top.map((person) => (
              <li key={person.name} className='flex items-center gap-3 text-sm'>
                <PersonAvatar person={person} size='sm' />
                <span className='w-28 truncate'>{person.name}</span>
                <span
                  aria-hidden
                  className='bg-muted h-1.5 flex-1 overflow-hidden rounded-full'
                >
                  <span
                    className='bg-chart-1 block h-full rounded-full'
                    style={{ width: `${(person.count / max) * 100}%` }}
                  />
                </span>
                <span className='w-8 text-right tabular-nums'>
                  {number.format(person.count)}
                  <span className='sr-only'> actions</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </CardContent>
    </Card>
  )
}

export {
  ActivityFeed04,
  exampleProps as activityFeed04ExampleProps,
  type ActivityCount,
  type ActivityFeed04Props,
  type Contributor,
}
