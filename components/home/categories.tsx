'use client'

import {
  ActivityFeed02,
  activityFeed02ExampleProps,
} from '@/registry/components/dashboardblocks/activity-feed/activity-feed-02'
import {
  Alerts1,
  alerts1ExampleProps,
} from '@/registry/components/dashboardblocks/alerts/alerts-01'
import {
  Billing1,
  billing1ExampleProps,
} from '@/registry/components/dashboardblocks/billing/billing-01'
import {
  Breakdown1,
  breakdown1ExampleProps,
} from '@/registry/components/dashboardblocks/breakdown/breakdown-01'
import {
  ChartPanel1,
  chartPanel1ExampleProps,
} from '@/registry/components/dashboardblocks/chart-panel/chart-panel-01'
import {
  ChartPanel5,
  chartPanel5ExampleProps,
} from '@/registry/components/dashboardblocks/chart-panel/chart-panel-05'
import {
  Checklist1,
  checklist1ExampleProps,
} from '@/registry/components/dashboardblocks/checklist/checklist-01'
import {
  Comparison2,
  comparison2ExampleProps,
} from '@/registry/components/dashboardblocks/comparison/comparison-02'
import {
  DashboardHeader1,
  dashboardHeader1ExampleProps,
} from '@/registry/components/dashboardblocks/dashboard-header/dashboard-header-01'
import {
  DataTable1,
  dataTable1ExampleProps,
} from '@/registry/components/dashboardblocks/data-table/data-table-01'
import {
  Distribution1,
  distribution1ExampleProps,
} from '@/registry/components/dashboardblocks/distribution/distribution-01'
import {
  Flow1,
  flow1ExampleProps,
} from '@/registry/components/dashboardblocks/flow/flow-01'
import {
  Forecast3,
  forecast3ExampleProps,
} from '@/registry/components/dashboardblocks/forecast/forecast-03'
import {
  Funnel1,
  funnel1ExampleProps,
} from '@/registry/components/dashboardblocks/funnel/funnel-01'
import {
  Funnel2,
  funnel2ExampleProps,
} from '@/registry/components/dashboardblocks/funnel/funnel-02'
import {
  Gauge1,
  gauge1ExampleProps,
} from '@/registry/components/dashboardblocks/gauge/gauge-01'
import { Geo3, geo3ExampleProps } from '@/registry/components/dashboardblocks/geo/geo-03'
import {
  Goals1,
  goals1ExampleProps,
} from '@/registry/components/dashboardblocks/goals/goals-01'
import {
  Heatmap1,
  heatmap1ExampleProps,
} from '@/registry/components/dashboardblocks/heatmap/heatmap-01'
import {
  Insights3,
  insights3ExampleProps,
} from '@/registry/components/dashboardblocks/insights/insights-03'
import {
  Insights4,
  insights4ExampleProps,
} from '@/registry/components/dashboardblocks/insights/insights-04'
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
  MetricList1,
  metricList1ExampleProps,
} from '@/registry/components/dashboardblocks/metric-list/metric-list-01'
import {
  Pipeline1,
  pipeline1ExampleProps,
} from '@/registry/components/dashboardblocks/pipeline/pipeline-01'
import {
  Retention1,
  retention1ExampleProps,
} from '@/registry/components/dashboardblocks/retention/retention-01'
import {
  Schedule2,
  schedule2ExampleProps,
} from '@/registry/components/dashboardblocks/schedule/schedule-02'
import {
  Spend1,
  spend1ExampleProps,
} from '@/registry/components/dashboardblocks/spend/spend-01'
import {
  StatGroup2,
  statGroup2ExampleProps,
} from '@/registry/components/dashboardblocks/stat-group/stat-group-02'
import {
  States3,
  states3ExampleProps,
} from '@/registry/components/dashboardblocks/states/states-03'
import {
  Status2,
  status2ExampleProps,
} from '@/registry/components/dashboardblocks/status/status-02'
import {
  Team3,
  team3ExampleProps,
} from '@/registry/components/dashboardblocks/team/team-03'
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
  statGroup: number
  dashboardHeader: number
  chartPanel: number
  breakdown: number
  funnel: number
  status: number
  usageMeter: number
  activityFeed: number
  leaderboard: number
  dataTable: number
  heatmap: number
  states: number
  goals: number
  comparison: number
  alerts: number
  geo: number
  billing: number
  insights: number
  pipeline: number
  schedule: number
  team: number
  checklist: number
  gauge: number
  metricList: number
  forecast: number
  retention: number
  distribution: number
  spend: number
  flow: number
}

export function Categories({ counts }: { counts: CategoryCounts }) {
  return (
    <section className='mx-auto w-full max-w-6xl px-4 py-24'>
      <SectionHeading
        eyebrow='The collection'
        title='Pick a family. Build a dashboard.'
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
          href='/docs/components/stat-group'
          title='Stat Group'
          description='A row of related metrics in one card, with changes, sparklines and tabs.'
          count={counts.statGroup}
          className='md:col-span-2'
          previewClassName='*:w-80 sm:*:w-[36rem]'
        >
          <StatGroup2 {...statGroup2ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/dashboard-header'
          title='Dashboard Header'
          description='Date range presets, compare, filters and export above your dashboard.'
          count={counts.dashboardHeader}
        >
          <div className='bg-background rounded-xl p-4 shadow-xs ring-1 ring-foreground/10'>
            <DashboardHeader1 {...dashboardHeader1ExampleProps} />
          </div>
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
        <CategoryCard
          href='/docs/components/data-table'
          title='Data Table'
          description='Sortable tables with inline bars, trends, sparklines and status.'
          count={counts.dataTable}
          className='md:col-span-3'
          previewClassName='*:w-80 sm:*:w-[44rem]'
        >
          <DataTable1 {...dataTable1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/chart-panel'
          title='Chart Panel'
          description='Full-size line, area, bar and donut charts with legends and tooltips.'
          count={counts.chartPanel}
          className='md:col-span-3'
          previewClassName='*:w-80 sm:*:w-[30rem]'
        >
          <ChartPanel1 {...chartPanel1ExampleProps} />
          <div className='hidden lg:block'>
            <ChartPanel5 {...chartPanel5ExampleProps} />
          </div>
        </CategoryCard>
        <CategoryCard
          href='/docs/components/breakdown'
          title='Breakdown'
          description='How a total splits into parts: segmented bars, waffles and share shifts.'
          count={counts.breakdown}
        >
          <Breakdown1 {...breakdown1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/funnel'
          title='Funnel'
          description='Conversion steps with drop-off, from signups to checkout.'
          count={counts.funnel}
          className='md:col-span-2'
          previewClassName='*:w-80 lg:*:w-[21rem]'
        >
          <Funnel2 {...funnel2ExampleProps} />
          <div className='hidden lg:block'>
            <Funnel1 {...funnel1ExampleProps} />
          </div>
        </CategoryCard>
        <CategoryCard
          href='/docs/components/heatmap'
          title='Heatmap'
          description='Activity by hour, cohort retention, calendars and latency hot spots.'
          count={counts.heatmap}
          className='md:col-span-2'
          previewClassName='*:w-80 sm:*:w-[36rem]'
        >
          <Heatmap1 {...heatmap1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/goals'
          title='Goals'
          description='Targets with pace, projections and daily goal rings.'
          count={counts.goals}
        >
          <Goals1 {...goals1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/status'
          title='Status'
          description='Service status, 90-day uptime, incidents and regional health.'
          count={counts.status}
          className='md:col-span-2'
          previewClassName='*:w-80 sm:*:w-[30rem]'
        >
          <Status2 {...status2ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/states'
          title='States'
          description='Loading, refreshing, empty and error states that keep their layout.'
          count={counts.states}
        >
          <States3 {...states3ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/comparison'
          title='Comparison'
          description='Period over period, A/B tests, what changed and before and after.'
          count={counts.comparison}
        >
          <Comparison2 {...comparison2ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/alerts'
          title='Alerts'
          description='Alert inboxes, threshold breaches, alert rules and severity summaries.'
          count={counts.alerts}
          className='md:col-span-2'
          previewClassName='*:w-80 sm:*:w-[36rem]'
        >
          <Alerts1 {...alerts1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/geo'
          title='Geo'
          description='State tile maps, dotted world maps, top countries and regional splits.'
          count={counts.geo}
          className='md:col-span-2'
          previewClassName='*:w-80 sm:*:w-[32rem]'
        >
          <Geo3 {...geo3ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/billing'
          title='Billing'
          description='MRR movement, the current plan, invoices and revenue metrics.'
          count={counts.billing}
        >
          <Billing1 {...billing1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/insights'
          title='Insights'
          description='Plain-language insights, anomaly callouts, key drivers and weekly digests.'
          count={counts.insights}
          className='md:col-span-3'
          previewClassName='*:w-80 sm:*:w-[30rem]'
        >
          <Insights4 {...insights4ExampleProps} />
          <div className='hidden lg:block'>
            <Insights3 {...insights3ExampleProps} />
          </div>
        </CategoryCard>
        <CategoryCard
          href='/docs/components/pipeline'
          title='Pipeline'
          description='Work in flight across stages: boards, stage totals, stuck items and weighted forecasts.'
          count={counts.pipeline}
          className='md:col-span-2'
          previewClassName='*:w-80 sm:*:w-[40rem]'
        >
          <Pipeline1 {...pipeline1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/team'
          title='Team'
          description='Member lists with presence, workload against capacity, who is online and on-call rotas.'
          count={counts.team}
          previewClassName='*:w-80'
        >
          <Team3 {...team3ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/checklist'
          title='Checklist'
          description='Onboarding checklists, setup steppers and task lists with due dates.'
          count={counts.checklist}
        >
          <Checklist1 {...checklist1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/schedule'
          title='Schedule'
          description='Agendas, month calendars, deadlines and the week ahead.'
          count={counts.schedule}
          className='md:col-span-2'
          previewClassName='*:w-80 sm:*:w-[40rem]'
        >
          <Schedule2 {...schedule2ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/gauge'
          title='Gauge'
          description='NPS, health scores, system load and scores against a target.'
          count={counts.gauge}
        >
          <Gauge1 {...gauge1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/metric-list'
          title='Metric List'
          description='Many metrics in one card, with sparklines, sections, targets and a watchlist.'
          count={counts.metricList}
        >
          <MetricList1 {...metricList1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/forecast'
          title='Forecast'
          description='Actuals running into forecasts, dates to target, run-rates and scenarios.'
          count={counts.forecast}
        >
          <Forecast3 {...forecast3ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/retention'
          title='Retention'
          description='Cohort tables, retention curves, day 1, 7 and 30 milestones and growth accounting.'
          count={counts.retention}
          className='md:col-span-3'
          previewClassName='*:w-80 sm:*:w-[44rem]'
        >
          <Retention1 {...retention1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/distribution'
          title='Distribution'
          description='Histograms with percentiles, box plots by group, spread summaries and before and after comparisons.'
          count={counts.distribution}
          className='md:col-span-2'
          previewClassName='*:w-80 sm:*:w-[40rem]'
        >
          <Distribution1 {...distribution1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/spend'
          title='Spend'
          description='Budget against actual, spend by service, monthly variance, and burn and runway.'
          count={counts.spend}
        >
          <Spend1 {...spend1ExampleProps} />
        </CategoryCard>
        <CategoryCard
          href='/docs/components/flow'
          title='Flow'
          description='Sankey diagrams for traffic and user paths, income flows and the most common routes.'
          count={counts.flow}
          className='md:col-span-3'
          previewClassName='*:w-80 sm:*:w-[44rem]'
        >
          <Flow1 {...flow1ExampleProps} />
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
  return (
    <Link
      href={href}
      className={cn(
        'group bg-muted/40 hover:border-foreground/20 flex flex-col overflow-hidden rounded-3xl border transition-colors',
        className,
      )}
    >
      <div inert className='home-dots h-80 overflow-hidden select-none'>
        <div
          className={cn(
            'home-fade flex h-full justify-center gap-4 px-6 pt-8 text-left *:shrink-0 *:transition-transform *:duration-500 *:ease-out motion-safe:group-hover:*:-translate-y-2',
            previewClassName,
          )}
        >
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
