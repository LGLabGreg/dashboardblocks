import { examples as activityFeedExamples } from '@/registry/components/dashboardblocks/activity-feed/registry'
import { examples as kpiExamples } from '@/registry/components/dashboardblocks/kpi/registry'
import { components } from '@/registry/components/dashboardblocks/registry'
import { examples as usageMeterExamples } from '@/registry/components/dashboardblocks/usage-meter/registry'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'dashboardblocks',
  homepage: 'https://dashboardblocks.com',
  items: [...components, ...kpiExamples, ...activityFeedExamples, ...usageMeterExamples],
}

writeFileSync(resolve(process.cwd(), 'registry.json'), JSON.stringify(registry, null, 2))

// eslint-disable-next-line no-console
console.log(`✓ Built registry with ${registry.items.length} items`)
