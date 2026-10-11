import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'stat-group-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('stat-group')],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Three metrics side by side, each with its change and previous value.',
      size: 'full',
      usedWith: ['chart-panel-01', 'kpi-01', 'comparison-01'],
    },
  },
  {
    name: 'stat-group-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('stat-group')],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A row of metrics, each with its change and a 14-day sparkline.',
      size: 'full',
      usedWith: ['chart-panel-01', 'breakdown-01', 'data-table-02'],
    },
  },
  {
    name: 'stat-group-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      'tabs',
      registryUrl('chart-panel'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A row of metrics where picking one charts it against the previous period.',
      size: 'full',
      usedWith: ['heatmap-01', 'geo-04', 'billing-01'],
    },
  },
  {
    name: 'stat-group-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('stat-group')],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Five metrics in a slim row with their changes, wrapping to two columns when narrow.',
      size: 'full',
      usedWith: ['chart-panel-02', 'kpi-02', 'data-table-01'],
    },
  },
  {
    name: 'stat-group-05',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('stat-group')],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Four metrics that sit in a row, then a 2×2 grid, then a single stack as the card narrows.',
      size: 'full',
      usedWith: ['chart-panel-03', 'kpi-01', 'breakdown-01'],
    },
  },
]
