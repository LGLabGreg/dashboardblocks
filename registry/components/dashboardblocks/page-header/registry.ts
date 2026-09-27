import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'page-header-01',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('page-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'page-header-02',
    type: 'registry:component',
    registryDependencies: ['badge', 'button', registryUrl('page-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'page-header-03',
    type: 'registry:component',
    registryDependencies: ['avatar', 'badge', 'button', registryUrl('page-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'page-header-04',
    type: 'registry:component',
    registryDependencies: ['badge', 'button', 'input-group', registryUrl('page-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
