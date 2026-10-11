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
    meta: {
      shows:
        'Items at or near their reorder point, soonest to run out first, with how much to order and which will run out before an order arrives.',
      size: 'full',
      usedWith: ['inventory-02', 'inventory-03', 'inventory-04'],
    },
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
    meta: {
      shows:
        'Units stored against capacity in each warehouse, with what arrives this week and which will be nearly full.',
      size: 'half',
      usedWith: ['inventory-01', 'inventory-03'],
    },
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
    meta: {
      shows:
        'Every SKU by stock status, with the value of stock on hand and how many times a year it turns over.',
      size: 'full',
      usedWith: ['inventory-01', 'inventory-02', 'stat-group-02'],
    },
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
    meta: {
      shows:
        "One item's stock day by day at its current demand, with incoming orders, the reorder point and when it runs out.",
      size: 'full',
      usedWith: ['inventory-01', 'inventory-03'],
    },
  },
]
