import { examples } from '@/registry/examples/registry'
import { components } from '@/registry/registry'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'dashboardblocks',
  homepage: 'https://dashboardblocks.com',
  items: [...components, ...examples],
}

writeFileSync(resolve(process.cwd(), 'registry.json'), JSON.stringify(registry, null, 2))

console.log(`✓ Built registry with ${registry.items.length} items`)
