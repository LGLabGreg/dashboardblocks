import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'chart-panel-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart-panel-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      'tabs',
      registryUrl('chart-panel'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart-panel-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart-panel-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart-panel-05',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-05.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart-panel-06',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-06.tsx',
        type: 'registry:component',
      },
    ],
  },
]
