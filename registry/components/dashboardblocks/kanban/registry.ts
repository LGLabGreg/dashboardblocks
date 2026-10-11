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
    meta: {
      shows:
        'A sprint board of issues in columns with labels, assignees, due dates and priorities, and warnings when a column passes its limit.',
      size: 'full',
      usedWith: ['comments-04', 'calendar-01'],
    },
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
    meta: {
      shows:
        'A sales board of deals in columns, each column showing its total value and each deal its next step.',
      size: 'full',
      usedWith: ['pipeline-01', 'funnel-01'],
    },
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
    meta: {
      shows:
        'A support queue of tickets with priority and time left to their SLA, where a full column refuses more tickets.',
      size: 'full',
      usedWith: ['comments-04', 'status-01'],
    },
  },
]
