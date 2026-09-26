import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'metric-list-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('metric-list')],
    files: [
      {
        path: 'registry/components/dashboardblocks/metric-list/metric-list-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'metric-list-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('metric-list')],
    files: [
      {
        path: 'registry/components/dashboardblocks/metric-list/metric-list-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'metric-list-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('metric-list')],
    files: [
      {
        path: 'registry/components/dashboardblocks/metric-list/metric-list-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'metric-list-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      registryUrl('chart-panel'),
      registryUrl('metric-list'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/metric-list/metric-list-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
