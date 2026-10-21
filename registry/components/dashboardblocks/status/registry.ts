import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'status-01',
    type: 'registry:component',
    registryDependencies: [registryUrl('block-state'), registryUrl('status')],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Each service with its current status, the worst one above the title, and a sentence naming the services that are not operational.',
      size: 'half',
      usedWith: ['status-03', 'alerts-01', 'data-table-04'],
    },
  },
  {
    name: 'status-02',
    type: 'registry:component',
    registryDependencies: [registryUrl('block-state'), registryUrl('status')],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Ninety days of daily status for each service as a row of bars, with a tooltip for any day.',
      size: 'full',
      usedWith: ['status-01', 'status-03', 'alerts-01'],
    },
  },
  {
    name: 'status-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('status'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An active incident with its severity, affected components and a timeline of updates.',
      size: 'half',
      usedWith: ['status-01', 'status-02', 'alerts-01'],
    },
  },
  {
    name: 'status-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('status'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Regions, each with its status, p95 latency bar and error rate.',
      size: 'half',
      usedWith: ['status-01', 'status-02', 'alerts-01'],
    },
  },
  {
    name: 'status-05',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('kpi'),
      registryUrl('status'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "One service's uptime, incident count and downtime, with its daily history and recent incidents.",
      size: 'full',
      usedWith: ['status-02', 'status-03', 'alerts-01'],
    },
  },
]
