import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'breakdown-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('breakdown')],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown/breakdown-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'breakdown-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('breakdown')],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown/breakdown-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'breakdown-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('breakdown')],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown/breakdown-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'breakdown-04',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['card', registryUrl('breakdown')],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown/breakdown-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
