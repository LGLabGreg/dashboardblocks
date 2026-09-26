import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'gauge-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('gauge'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge/gauge-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'gauge-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('gauge')],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge/gauge-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'gauge-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('gauge')],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge/gauge-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'gauge-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('gauge'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge/gauge-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
