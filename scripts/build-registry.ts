import { examples as activityFeedExamples } from '@/registry/components/dashboardblocks/activity-feed/registry'
import { examples as aiAssistantExamples } from '@/registry/components/dashboardblocks/ai-assistant/registry'
import { examples as aiUsageExamples } from '@/registry/components/dashboardblocks/ai-usage/registry'
import { examples as alertsExamples } from '@/registry/components/dashboardblocks/alerts/registry'
import { examples as appShellExamples } from '@/registry/components/dashboardblocks/app-shell/registry'
import { examples as billingExamples } from '@/registry/components/dashboardblocks/billing/registry'
import { examples as breakdownExamples } from '@/registry/components/dashboardblocks/breakdown/registry'
import { examples as calendarExamples } from '@/registry/components/dashboardblocks/calendar/registry'
import { examples as chartPanelExamples } from '@/registry/components/dashboardblocks/chart-panel/registry'
import { examples as checklistExamples } from '@/registry/components/dashboardblocks/checklist/registry'
import { examples as commandMenuExamples } from '@/registry/components/dashboardblocks/command-menu/registry'
import { examples as commentsExamples } from '@/registry/components/dashboardblocks/comments/registry'
import { examples as comparisonExamples } from '@/registry/components/dashboardblocks/comparison/registry'
import { examples as dashboardHeaderExamples } from '@/registry/components/dashboardblocks/dashboard-header/registry'
import { examples as dashboardExamples } from '@/registry/components/dashboardblocks/dashboards/registry'
import { examples as dataTableExamples } from '@/registry/components/dashboardblocks/data-table/registry'
import { examples as deploymentsExamples } from '@/registry/components/dashboardblocks/deployments/registry'
import { examples as distributionExamples } from '@/registry/components/dashboardblocks/distribution/registry'
import { examples as feedbackExamples } from '@/registry/components/dashboardblocks/feedback/registry'
import { examples as filesExamples } from '@/registry/components/dashboardblocks/files/registry'
import { examples as flowExamples } from '@/registry/components/dashboardblocks/flow/registry'
import { examples as forecastExamples } from '@/registry/components/dashboardblocks/forecast/registry'
import { examples as formsExamples } from '@/registry/components/dashboardblocks/forms/registry'
import { examples as funnelExamples } from '@/registry/components/dashboardblocks/funnel/registry'
import { examples as gaugeExamples } from '@/registry/components/dashboardblocks/gauge/registry'
import { examples as geoExamples } from '@/registry/components/dashboardblocks/geo/registry'
import { examples as goalsExamples } from '@/registry/components/dashboardblocks/goals/registry'
import { examples as heatmapExamples } from '@/registry/components/dashboardblocks/heatmap/registry'
import { examples as insightsExamples } from '@/registry/components/dashboardblocks/insights/registry'
import { examples as inventoryExamples } from '@/registry/components/dashboardblocks/inventory/registry'
import { examples as invoiceExamples } from '@/registry/components/dashboardblocks/invoice/registry'
import { examples as kanbanExamples } from '@/registry/components/dashboardblocks/kanban/registry'
import { examples as kpiExamples } from '@/registry/components/dashboardblocks/kpi/registry'
import { examples as leaderboardExamples } from '@/registry/components/dashboardblocks/leaderboard/registry'
import { examples as metricListExamples } from '@/registry/components/dashboardblocks/metric-list/registry'
import { examples as notificationsExamples } from '@/registry/components/dashboardblocks/notifications/registry'
import { examples as onboardingExamples } from '@/registry/components/dashboardblocks/onboarding/registry'
import { examples as pageHeaderExamples } from '@/registry/components/dashboardblocks/page-header/registry'
import { examples as pipelineExamples } from '@/registry/components/dashboardblocks/pipeline/registry'
import { examples as realtimeExamples } from '@/registry/components/dashboardblocks/realtime/registry'
import { examples as recordDetailExamples } from '@/registry/components/dashboardblocks/record-detail/registry'
import { components } from '@/registry/components/dashboardblocks/registry'
import { examples as retentionExamples } from '@/registry/components/dashboardblocks/retention/registry'
import { examples as scatterExamples } from '@/registry/components/dashboardblocks/scatter/registry'
import { examples as scheduleExamples } from '@/registry/components/dashboardblocks/schedule/registry'
import { examples as securityExamples } from '@/registry/components/dashboardblocks/security/registry'
import { examples as settingsExamples } from '@/registry/components/dashboardblocks/settings/registry'
import { examples as spendExamples } from '@/registry/components/dashboardblocks/spend/registry'
import { examples as statGroupExamples } from '@/registry/components/dashboardblocks/stat-group/registry'
import { examples as statesExamples } from '@/registry/components/dashboardblocks/states/registry'
import { examples as statusExamples } from '@/registry/components/dashboardblocks/status/registry'
import { examples as teamExamples } from '@/registry/components/dashboardblocks/team/registry'
import { examples as timelineExamples } from '@/registry/components/dashboardblocks/timeline/registry'
import { examples as usageMeterExamples } from '@/registry/components/dashboardblocks/usage-meter/registry'
import { hooks } from '@/registry/hooks/registry'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'dashboardblocks',
  homepage: 'https://dashboardblocks.com',
  items: [
    ...components,
    ...kpiExamples,
    ...activityFeedExamples,
    ...usageMeterExamples,
    ...leaderboardExamples,
    ...chartPanelExamples,
    ...breakdownExamples,
    ...funnelExamples,
    ...statusExamples,
    ...statGroupExamples,
    ...dashboardHeaderExamples,
    ...dataTableExamples,
    ...heatmapExamples,
    ...statesExamples,
    ...dashboardExamples,
    ...goalsExamples,
    ...comparisonExamples,
    ...alertsExamples,
    ...geoExamples,
    ...billingExamples,
    ...insightsExamples,
    ...pipelineExamples,
    ...scheduleExamples,
    ...teamExamples,
    ...checklistExamples,
    ...gaugeExamples,
    ...metricListExamples,
    ...forecastExamples,
    ...retentionExamples,
    ...distributionExamples,
    ...spendExamples,
    ...flowExamples,
    ...timelineExamples,
    ...realtimeExamples,
    ...feedbackExamples,
    ...deploymentsExamples,
    ...scatterExamples,
    ...securityExamples,
    ...inventoryExamples,
    ...aiUsageExamples,
    ...settingsExamples,
    ...appShellExamples,
    ...formsExamples,
    ...recordDetailExamples,
    ...pageHeaderExamples,
    ...notificationsExamples,
    ...commandMenuExamples,
    ...kanbanExamples,
    ...commentsExamples,
    ...calendarExamples,
    ...filesExamples,
    ...aiAssistantExamples,
    ...invoiceExamples,
    ...onboardingExamples,
    ...hooks,
  ],
}

writeFileSync(resolve(process.cwd(), 'registry.json'), JSON.stringify(registry, null, 2))

// oxlint-disable-next-line no-console
console.log(`✓ Built registry with ${registry.items.length} items`)
