import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'dashboard-header-01',
    type: 'registry:component',
    registryDependencies: [registryUrl('dashboard-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header/dashboard-header-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dashboard-header-02',
    type: 'registry:component',
    registryDependencies: [registryUrl('dashboard-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header/dashboard-header-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dashboard-header-03',
    type: 'registry:component',
    registryDependencies: ['button', 'button-group', registryUrl('dashboard-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header/dashboard-header-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dashboard-header-04',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('dashboard-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header/dashboard-header-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
