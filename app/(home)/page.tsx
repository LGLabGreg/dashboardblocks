import { activityFeedComponents } from '@/registry/components/dashboardblocks/activity-feed/index'
import { aiUsageComponents } from '@/registry/components/dashboardblocks/ai-usage/index'
import { alertsComponents } from '@/registry/components/dashboardblocks/alerts/index'
import { billingComponents } from '@/registry/components/dashboardblocks/billing/index'
import { breakdownComponents } from '@/registry/components/dashboardblocks/breakdown/index'
import { chartPanelComponents } from '@/registry/components/dashboardblocks/chart-panel/index'
import { checklistComponents } from '@/registry/components/dashboardblocks/checklist/index'
import { comparisonComponents } from '@/registry/components/dashboardblocks/comparison/index'
import { dashboardHeaderComponents } from '@/registry/components/dashboardblocks/dashboard-header/index'
import { dataTableComponents } from '@/registry/components/dashboardblocks/data-table/index'
import { deploymentsComponents } from '@/registry/components/dashboardblocks/deployments/index'
import { distributionComponents } from '@/registry/components/dashboardblocks/distribution/index'
import { feedbackComponents } from '@/registry/components/dashboardblocks/feedback/index'
import { flowComponents } from '@/registry/components/dashboardblocks/flow/index'
import { forecastComponents } from '@/registry/components/dashboardblocks/forecast/index'
import { funnelComponents } from '@/registry/components/dashboardblocks/funnel/index'
import { gaugeComponents } from '@/registry/components/dashboardblocks/gauge/index'
import { geoComponents } from '@/registry/components/dashboardblocks/geo/index'
import { goalsComponents } from '@/registry/components/dashboardblocks/goals/index'
import { heatmapComponents } from '@/registry/components/dashboardblocks/heatmap/index'
import { insightsComponents } from '@/registry/components/dashboardblocks/insights/index'
import { inventoryComponents } from '@/registry/components/dashboardblocks/inventory/index'
import { kpiComponents } from '@/registry/components/dashboardblocks/kpi/index'
import { leaderboardComponents } from '@/registry/components/dashboardblocks/leaderboard/index'
import { metricListComponents } from '@/registry/components/dashboardblocks/metric-list/index'
import { pipelineComponents } from '@/registry/components/dashboardblocks/pipeline/index'
import { realtimeComponents } from '@/registry/components/dashboardblocks/realtime/index'
import { retentionComponents } from '@/registry/components/dashboardblocks/retention/index'
import { scatterComponents } from '@/registry/components/dashboardblocks/scatter/index'
import { scheduleComponents } from '@/registry/components/dashboardblocks/schedule/index'
import { securityComponents } from '@/registry/components/dashboardblocks/security/index'
import { spendComponents } from '@/registry/components/dashboardblocks/spend/index'
import { statGroupComponents } from '@/registry/components/dashboardblocks/stat-group/index'
import { statesComponents } from '@/registry/components/dashboardblocks/states/index'
import { statusComponents } from '@/registry/components/dashboardblocks/status/index'
import { teamComponents } from '@/registry/components/dashboardblocks/team/index'
import { timelineComponents } from '@/registry/components/dashboardblocks/timeline/index'
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
  geo: Object.keys(geoComponents).length,
  billing: Object.keys(billingComponents).length,
  insights: Object.keys(insightsComponents).length,
  pipeline: Object.keys(pipelineComponents).length,
  schedule: Object.keys(scheduleComponents).length,
  team: Object.keys(teamComponents).length,
  checklist: Object.keys(checklistComponents).length,
  gauge: Object.keys(gaugeComponents).length,
  metricList: Object.keys(metricListComponents).length,
  forecast: Object.keys(forecastComponents).length,
  retention: Object.keys(retentionComponents).length,
  distribution: Object.keys(distributionComponents).length,
  spend: Object.keys(spendComponents).length,
  flow: Object.keys(flowComponents).length,
  timeline: Object.keys(timelineComponents).length,
  realtime: Object.keys(realtimeComponents).length,
  feedback: Object.keys(feedbackComponents).length,
  deployments: Object.keys(deploymentsComponents).length,
  scatter: Object.keys(scatterComponents).length,
  security: Object.keys(securityComponents).length,
  inventory: Object.keys(inventoryComponents).length,
  aiUsage: Object.keys(aiUsageComponents).length,
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
