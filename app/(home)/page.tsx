import { activityFeedComponents } from '@/registry/components/dashboardblocks/activity-feed/index'
import { aiAssistantComponents } from '@/registry/components/dashboardblocks/ai-assistant/index'
import { aiUsageComponents } from '@/registry/components/dashboardblocks/ai-usage/index'
import { alertsComponents } from '@/registry/components/dashboardblocks/alerts/index'
import { appShellComponents } from '@/registry/components/dashboardblocks/app-shell/index'
import { authComponents } from '@/registry/components/dashboardblocks/auth/index'
import { billingComponents } from '@/registry/components/dashboardblocks/billing/index'
import { breakdownComponents } from '@/registry/components/dashboardblocks/breakdown/index'
import { calendarComponents } from '@/registry/components/dashboardblocks/calendar/index'
import { chartPanelComponents } from '@/registry/components/dashboardblocks/chart-panel/index'
import { checklistComponents } from '@/registry/components/dashboardblocks/checklist/index'
import { commandMenuComponents } from '@/registry/components/dashboardblocks/command-menu/index'
import { commentsComponents } from '@/registry/components/dashboardblocks/comments/index'
import { comparisonComponents } from '@/registry/components/dashboardblocks/comparison/index'
import { dashboardHeaderComponents } from '@/registry/components/dashboardblocks/dashboard-header/index'
import { dataTableComponents } from '@/registry/components/dashboardblocks/data-table/index'
import { deploymentsComponents } from '@/registry/components/dashboardblocks/deployments/index'
import { distributionComponents } from '@/registry/components/dashboardblocks/distribution/index'
import { errorPagesComponents } from '@/registry/components/dashboardblocks/error-pages/index'
import { feedbackComponents } from '@/registry/components/dashboardblocks/feedback/index'
import { filesComponents } from '@/registry/components/dashboardblocks/files/index'
import { flowComponents } from '@/registry/components/dashboardblocks/flow/index'
import { forecastComponents } from '@/registry/components/dashboardblocks/forecast/index'
import { formsComponents } from '@/registry/components/dashboardblocks/forms/index'
import { funnelComponents } from '@/registry/components/dashboardblocks/funnel/index'
import { gaugeComponents } from '@/registry/components/dashboardblocks/gauge/index'
import { geoComponents } from '@/registry/components/dashboardblocks/geo/index'
import { goalsComponents } from '@/registry/components/dashboardblocks/goals/index'
import { heatmapComponents } from '@/registry/components/dashboardblocks/heatmap/index'
import { insightsComponents } from '@/registry/components/dashboardblocks/insights/index'
import { inventoryComponents } from '@/registry/components/dashboardblocks/inventory/index'
import { invoiceComponents } from '@/registry/components/dashboardblocks/invoice/index'
import { kanbanComponents } from '@/registry/components/dashboardblocks/kanban/index'
import { kpiComponents } from '@/registry/components/dashboardblocks/kpi/index'
import { leaderboardComponents } from '@/registry/components/dashboardblocks/leaderboard/index'
import { metricListComponents } from '@/registry/components/dashboardblocks/metric-list/index'
import { notificationsComponents } from '@/registry/components/dashboardblocks/notifications/index'
import { onboardingComponents } from '@/registry/components/dashboardblocks/onboarding/index'
import { pageHeaderComponents } from '@/registry/components/dashboardblocks/page-header/index'
import { pipelineComponents } from '@/registry/components/dashboardblocks/pipeline/index'
import { realtimeComponents } from '@/registry/components/dashboardblocks/realtime/index'
import { recordDetailComponents } from '@/registry/components/dashboardblocks/record-detail/index'
import { retentionComponents } from '@/registry/components/dashboardblocks/retention/index'
import { scatterComponents } from '@/registry/components/dashboardblocks/scatter/index'
import { scheduleComponents } from '@/registry/components/dashboardblocks/schedule/index'
import { securityComponents } from '@/registry/components/dashboardblocks/security/index'
import { settingsComponents } from '@/registry/components/dashboardblocks/settings/index'
import { spendComponents } from '@/registry/components/dashboardblocks/spend/index'
import { statGroupComponents } from '@/registry/components/dashboardblocks/stat-group/index'
import { statesComponents } from '@/registry/components/dashboardblocks/states/index'
import { statusComponents } from '@/registry/components/dashboardblocks/status/index'
import { teamComponents } from '@/registry/components/dashboardblocks/team/index'
import { timelineComponents } from '@/registry/components/dashboardblocks/timeline/index'
import { usageMeterComponents } from '@/registry/components/dashboardblocks/usage-meter/index'
import type { Metadata } from 'next'

import { AllCategories } from '@/components/home/all-categories'
import { Categories } from '@/components/home/categories'
import { CTA } from '@/components/home/cta'
import { Footer } from '@/components/home/footer'
import { Hero } from '@/components/home/hero'

import { source } from '@/lib/source'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

/** Blocks in each family, by its docs slug. */
const counts: Record<string, number> = {
  'activity-feed': Object.keys(activityFeedComponents).length,
  'ai-assistant': Object.keys(aiAssistantComponents).length,
  'ai-usage': Object.keys(aiUsageComponents).length,
  alerts: Object.keys(alertsComponents).length,
  'app-shell': Object.keys(appShellComponents).length,
  auth: Object.keys(authComponents).length,
  billing: Object.keys(billingComponents).length,
  breakdown: Object.keys(breakdownComponents).length,
  calendar: Object.keys(calendarComponents).length,
  'chart-panel': Object.keys(chartPanelComponents).length,
  checklist: Object.keys(checklistComponents).length,
  'command-menu': Object.keys(commandMenuComponents).length,
  comments: Object.keys(commentsComponents).length,
  comparison: Object.keys(comparisonComponents).length,
  'dashboard-header': Object.keys(dashboardHeaderComponents).length,
  'data-table': Object.keys(dataTableComponents).length,
  deployments: Object.keys(deploymentsComponents).length,
  distribution: Object.keys(distributionComponents).length,
  'error-pages': Object.keys(errorPagesComponents).length,
  feedback: Object.keys(feedbackComponents).length,
  files: Object.keys(filesComponents).length,
  flow: Object.keys(flowComponents).length,
  forecast: Object.keys(forecastComponents).length,
  forms: Object.keys(formsComponents).length,
  funnel: Object.keys(funnelComponents).length,
  gauge: Object.keys(gaugeComponents).length,
  geo: Object.keys(geoComponents).length,
  goals: Object.keys(goalsComponents).length,
  heatmap: Object.keys(heatmapComponents).length,
  insights: Object.keys(insightsComponents).length,
  inventory: Object.keys(inventoryComponents).length,
  invoice: Object.keys(invoiceComponents).length,
  kanban: Object.keys(kanbanComponents).length,
  kpi: Object.keys(kpiComponents).length,
  leaderboard: Object.keys(leaderboardComponents).length,
  'metric-list': Object.keys(metricListComponents).length,
  notifications: Object.keys(notificationsComponents).length,
  onboarding: Object.keys(onboardingComponents).length,
  'page-header': Object.keys(pageHeaderComponents).length,
  pipeline: Object.keys(pipelineComponents).length,
  realtime: Object.keys(realtimeComponents).length,
  'record-detail': Object.keys(recordDetailComponents).length,
  retention: Object.keys(retentionComponents).length,
  scatter: Object.keys(scatterComponents).length,
  schedule: Object.keys(scheduleComponents).length,
  security: Object.keys(securityComponents).length,
  settings: Object.keys(settingsComponents).length,
  spend: Object.keys(spendComponents).length,
  'stat-group': Object.keys(statGroupComponents).length,
  states: Object.keys(statesComponents).length,
  status: Object.keys(statusComponents).length,
  team: Object.keys(teamComponents).length,
  timeline: Object.keys(timelineComponents).length,
  'usage-meter': Object.keys(usageMeterComponents).length,
}
const blockCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

const families = source
  .getPages()
  .filter((page) => page.slugs[0] === 'components')
  .map((page) => ({
    title: page.data.title,
    href: page.url,
    count: counts[page.slugs[1]] ?? 0,
  }))
  .sort((a, b) => a.title.localeCompare(b.title))

export default function HomePage() {
  return (
    <div className='flex flex-1 flex-col items-center'>
      <Hero blockCount={blockCount} />
      <Categories counts={counts} familyCount={families.length} />
      <AllCategories families={families} />
      <CTA blockCount={blockCount} />
      <Footer />
    </div>
  )
}
