import { examples as activityFeedExamples } from '@/registry/components/dashboardblocks/activity-feed/registry'
import { examples as breakdownExamples } from '@/registry/components/dashboardblocks/breakdown/registry'
import { examples as chartPanelExamples } from '@/registry/components/dashboardblocks/chart-panel/registry'
import { examples as dashboardHeaderExamples } from '@/registry/components/dashboardblocks/dashboard-header/registry'
import { examples as dashboardExamples } from '@/registry/components/dashboardblocks/dashboards/registry'
import { examples as dataTableExamples } from '@/registry/components/dashboardblocks/data-table/registry'
import { examples as funnelExamples } from '@/registry/components/dashboardblocks/funnel/registry'
import { examples as heatmapExamples } from '@/registry/components/dashboardblocks/heatmap/registry'
import { examples as kpiExamples } from '@/registry/components/dashboardblocks/kpi/registry'
import { examples as leaderboardExamples } from '@/registry/components/dashboardblocks/leaderboard/registry'
import { components } from '@/registry/components/dashboardblocks/registry'
import { examples as statGroupExamples } from '@/registry/components/dashboardblocks/stat-group/registry'
import { examples as statesExamples } from '@/registry/components/dashboardblocks/states/registry'
import { examples as statusExamples } from '@/registry/components/dashboardblocks/status/registry'
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
    ...hooks,
  ],
}

writeFileSync(resolve(process.cwd(), 'registry.json'), JSON.stringify(registry, null, 2))

// oxlint-disable-next-line no-console
console.log(`✓ Built registry with ${registry.items.length} items`)
