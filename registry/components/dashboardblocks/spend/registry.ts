import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'spend-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('billing'), registryUrl('spend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/spend/spend-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'spend-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('billing'), registryUrl('spend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/spend/spend-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'spend-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      registryUrl('billing'),
      registryUrl('chart-panel'),
      registryUrl('spend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/spend/spend-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'spend-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      registryUrl('billing'),
      registryUrl('chart-panel'),
      registryUrl('spend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/spend/spend-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
