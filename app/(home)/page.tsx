import { activityFeedComponents } from '@/registry/components/dashboardblocks/activity-feed/index'
import { alertsComponents } from '@/registry/components/dashboardblocks/alerts/index'
import { breakdownComponents } from '@/registry/components/dashboardblocks/breakdown/index'
import { chartPanelComponents } from '@/registry/components/dashboardblocks/chart-panel/index'
import { comparisonComponents } from '@/registry/components/dashboardblocks/comparison/index'
import { dashboardHeaderComponents } from '@/registry/components/dashboardblocks/dashboard-header/index'
import { dataTableComponents } from '@/registry/components/dashboardblocks/data-table/index'
import { funnelComponents } from '@/registry/components/dashboardblocks/funnel/index'
import { goalsComponents } from '@/registry/components/dashboardblocks/goals/index'
import { heatmapComponents } from '@/registry/components/dashboardblocks/heatmap/index'
import { kpiComponents } from '@/registry/components/dashboardblocks/kpi/index'
import { leaderboardComponents } from '@/registry/components/dashboardblocks/leaderboard/index'
import { pipelineComponents } from '@/registry/components/dashboardblocks/pipeline/index'
import { scheduleComponents } from '@/registry/components/dashboardblocks/schedule/index'
import { statGroupComponents } from '@/registry/components/dashboardblocks/stat-group/index'
import { statesComponents } from '@/registry/components/dashboardblocks/states/index'
import { statusComponents } from '@/registry/components/dashboardblocks/status/index'
import { usageMeterComponents } from '@/registry/components/dashboardblocks/usage-meter/index'

import { Categories } from '@/components/home/categories'
import { CTA } from '@/components/home/cta'
import { Hero } from '@/components/home/hero'
import { Steps } from '@/components/home/steps'

const counts = {
  kpi: Object.keys(kpiComponents).length,
  statGroup: Object.keys(statGroupComponents).length,
  dashboardHeader: Object.keys(dashboardHeaderComponents).length,
  chartPanel: Object.keys(chartPanelComponents).length,
  breakdown: Object.keys(breakdownComponents).length,
  funnel: Object.keys(funnelComponents).length,
  status: Object.keys(statusComponents).length,
  usageMeter: Object.keys(usageMeterComponents).length,
  activityFeed: Object.keys(activityFeedComponents).length,
  leaderboard: Object.keys(leaderboardComponents).length,
  dataTable: Object.keys(dataTableComponents).length,
  heatmap: Object.keys(heatmapComponents).length,
  states: Object.keys(statesComponents).length,
  goals: Object.keys(goalsComponents).length,
  comparison: Object.keys(comparisonComponents).length,
  alerts: Object.keys(alertsComponents).length,
  pipeline: Object.keys(pipelineComponents).length,
  schedule: Object.keys(scheduleComponents).length,
}
const blockCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

export default function HomePage() {
  return (
    <div className='flex flex-1 flex-col items-center'>
      <Hero blockCount={blockCount} />
      <Categories counts={counts} />
      <Steps />
      <CTA blockCount={blockCount} />
    </div>
  )
}
