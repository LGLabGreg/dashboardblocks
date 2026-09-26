import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'distribution-01',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('chart-panel'),
      registryUrl('distribution'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution/distribution-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'distribution-02',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('chart-panel'),
      registryUrl('distribution'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution/distribution-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'distribution-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('distribution')],
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution/distribution-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'distribution-04',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('chart-panel'),
      registryUrl('distribution'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution/distribution-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
