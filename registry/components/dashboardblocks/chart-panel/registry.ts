import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'chart-panel-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "This period's area against the previous period's dashed line, with the change written as a sentence.",
      size: 'full',
      usedWith: ['stat-group-02', 'breakdown-01', 'data-table-02'],
    },
  },
  {
    name: 'chart-panel-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'tabs',
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('stat-group'),
    ],
    meta: {
      shows:
        'Tabs for related metrics, each showing its total and change, over a chart of the chosen one with its average.',
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
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Monthly totals as stacked bars split by category, with the average and the latest total labelled.',
      size: 'full',
      usedWith: ['breakdown-02', 'data-table-02', 'stat-group-01'],
    },
  },
  {
    name: 'chart-panel-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A single series of bars with the latest period highlighted and labelled, against a goal line.',
      size: 'full',
      usedWith: ['stat-group-02', 'funnel-03', 'activity-feed-01'],
    },
  },
  {
    name: 'chart-panel-05',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('breakdown'),
      registryUrl('chart'),
      registryUrl('ring'),
    ],
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
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel/chart-panel-06.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Several ordered lines, such as percentiles, in one hue from light to full strength, labelled at their ends, against an SLO line.',
      size: 'full',
      usedWith: ['alerts-01', 'status-02', 'deployments-01'],
    },
  },
]
