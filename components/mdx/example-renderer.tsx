'use client'

import {
  activityFeedComponents,
  activityFeedExampleProps,
} from '@/registry/components/dashboardblocks/activity-feed/index'
import {
  breakdownComponents,
  breakdownExampleProps,
} from '@/registry/components/dashboardblocks/breakdown/index'
import {
  chartPanelComponents,
  chartPanelExampleProps,
} from '@/registry/components/dashboardblocks/chart-panel/index'
import {
  dashboardHeaderComponents,
  dashboardHeaderExampleProps,
} from '@/registry/components/dashboardblocks/dashboard-header/index'
import {
  funnelComponents,
  funnelExampleProps,
} from '@/registry/components/dashboardblocks/funnel/index'
import {
  kpiComponents,
  kpiExampleProps,
} from '@/registry/components/dashboardblocks/kpi/index'
import {
  leaderboardComponents,
  leaderboardExampleProps,
} from '@/registry/components/dashboardblocks/leaderboard/index'
import {
  statGroupComponents,
  statGroupExampleProps,
} from '@/registry/components/dashboardblocks/stat-group/index'
import {
  statusComponents,
  statusExampleProps,
} from '@/registry/components/dashboardblocks/status/index'
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
}

export type ComponentName = keyof typeof exampleComponents

export function ExampleRenderer({ name }: { name: ComponentName }) {
  const Component = exampleComponents[name]
  const props = examplePropsMap[name as keyof typeof examplePropsMap]
  if (!Component) return null
  // oxlint-disable-next-line typescript/no-explicit-any
  return <Component {...(props as any)} />
}
