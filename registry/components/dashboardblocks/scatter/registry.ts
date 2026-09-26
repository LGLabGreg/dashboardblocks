import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'scatter-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('scatter')],
    files: [
      {
        path: 'registry/components/dashboardblocks/scatter/scatter-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'scatter-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('scatter')],
    files: [
      {
        path: 'registry/components/dashboardblocks/scatter/scatter-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'scatter-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('scatter')],
    files: [
      {
        path: 'registry/components/dashboardblocks/scatter/scatter-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'scatter-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('scatter')],
    files: [
      {
        path: 'registry/components/dashboardblocks/scatter/scatter-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
