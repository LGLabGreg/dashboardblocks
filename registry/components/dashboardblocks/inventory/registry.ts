import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'inventory-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('inventory')],
    files: [
      {
        path: 'registry/components/dashboardblocks/inventory/inventory-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'inventory-02',
    type: 'registry:component',
    registryDependencies: ['card'],
    files: [
      {
        path: 'registry/components/dashboardblocks/inventory/inventory-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'inventory-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('billing'), registryUrl('inventory')],
    files: [
      {
        path: 'registry/components/dashboardblocks/inventory/inventory-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'inventory-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('inventory')],
    files: [
      {
        path: 'registry/components/dashboardblocks/inventory/inventory-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
