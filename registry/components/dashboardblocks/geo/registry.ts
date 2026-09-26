import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'geo-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('geo'), registryUrl('heatmap')],
    files: [
      {
        path: 'registry/components/dashboardblocks/geo/geo-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'geo-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('geo')],
    files: [
      {
        path: 'registry/components/dashboardblocks/geo/geo-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'geo-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('geo')],
    files: [
      {
        path: 'registry/components/dashboardblocks/geo/geo-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'geo-04',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('breakdown'),
      registryUrl('comparison'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/geo/geo-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
