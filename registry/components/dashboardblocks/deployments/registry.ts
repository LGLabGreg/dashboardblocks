import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'deployments-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('deployments'), registryUrl('team')],
    files: [
      {
        path: 'registry/components/dashboardblocks/deployments/deployments-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'deployments-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('deployments')],
    files: [
      {
        path: 'registry/components/dashboardblocks/deployments/deployments-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'deployments-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('deployments')],
    files: [
      {
        path: 'registry/components/dashboardblocks/deployments/deployments-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'deployments-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('deployments')],
    files: [
      {
        path: 'registry/components/dashboardblocks/deployments/deployments-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
