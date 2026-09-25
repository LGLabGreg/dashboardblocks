'use client'

import {
  ActivityFeed03,
  activityFeed03ExampleProps,
} from '@/registry/components/dashboardblocks/activity-feed/activity-feed-03'
import {
  AreaChartKPI1,
  areaChartKpi1ExampleProps,
} from '@/registry/components/dashboardblocks/kpi/area-chart-kpi-01'
import { KPI1, kpi1ExampleProps } from '@/registry/components/dashboardblocks/kpi/kpi-01'
import { KPI2, kpi2ExampleProps } from '@/registry/components/dashboardblocks/kpi/kpi-02'
import {
  ProgressKPI3,
  progressKpi3ExampleProps,
} from '@/registry/components/dashboardblocks/kpi/progress-kpi-03'
import {
  Leaderboard02,
  leaderboard02ExampleProps,
} from '@/registry/components/dashboardblocks/leaderboard/leaderboard-02'
import {
  UsageMeter2,
  usageMeter2ExampleProps,
} from '@/registry/components/dashboardblocks/usage-meter/usage-meter-02'
import {
  UsageMeter7,
  usageMeter7ExampleProps,
} from '@/registry/components/dashboardblocks/usage-meter/usage-meter-07'

export function Showcase() {
  return (
    <div className='relative mx-auto mt-16 max-w-6xl px-4 [perspective:2400px] md:mt-20'>
      <div className='home-tilt group bg-muted/60 relative rounded-2xl border p-2 shadow-2xl shadow-black/10 backdrop-blur md:rounded-3xl md:p-3 dark:shadow-black/50'>
        <div className='bg-background overflow-hidden rounded-xl border md:rounded-2xl'>
          <div className='flex items-center gap-3 border-b px-4 py-3'>
            <div className='flex gap-1.5'>
              <span className='size-3 rounded-full bg-red-400/80' />
              <span className='size-3 rounded-full bg-amber-400/80' />
              <span className='size-3 rounded-full bg-green-400/80' />
            </div>
            <div className='bg-muted text-muted-foreground mx-auto rounded-md px-3 py-1 font-mono text-xs'>
              your-app.com/dashboard
            </div>
            <div className='w-12' />
          </div>

          <div className='relative grid max-h-[640px] gap-4 overflow-hidden p-4 text-left md:grid-cols-2 lg:grid-cols-3'>
            <div className='flex flex-col gap-4'>
              <KPI1 {...kpi1ExampleProps} />
              <AreaChartKPI1 {...areaChartKpi1ExampleProps} />
              <UsageMeter2 {...usageMeter2ExampleProps} />
            </div>
            <div className='hidden flex-col gap-4 md:flex'>
              <Leaderboard02 {...leaderboard02ExampleProps} />
              <ProgressKPI3 {...progressKpi3ExampleProps} />
            </div>
            <div className='hidden flex-col gap-4 lg:flex'>
              <KPI2 {...kpi2ExampleProps} />
              <UsageMeter7 {...usageMeter7ExampleProps} />
              <ActivityFeed03 {...activityFeed03ExampleProps} />
            </div>
            <div className='from-background pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t' />
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className='from-background pointer-events-none absolute inset-x-0 -bottom-px h-24 bg-gradient-to-t'
      />
    </div>
  )
}
