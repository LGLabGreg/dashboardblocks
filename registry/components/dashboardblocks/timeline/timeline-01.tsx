'use client'

import {
  Timeline,
  type TimelineItem,
  TimelineStatusLabel,
  type TimelineStatus,
} from '@/registry/components/dashboardblocks/timeline'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Timeline1Props {
  description: string
  end: Date
  items: TimelineItem[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  start: Date
  title: string
}

const date = (month: number, day: number) => new Date(Date.UTC(2026, month - 1, day))

const exampleProps: Timeline1Props = {
  description: 'Q3 and Q4 2026, by team',
  end: date(12, 31),
  items: [
    {
      end: date(8, 14),
      group: 'Platform',
      id: 'sso',
      label: 'SSO and SCIM',
      progress: 1,
      start: date(7, 1),
      status: 'done',
    },
    {
      end: date(10, 23),
      group: 'Platform',
      id: 'audit',
      label: 'Audit log export',
      progress: 0.62,
      start: date(8, 17),
      status: 'in-progress',
    },
    {
      end: date(12, 11),
      group: 'Platform',
      id: 'regions',
      label: 'EU data residency',
      progress: 0.18,
      start: date(9, 14),
      status: 'at-risk',
    },
    {
      end: date(9, 4),
      group: 'Growth',
      id: 'onboarding',
      label: 'New onboarding',
      progress: 1,
      start: date(7, 13),
      status: 'done',
    },
    {
      end: date(11, 6),
      group: 'Growth',
      id: 'pricing',
      label: 'Usage-based pricing',
      progress: 0.44,
      start: date(8, 31),
      status: 'in-progress',
    },
    {
      end: date(12, 18),
      group: 'Growth',
      id: 'referrals',
      label: 'Referral program',
      start: date(11, 2),
      status: 'planned',
    },
    {
      end: date(10, 9),
      group: 'Mobile',
      id: 'offline',
      label: 'Offline mode',
      progress: 0.81,
      start: date(7, 20),
      status: 'in-progress',
    },
    {
      end: date(12, 31),
      group: 'Mobile',
      id: 'widgets',
      label: 'Home screen widgets',
      start: date(10, 19),
      status: 'planned',
    },
  ],
  now: date(9, 26),
  start: date(7, 1),
  title: 'Product roadmap',
}

const STATUSES: TimelineStatus[] = ['done', 'in-progress', 'at-risk', 'planned']

const Timeline1 = (props: Timeline1Props) => {
  const { description, end, items, now, start, title } = props
  const counts = STATUSES.map((status) => ({
    count: items.filter((item) => item.status === status).length,
    status,
  })).filter((entry) => entry.count > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ul className='flex flex-wrap gap-x-4 gap-y-1'>
          {counts.map((entry) => (
            <li key={entry.status} className='flex items-center gap-1.5 text-sm'>
              <TimelineStatusLabel showLabel status={entry.status} />
              <span className='text-muted-foreground tabular-nums'>{entry.count}</span>
            </li>
          ))}
        </ul>
        <Timeline end={end} items={items} minWidth='40rem' now={now} start={start}>
          Bars fill to each project&apos;s progress. Hover one for its dates.
        </Timeline>
      </CardContent>
    </Card>
  )
}

export { Timeline1, exampleProps as timeline1ExampleProps, type Timeline1Props }
