import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'flow-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('flow')],
    files: [
      {
        path: 'registry/components/dashboardblocks/flow/flow-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'flow-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('flow')],
    files: [
      {
        path: 'registry/components/dashboardblocks/flow/flow-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'flow-03',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('billing'),
      registryUrl('chart-panel'),
      registryUrl('flow'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/flow/flow-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'flow-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('flow')],
    files: [
      {
        path: 'registry/components/dashboardblocks/flow/flow-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
