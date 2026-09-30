'use client'

import {
  ActivityFeed02,
  activityFeed02ExampleProps,
} from '@/registry/components/dashboardblocks/activity-feed/activity-feed-02'
import {
  AppShell3,
  appShell3ExampleProps,
} from '@/registry/components/dashboardblocks/app-shell/app-shell-03'
import {
  ChartPanel1,
  chartPanel1ExampleProps,
} from '@/registry/components/dashboardblocks/chart-panel/chart-panel-01'
import {
  DashboardHeader1,
  dashboardHeader1ExampleProps,
} from '@/registry/components/dashboardblocks/dashboard-header/dashboard-header-01'
import {
  DataTable1,
  dataTable1ExampleProps,
} from '@/registry/components/dashboardblocks/data-table/data-table-01'
import {
  AreaChartKPI1,
  areaChartKpi1ExampleProps,
} from '@/registry/components/dashboardblocks/kpi/area-chart-kpi-01'
import {
  BarChartKPI2,
  barChartKpi2ExampleProps,
} from '@/registry/components/dashboardblocks/kpi/bar-chart-kpi-02'
import {
  ProgressKPI2,
  progressKpi2ExampleProps,
} from '@/registry/components/dashboardblocks/kpi/progress-kpi-02'
import {
  Leaderboard04,
  leaderboard04ExampleProps,
} from '@/registry/components/dashboardblocks/leaderboard/leaderboard-04'
import {
  StatGroup2,
  statGroup2ExampleProps,
} from '@/registry/components/dashboardblocks/stat-group/stat-group-02'
import {
  UsageMeter8,
  usageMeter8ExampleProps,
} from '@/registry/components/dashboardblocks/usage-meter/usage-meter-08'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

/** A few families to show off. The full list follows in AllCategories. */
export function Categories({
  counts,
  familyCount,
}: {
  counts: Record<string, number>
  familyCount: number
}) {
  return (
    <section id='blocks' className='mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-24'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='max-w-xl'>
          <h2 className='text-3xl leading-[1.1] font-medium tracking-[-0.03em] text-balance sm:text-4xl'>
            Pick a family. Build a dashboard.
          </h2>
          <p className='text-muted-foreground mt-3 text-pretty'>
            Every block is a standalone component with typed props and sensible defaults.
            Mix them, match them, restyle them.
          </p>
        </div>
        <Link
          href='#all-blocks'
          className='hover:text-muted-foreground inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors'
        >
          All {familyCount} families
          <ArrowRight className='size-3.5' />
        </Link>
      </div>

      <div className='mt-10 grid grid-cols-1 gap-x-4 gap-y-10 md:grid-cols-2'>
        <CategoryCard
          href='/docs/components/kpi'
          title='KPI'
          description='Headline numbers with trends, sparklines and targets.'
          count={counts.kpi}
          className='md:col-span-2'
        >
          <BarChartKPI2 {...barChartKpi2ExampleProps} />
          <div className='hidden sm:block'>
            <ProgressKPI2 {...progressKpi2ExampleProps} />
          </div>
          <div className='hidden lg:block'>
            <AreaChartKPI1 {...areaChartKpi1ExampleProps} />
          </div>
        </CategoryCard>
        <CategoryCard
          href='/docs/components/chart-panel'
          title='Chart Panel'
          description='Full-size line, area, bar and donut charts with legends and tooltips.'
          count={counts['chart-panel']}
          previewClassName='*:w-80 sm:*:w-[30rem]'
        >
          <ChartPanel1 {...chartPanel1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/stat-group'
          title='Stat Group'
          description='A row of related metrics in one card, with changes and sparklines.'
          count={counts['stat-group']}
          previewClassName='*:w-80 sm:*:w-[30rem]'
        >
          <StatGroup2 {...statGroup2ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/data-table'
          title='Data Table'
          description='TanStack tables with sorting, search, filters, selection and pagination.'
          count={counts['data-table']}
          className='md:col-span-2'
          previewClassName='*:w-80 sm:*:w-[44rem]'
        >
          <DataTable1 {...dataTable1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/usage-meter'
          title='Usage Meter'
          description='Quotas, limits and credits, from bars to liquid gauges.'
          count={counts['usage-meter']}
        >
          <UsageMeter8 {...usageMeter8ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/leaderboard'
          title='Leaderboard'
          description='Ranked lists for pages, people, products and regions.'
          count={counts.leaderboard}
          previewClassName='*:w-80 sm:*:w-96'
        >
          <Leaderboard04 {...leaderboard04ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/app-shell'
          title='App Shell'
          description='The frame around every page: sidebar, workspace switcher, user menu, breadcrumbs and search.'
          count={counts['app-shell']}
          className='md:col-span-2'
          previewClassName='*:w-[64rem] justify-start'
        >
          <div className='page-preview bg-background h-[32rem] rounded-xl shadow-xs ring-1 ring-foreground/10'>
            <AppShell3 {...appShell3ExampleProps} />
          </div>
        </CategoryCard>
        <CategoryCard
          href='/docs/components/activity-feed'
          title='Activity Feed'
          description='Recent activity, record history, notifications and social feeds.'
          count={counts['activity-feed']}
          previewClassName='*:w-80 sm:*:w-96'
        >
          <ActivityFeed02 {...activityFeed02ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/dashboard-header'
          title='Dashboard Header'
          description='Date range presets, compare, filters and export above your dashboard.'
          count={counts['dashboard-header']}
          previewClassName='*:w-80 sm:*:w-[30rem]'
        >
          <div className='bg-background rounded-xl p-4 shadow-xs ring-1 ring-foreground/10'>
            <DashboardHeader1 {...dashboardHeader1ExampleProps} />
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
  previewClassName = '*:w-80',
  children,
}: {
  href: string
  title: string
  description: string
  count: number
  className?: string
  previewClassName?: string
  children: React.ReactNode
}) {
  // The link stretches over the card rather than wrapping it, so previews that
  // contain links (like the app shell) don't nest one link inside another.
  return (
    <div className={cn('group relative flex min-w-0 flex-col gap-4', className)}>
      <div
        inert
        className='bg-muted/70 group-hover:bg-muted group-has-focus-visible:ring-ring h-80 overflow-hidden rounded-2xl transition-colors select-none group-has-focus-visible:ring-2 group-has-focus-visible:ring-offset-2 group-has-focus-visible:ring-offset-background sm:h-96 dark:bg-muted/40 dark:group-hover:bg-muted/60'
      >
        <div
          className={cn(
            'home-fade flex h-full justify-center gap-4 px-6 pt-8 text-left *:shrink-0 *:transition-transform *:duration-500 *:ease-out sm:pt-10 motion-safe:group-hover:*:-translate-y-2',
            previewClassName,
          )}
        >
          {children}
        </div>
      </div>
      <div className='flex items-start justify-between gap-4 px-1'>
        <div className='min-w-0'>
          <h3 className='flex flex-wrap items-baseline gap-x-2 font-medium'>
            <Link href={href} className='outline-none after:absolute after:inset-0'>
              {title}
            </Link>
            <span className='text-muted-foreground text-sm font-normal tabular-nums'>
              {count} {count === 1 ? 'block' : 'blocks'}
            </span>
          </h3>
          <p className='text-muted-foreground mt-1 text-sm text-pretty'>{description}</p>
        </div>
        <ArrowUpRight
          aria-hidden
          className='text-muted-foreground group-hover:text-foreground mt-1 size-4 shrink-0 transition-[color,translate] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5'
        />
      </div>
    </div>
  )
}
