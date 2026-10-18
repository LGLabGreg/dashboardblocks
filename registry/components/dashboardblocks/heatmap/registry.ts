import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'heatmap-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('heatmap'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/heatmap/heatmap-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'When visitors arrive, as a grid of weekday by hour, darker where there are more.',
      size: 'full',
      usedWith: ['stat-group-03', 'geo-04', 'retention-03'],
    },
  },
  {
    name: 'heatmap-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('heatmap'),
      registryUrl('retention'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/heatmap/heatmap-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The share of each weekly signup cohort still active in each week after signup, as a shaded grid.',
      size: 'full',
      usedWith: ['retention-02', 'retention-04'],
    },
  },
  {
    name: 'heatmap-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('heatmap'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/heatmap/heatmap-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A year of daily values as a calendar grid, darker on busier days.',
      size: 'full',
      usedWith: ['chart-panel-01', 'stat-group-01'],
    },
  },
  {
    name: 'heatmap-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('heatmap'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/heatmap/heatmap-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The p95 latency of each endpoint by hour over the last day, darker where it is slower.',
      size: 'full',
      usedWith: ['alerts-02', 'status-04'],
    },
  },
]
