'use client'

import {
  activityFeedComponents,
  activityFeedExampleProps,
} from '@/registry/components/dashboardblocks/activity-feed/index'
import {
  alertsComponents,
  alertsExampleProps,
} from '@/registry/components/dashboardblocks/alerts/index'
import {
  billingComponents,
  billingExampleProps,
} from '@/registry/components/dashboardblocks/billing/index'
import {
  breakdownComponents,
  breakdownExampleProps,
} from '@/registry/components/dashboardblocks/breakdown/index'
import {
  chartPanelComponents,
  chartPanelExampleProps,
} from '@/registry/components/dashboardblocks/chart-panel/index'
import {
  checklistComponents,
  checklistExampleProps,
} from '@/registry/components/dashboardblocks/checklist/index'
import {
  comparisonComponents,
  comparisonExampleProps,
} from '@/registry/components/dashboardblocks/comparison/index'
import {
  dashboardHeaderComponents,
  dashboardHeaderExampleProps,
} from '@/registry/components/dashboardblocks/dashboard-header/index'
import {
  dataTableComponents,
  dataTableExampleProps,
} from '@/registry/components/dashboardblocks/data-table/index'
import {
  distributionComponents,
  distributionExampleProps,
} from '@/registry/components/dashboardblocks/distribution/index'
import {
  flowComponents,
  flowExampleProps,
} from '@/registry/components/dashboardblocks/flow/index'
import {
  forecastComponents,
  forecastExampleProps,
} from '@/registry/components/dashboardblocks/forecast/index'
import {
  funnelComponents,
  funnelExampleProps,
} from '@/registry/components/dashboardblocks/funnel/index'
import {
  gaugeComponents,
  gaugeExampleProps,
} from '@/registry/components/dashboardblocks/gauge/index'
import {
  geoComponents,
  geoExampleProps,
} from '@/registry/components/dashboardblocks/geo/index'
import {
  goalsComponents,
  goalsExampleProps,
} from '@/registry/components/dashboardblocks/goals/index'
import {
  heatmapComponents,
  heatmapExampleProps,
} from '@/registry/components/dashboardblocks/heatmap/index'
import {
  insightsComponents,
  insightsExampleProps,
} from '@/registry/components/dashboardblocks/insights/index'
import {
  kpiComponents,
  kpiExampleProps,
} from '@/registry/components/dashboardblocks/kpi/index'
import {
  leaderboardComponents,
  leaderboardExampleProps,
} from '@/registry/components/dashboardblocks/leaderboard/index'
import {
  metricListComponents,
  metricListExampleProps,
} from '@/registry/components/dashboardblocks/metric-list/index'
import {
  pipelineComponents,
  pipelineExampleProps,
} from '@/registry/components/dashboardblocks/pipeline/index'
import {
  retentionComponents,
  retentionExampleProps,
} from '@/registry/components/dashboardblocks/retention/index'
import {
  scheduleComponents,
  scheduleExampleProps,
} from '@/registry/components/dashboardblocks/schedule/index'
import {
  spendComponents,
  spendExampleProps,
} from '@/registry/components/dashboardblocks/spend/index'
import {
  statGroupComponents,
  statGroupExampleProps,
} from '@/registry/components/dashboardblocks/stat-group/index'
import {
  statesComponents,
  statesExampleProps,
} from '@/registry/components/dashboardblocks/states/index'
import {
  statusComponents,
  statusExampleProps,
} from '@/registry/components/dashboardblocks/status/index'
import {
  teamComponents,
  teamExampleProps,
} from '@/registry/components/dashboardblocks/team/index'
import {
  usageMeterComponents,
  usageMeterExampleProps,
} from '@/registry/components/dashboardblocks/usage-meter/index'

const exampleComponents = {
  ...kpiComponents,
  ...activityFeedComponents,
  ...usageMeterComponents,
  ...leaderboardComponents,
  ...chartPanelComponents,
  ...breakdownComponents,
  ...funnelComponents,
  ...statusComponents,
  ...statGroupComponents,
  ...dashboardHeaderComponents,
  ...dataTableComponents,
  ...heatmapComponents,
  ...statesComponents,
  ...goalsComponents,
  ...comparisonComponents,
  ...alertsComponents,
  ...geoComponents,
  ...billingComponents,
  ...insightsComponents,
  ...pipelineComponents,
  ...scheduleComponents,
  ...teamComponents,
  ...checklistComponents,
  ...gaugeComponents,
  ...metricListComponents,
  ...forecastComponents,
  ...retentionComponents,
  ...distributionComponents,
  ...spendComponents,
  ...flowComponents,
}

const examplePropsMap = {
  ...kpiExampleProps,
  ...activityFeedExampleProps,
  ...usageMeterExampleProps,
  ...leaderboardExampleProps,
  ...chartPanelExampleProps,
  ...breakdownExampleProps,
  ...funnelExampleProps,
  ...statusExampleProps,
  ...statGroupExampleProps,
  ...dashboardHeaderExampleProps,
  ...dataTableExampleProps,
  ...heatmapExampleProps,
  ...statesExampleProps,
  ...goalsExampleProps,
  ...comparisonExampleProps,
  ...alertsExampleProps,
  ...geoExampleProps,
  ...billingExampleProps,
  ...insightsExampleProps,
  ...pipelineExampleProps,
  ...scheduleExampleProps,
  ...teamExampleProps,
  ...checklistExampleProps,
  ...gaugeExampleProps,
  ...metricListExampleProps,
  ...forecastExampleProps,
  ...retentionExampleProps,
  ...distributionExampleProps,
  ...spendExampleProps,
  ...flowExampleProps,
}

export type ComponentName = keyof typeof exampleComponents

export function ExampleRenderer({ name }: { name: ComponentName }) {
  const Component = exampleComponents[name]
  const props = examplePropsMap[name as keyof typeof examplePropsMap]
  if (!Component) return null
  // oxlint-disable-next-line typescript/no-explicit-any
  return <Component {...(props as any)} />
}
