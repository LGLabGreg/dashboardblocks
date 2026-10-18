'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  chartFadedColor,
  TinyBarChart,
} from '@/registry/components/dashboardblocks/chart'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import { type ReactNode, useId } from 'react'

import { cn } from '@/lib/utils'

interface ActivityCount {
  icon?: ReactNode
  label: string
  previous: number
  value: number
}

interface ActivityDay {
  /** The day's name, such as "Thursday". */
  day: string
  /** The same day a week earlier, shown in the tooltip and the week's change. */
  previous: number
  value: number
}

interface Contributor extends Pick<Person, 'avatar' | 'name'> {
  count: number
}

interface ActivityFeed4Props {
  /** Most active first. */
  contributors?: Contributor[]
  counts?: ActivityCount[]
  /** One entry per day, in order. Leave out, or pass none, to show the empty state. */
  days?: ActivityDay[]
  /** The dates the week covers, such as "Sep 20 – 26". */
  range: string
  status?: BlockStatus
  title: string
}

const exampleProps: ActivityFeed4Props = {
  contributors: [
    { avatar: '/images/avatar-07.webp', count: 64, name: 'Kenji Mori' },
    { avatar: '/images/avatar-02.webp', count: 51, name: 'Priya Nair' },
    { count: 38, name: 'Mei Tanaka' },
    { count: 22, name: 'Kenji Watanabe' },
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
      previous: 128,
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
      previous: 35,
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
      value: 3,
    },
  ],
  days: [
    { day: 'Sunday', previous: 9, value: 12 },
    { day: 'Monday', previous: 36, value: 41 },
    { day: 'Tuesday', previous: 41, value: 39 },
    { day: 'Wednesday', previous: 33, value: 46 },
    { day: 'Thursday', previous: 38, value: 58 },
    { day: 'Friday', previous: 42, value: 21 },
    { day: 'Saturday', previous: 6, value: 4 },
  ],
  range: 'Sep 20 – 26',
  title: 'This week',
}

const CHART_COLOR = 'var(--color-chart-2)'
const COMPARISON = 'last week'

const formatCount = (value: number) => formatNumber(value, { maximumFractionDigits: 0 })

function CountChange({ previous, value }: { previous: number; value: number }) {
  const difference = value - previous
  return (
    <span className='text-muted-foreground'>
      <span
        className={cn(
          'font-medium tabular-nums',
          difference > 0 && 'text-emerald-700 dark:text-emerald-400',
          difference < 0 && 'text-red-700 dark:text-red-400',
        )}
      >
        {difference === 0
          ? 'No change'
          : `${difference > 0 ? 'Up' : 'Down'} ${formatCount(Math.abs(difference))}`}
      </span>{' '}
      from <span className='tabular-nums'>{formatCount(previous)}</span> {COMPARISON}
    </span>
  )
}

const ActivityFeed4 = (props: ActivityFeed4Props) => {
  const { contributors = [], counts = [], days = [], range, status, title } = props
  const id = useId()
  const state = getBlockState(status, days.length === 0)
  const total = days.reduce((sum, day) => sum + day.value, 0)
  const previousTotal = days.reduce((sum, day) => sum + day.previous, 0)
  const busiest = days.reduce(
    (best, day, index) => (day.value > (days[best]?.value ?? -1) ? index : best),
    0,
  )
  const top = contributors.slice(0, 5)
  const max = Math.max(...top.map((person) => person.count), 1)
  const compare = (day: ActivityDay) => {
    const difference = day.value - day.previous
    if (difference === 0) return 'the same as the week before'
    return `${formatCount(Math.abs(difference))} ${difference > 0 ? 'more' : 'fewer'} than the ${day.day} before`
  }

  return (
    <BlockStateProvider status={status} empty={days.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {range}
            {!state && days[busiest] ? `, busiest on ${days[busiest].day}.` : '.'}
          </p>
        </header>
        <div className='flex flex-col gap-1'>
          {state ? (
            <KPIValue />
          ) : (
            <p className='text-4xl font-light tracking-tight tabular-nums'>
              {formatCount(total)}
              <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                actions
              </span>
            </p>
          )}
          <KPIChange
            comparison={COMPARISON}
            format={formatCount}
            previous={previousTotal}
            value={total}
          />
        </div>
        <div className='flex flex-col gap-2'>
          <div aria-hidden>
            <TinyBarChart
              accessibilityLayer={false}
              bars={[{ dataKey: 'value', fill: CHART_COLOR }]}
              data={days.map((day) => ({ label: day.day, value: day.value }))}
              formatter={(value) =>
                `${formatCount(value)} ${value === 1 ? 'action' : 'actions'}`
              }
              height={128}
              highlightIndex={busiest}
              xAxisKey='label'
            />
          </div>
          <ul className='sr-only'>
            {!state &&
              days.map((day) => (
                <li key={day.day}>
                  {day.day}: {formatCount(day.value)}{' '}
                  {day.value === 1 ? 'action' : 'actions'}, {compare(day)}.
                </li>
              ))}
          </ul>
        </div>
        {state === 'loading' && (
          <div aria-hidden className='grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-4'>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className='flex flex-col gap-1.5'>
                <SkeletonText className='w-20 text-sm' />
                <SkeletonText className='w-12 text-2xl' />
                <SkeletonText className='w-32 text-xs' />
              </div>
            ))}
          </div>
        )}
        {!state && (
          <dl className='grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-4'>
            {counts.map((count) => (
              <div key={count.label} className='flex min-w-0 flex-col gap-0.5'>
                <dt className='text-muted-foreground flex items-center gap-1.5 text-sm [&_svg]:size-3.5 [&_svg]:shrink-0'>
                  {count.icon}
                  <span className='truncate'>{count.label}</span>
                </dt>
                <dd className='text-2xl font-light tracking-tight tabular-nums'>
                  {formatCount(count.value)}
                </dd>
                <dd className='text-xs'>
                  <CountChange previous={count.previous} value={count.value} />
                </dd>
              </div>
            ))}
          </dl>
        )}
        {state !== 'error' && state !== 'empty' && (
          <section aria-labelledby={id} className='flex flex-col gap-3 border-t pt-4'>
            <h3 id={id} className='text-sm font-medium'>
              Most active
            </h3>
            {state === 'loading' && <BlockStateRows rows={5} />}
            {!state && (
              <ol className='flex flex-col gap-2.5'>
                {top.map((person, index) => (
                  <li key={person.name} className='flex items-center gap-3 text-sm'>
                    <PersonAvatar person={person} size='sm' />
                    <span className='w-28 truncate'>{person.name}</span>
                    <span aria-hidden className='h-1.5 flex-1'>
                      <span
                        className='block h-full rounded-full'
                        style={{
                          backgroundColor:
                            index === 0 ? CHART_COLOR : chartFadedColor(CHART_COLOR),
                          width: `${(person.count / max) * 100}%`,
                        }}
                      />
                    </span>
                    <span className='w-8 text-right tabular-nums'>
                      {formatCount(person.count)}
                      <span className='sr-only'> actions</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  ActivityFeed4,
  exampleProps as activityFeed4ExampleProps,
  type ActivityCount,
  type ActivityDay,
  type ActivityFeed4Props,
  type Contributor,
}
