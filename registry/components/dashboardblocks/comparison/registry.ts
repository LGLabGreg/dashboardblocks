import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'comparison-01',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('comparison'),
      registryUrl('data-table'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'comparison-02',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['card', registryUrl('comparison')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'comparison-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('comparison')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'comparison-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('comparison'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
