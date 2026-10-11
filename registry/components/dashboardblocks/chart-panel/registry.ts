import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'chart-panel-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "This period's line against the previous period's, muted, so the current trend leads.",
      size: 'full',
      usedWith: ['stat-group-02', 'breakdown-01', 'data-table-02'],
    },
  },
  {
    name: 'chart-panel-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      'tabs',
      registryUrl('chart-panel'),
      registryUrl('trend'),
    ],
    meta: {
      shows:
        'A chart with tabs for related metrics, each tab showing its total and change.',
      size: 'full',
      usedWith: ['realtime-01', 'leaderboard-01', 'geo-02'],
    },
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart-panel-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Monthly totals as stacked bars split by category, with a legend.',
      size: 'full',
      usedWith: ['breakdown-02', 'data-table-02', 'stat-group-01'],
    },
  },
  {
    name: 'chart-panel-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A single series of bars with the latest period highlighted and labelled.',
      size: 'full',
      usedWith: ['stat-group-02', 'funnel-03', 'activity-feed-01'],
    },
  },
  {
    name: 'chart-panel-05',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A donut splitting a total into parts, with each value and share listed beside it.',
      size: 'half',
      usedWith: ['breakdown-01', 'leaderboard-01'],
    },
  },
  {
    name: 'chart-panel-06',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-06.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Several ordered lines, such as percentiles, in one hue from light to full strength, each labelled at its end.',
      size: 'full',
      usedWith: ['alerts-01', 'status-02', 'deployments-01'],
    },
  },
]
