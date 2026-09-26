import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'schedule-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('schedule')],
    files: [
      {
        path: 'registry/components/dashboardblocks/schedule/schedule-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'schedule-02',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('schedule')],
    files: [
      {
        path: 'registry/components/dashboardblocks/schedule/schedule-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'schedule-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('schedule')],
    files: [
      {
        path: 'registry/components/dashboardblocks/schedule/schedule-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'schedule-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('schedule')],
    files: [
      {
        path: 'registry/components/dashboardblocks/schedule/schedule-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
