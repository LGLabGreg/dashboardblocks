import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'realtime-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('kpi'),
      registryUrl('leaderboard'),
      registryUrl('realtime'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/realtime/realtime-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Active users now, page views per second over the last minute and the pages with the most people on them.',
      size: 'compact',
      usedWith: ['chart-panel-02', 'geo-03'],
    },
  },
  {
    name: 'realtime-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('realtime'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/realtime/realtime-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Requests per second over the last five minutes, with the peak, the error rate and errors on their own scale.',
      size: 'full',
      usedWith: ['status-02', 'alerts-01', 'deployments-03'],
    },
  },
  {
    name: 'realtime-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('realtime'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/realtime/realtime-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Orders, sign-ups, refunds and messages as they arrive, newest first, with a pause button.',
      size: 'half',
      usedWith: ['realtime-04', 'activity-feed-01'],
    },
  },
  {
    name: 'realtime-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('realtime'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/realtime/realtime-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Running totals since midnight against yesterday at the same time, with orders per hour beside yesterday as a dashed line.',
      size: 'half',
      usedWith: ['realtime-03', 'chart-panel-01'],
    },
  },
]
