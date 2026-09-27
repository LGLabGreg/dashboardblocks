import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'kanban-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('kanban')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kanban/kanban-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'kanban-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('kanban'), registryUrl('pipeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kanban/kanban-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'kanban-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('kanban')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kanban/kanban-03.tsx',
        type: 'registry:component',
      },
    ],
  },
]
