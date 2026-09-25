'use client'

import {
  ActivityFeed02,
  activityFeed02ExampleProps,
} from '@/registry/components/dashboardblocks/activity-feed/activity-feed-02'
import {
  BarChartKPI2,
  barChartKPI2ExampleProps,
} from '@/registry/components/dashboardblocks/kpi/bar-chart-kpi-02'
import {
  ProgressKPI2,
  progressKpi2ExampleProps,
} from '@/registry/components/dashboardblocks/kpi/progress-kpi-02'
import {
  Leaderboard01,
  leaderboard01ExampleProps,
} from '@/registry/components/dashboardblocks/leaderboard/leaderboard-01'
import {
  Leaderboard04,
  leaderboard04ExampleProps,
} from '@/registry/components/dashboardblocks/leaderboard/leaderboard-04'
import {
  UsageMeter8,
  usageMeter8ExampleProps,
} from '@/registry/components/dashboardblocks/usage-meter/usage-meter-08'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

import { SectionHeading } from './section-heading'

export interface CategoryCounts {
  kpi: number
  usageMeter: number
  activityFeed: number
  leaderboard: number
}

export function Categories({ counts }: { counts: CategoryCounts }) {
  return (
    <section className='mx-auto w-full max-w-6xl px-4 py-24'>
      <SectionHeading
        eyebrow='The collection'
        title='Four families. Endless dashboards.'
        description='Every block is a standalone component with sensible defaults and typed props. Mix them, match them, restyle them.'
      />
      <div className='mt-12 grid gap-4 md:grid-cols-3'>
        <CategoryCard
          href='/docs/components/kpi'
          title='KPI'
          description='Headline numbers with trends, sparklines and targets.'
          count={counts.kpi}
          className='md:col-span-2'
        >
          <BarChartKPI2 {...barChartKPI2ExampleProps} />
          <div className='hidden sm:block'>
            <ProgressKPI2 {...progressKpi2ExampleProps} />
          </div>
        </CategoryCard>
        <CategoryCard
          href='/docs/components/usage-meter'
          title='Usage Meter'
          description='Quotas, limits and credits — from bars to liquid gauges.'
          count={counts.usageMeter}
        >
          <UsageMeter8 {...usageMeter8ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/activity-feed'
          title='Activity Feed'
          description='Event streams, timelines and deploy logs.'
          count={counts.activityFeed}
        >
          <ActivityFeed02 {...activityFeed02ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/leaderboard'
          title='Leaderboard'
          description='Ranked lists for pages, people, products and regions.'
          count={counts.leaderboard}
          className='md:col-span-2'
        >
          <Leaderboard04 {...leaderboard04ExampleProps} />
          <div className='hidden sm:block'>
            <Leaderboard01 {...leaderboard01ExampleProps} />
          </div>
        </CategoryCard>
      </div>
    </section>
  )
}

function CategoryCard({
  href,
  title,
  description,
  count,
  className,
  children,
}: {
  href: string
  title: string
  description: string
  count: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group bg-muted/40 hover:border-foreground/20 flex flex-col overflow-hidden rounded-3xl border transition-colors',
        className,
      )}
    >
      <div inert className='home-dots h-80 overflow-hidden select-none'>
        <div className='home-fade flex h-full justify-center gap-4 px-6 pt-8 text-left *:w-80 *:shrink-0 *:transition-transform *:duration-500 *:ease-out motion-safe:group-hover:*:-translate-y-2'>
          {children}
        </div>
      </div>
      <div className='flex items-end justify-between gap-4 px-6 pb-6'>
        <div>
          <h3 className='flex items-center gap-2 text-lg font-semibold'>
            {title}
            <span className='bg-background text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums'>
              {count} blocks
            </span>
          </h3>
          <p className='text-muted-foreground mt-1 text-sm text-pretty'>{description}</p>
        </div>
        <span className='bg-background group-hover:bg-foreground group-hover:text-background flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors'>
          <ArrowUpRight className='size-4 transition-transform motion-safe:group-hover:rotate-45' />
        </span>
      </div>
    </Link>
  )
}
