'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Timeline,
  type TimelineItem,
  TimelineStatusLabel,
  type TimelineStatus,
} from '@/registry/components/dashboardblocks/timeline'

interface Timeline1Props {
  /** Defaults to a sentence about how many projects are running and at risk. */
  description?: string
  end: Date
  /** Leave out, or pass none, to show the empty state. */
  items?: TimelineItem[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  start: Date
  status?: BlockStatus
  title: string
}

const date = (month: number, day: number) => new Date(Date.UTC(2026, month - 1, day))

const exampleProps: Timeline1Props = {
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

const summarize = (items: TimelineItem[]) => {
  const teams = new Set(items.map((item) => item.group).filter(Boolean)).size
  const running = items.filter((item) => item.status === 'in-progress').length
  const atRisk = items.filter((item) => item.status === 'at-risk').length
  const projects = `${items.length} ${items.length === 1 ? 'project' : 'projects'}`
  const across = teams > 1 ? ` across ${teams} teams` : ''
  const risk = atRisk > 0 ? `, and ${atRisk} at risk` : ''
  return `${projects}${across}. ${running} in progress${risk}.`
}

const Timeline1 = (props: Timeline1Props) => {
  const { end, items = [], now, start, status, title } = props
  const { description = summarize(items) } = props
  const state = getBlockState(status, items.length === 0)
  const counts = STATUSES.map((itemStatus) => ({
    count: items.filter((item) => item.status === itemStatus).length,
    status: itemStatus,
  })).filter((entry) => entry.count > 0)

  return (
    <BlockStateProvider status={status} empty={items.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-wrap items-end justify-between gap-x-6 gap-y-2'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          {!state && (
            <ul className='flex flex-wrap gap-x-4 gap-y-1'>
              {counts.map((entry) => (
                <li key={entry.status} className='flex items-center gap-1.5 text-sm'>
                  <TimelineStatusLabel showLabel status={entry.status} />
                  <span className='text-muted-foreground tabular-nums'>
                    {entry.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </header>
        <Timeline
          className='border-t pt-4'
          end={end}
          items={items}
          label={title}
          minWidth='40rem'
          now={now}
          placeholderRows={8}
          start={start}
        >
          Bars fill to each project&apos;s progress. Hover one for its dates.
        </Timeline>
      </section>
    </BlockStateProvider>
  )
}

export { Timeline1, exampleProps as timeline1ExampleProps, type Timeline1Props }
