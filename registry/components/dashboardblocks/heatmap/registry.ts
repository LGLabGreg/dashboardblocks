import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'heatmap-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('heatmap')],
    files: [
      {
        path: 'registry/components/dashboardblocks/heatmap/heatmap-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'heatmap-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('heatmap')],
    files: [
      {
        path: 'registry/components/dashboardblocks/heatmap/heatmap-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'heatmap-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('heatmap')],
    files: [
      {
        path: 'registry/components/dashboardblocks/heatmap/heatmap-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'heatmap-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('heatmap')],
    files: [
      {
        path: 'registry/components/dashboardblocks/heatmap/heatmap-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
