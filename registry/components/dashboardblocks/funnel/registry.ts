import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'funnel-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('funnel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel/funnel-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'funnel-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('funnel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel/funnel-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'funnel-03',
    type: 'registry:component',
    registryDependencies: ['badge', 'card', registryUrl('funnel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel/funnel-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'funnel-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('funnel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel/funnel-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
