import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'calendar-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('calendar'), registryUrl('schedule')],
    files: [
      {
        path: 'registry/components/dashboardblocks/calendar/calendar-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'calendar-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('calendar'), registryUrl('schedule')],
    files: [
      {
        path: 'registry/components/dashboardblocks/calendar/calendar-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'calendar-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('calendar'), registryUrl('schedule')],
    files: [
      {
        path: 'registry/components/dashboardblocks/calendar/calendar-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'calendar-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('calendar'), registryUrl('schedule')],
    files: [
      {
        path: 'registry/components/dashboardblocks/calendar/calendar-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
