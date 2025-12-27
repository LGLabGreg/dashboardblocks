import { examples as kpiExamples } from '@/registry/components/dashboardblocks/kpi/registry'
import { components } from '@/registry/components/dashboardblocks/registry'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'dashboardblocks',
  homepage: 'https://dashboardblocks.com',
  items: [...components, ...kpiExamples],
}

writeFileSync(resolve(process.cwd(), 'registry.json'), JSON.stringify(registry, null, 2))

console.log(`✓ Built registry with ${registry.items.length} items`)
