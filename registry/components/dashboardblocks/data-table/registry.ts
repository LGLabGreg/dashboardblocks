import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'data-table-01',
    type: 'registry:component',
    registryDependencies: ['button', 'card', 'dropdown-menu', registryUrl('data-table')],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'data-table-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('data-table')],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'data-table-03',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('data-table'),
      registryUrl('stat-group'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'data-table-04',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'dropdown-menu',
      registryUrl('data-table'),
      registryUrl('status'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'data-table-05',
    type: 'registry:component',
    registryDependencies: ['badge', 'button', 'card', registryUrl('data-table')],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-05.tsx',
        type: 'registry:component',
      },
    ],
  },
]
