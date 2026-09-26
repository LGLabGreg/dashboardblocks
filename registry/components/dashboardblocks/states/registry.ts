import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'states-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      registryUrl('block-state'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/states/states-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'states-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('block-state'),
      registryUrl('chart-panel'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/states/states-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'states-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      registryUrl('block-state'),
      registryUrl('dashboard-header'),
      registryUrl('data-table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/states/states-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'states-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('block-state'),
      registryUrl('chart-panel'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/states/states-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
