import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'realtime-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('realtime')],
    files: [
      {
        path: 'registry/components/dashboardblocks/realtime/realtime-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'realtime-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('realtime')],
    files: [
      {
        path: 'registry/components/dashboardblocks/realtime/realtime-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'realtime-03',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('realtime')],
    files: [
      {
        path: 'registry/components/dashboardblocks/realtime/realtime-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'realtime-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('realtime')],
    files: [
      {
        path: 'registry/components/dashboardblocks/realtime/realtime-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
