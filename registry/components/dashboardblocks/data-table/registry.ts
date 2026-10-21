import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'data-table-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('data-table'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A table of rows with sortable column headers.',
      size: 'full',
      usedWith: ['data-table-06', 'stat-group-02'],
    },
  },
  {
    name: 'data-table-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Revenue by product, each with a bar scaled to the top product and its share of the total.',
      size: 'full',
      usedWith: ['chart-panel-01', 'breakdown-01', 'leaderboard-01'],
    },
  },
  {
    name: 'data-table-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('stat-group'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Campaign conversions and cost per conversion, each with its change and a 14-day sparkline.',
      size: 'full',
      usedWith: ['stat-group-02', 'chart-panel-01', 'comparison-01'],
    },
  },
  {
    name: 'data-table-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('data-table'),
      registryUrl('format'),
      registryUrl('status'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Services in a table with their status, latency and error rate, worst status first.',
      size: 'full',
      usedWith: ['status-01', 'alerts-01', 'deployments-01'],
    },
  },
  {
    name: 'data-table-05',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('data-table'),
      registryUrl('format'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A table of recent orders split into pages of five, with controls to move between them.',
      size: 'full',
      usedWith: ['data-table-06', 'billing-03'],
    },
  },
  {
    name: 'data-table-06',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('data-table'),
      registryUrl('details'),
      registryUrl('format'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table/data-table-06.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A searchable table with status and plan filters, a column menu, page sizes and row selection to export or email.',
      size: 'full',
      usedWith: ['data-table-05', 'stat-group-02'],
    },
  },
]
