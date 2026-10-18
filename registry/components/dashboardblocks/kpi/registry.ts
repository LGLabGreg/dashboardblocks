import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'kpi-01',
    type: 'registry:component',
    registryDependencies: [registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A single value with its change and what it is compared with.',
      size: 'compact',
      usedWith: ['kpi-02', 'stat-group-01', 'chart-panel-01'],
    },
  },
  {
    name: 'kpi-02',
    type: 'registry:component',
    registryDependencies: [registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A value with its change written beside the label, for a tight grid of KPIs.',
      size: 'compact',
      usedWith: ['kpi-01', 'chart-panel-02', 'stat-group-04'],
    },
  },
  {
    name: 'kpi-03',
    type: 'registry:component',
    registryDependencies: [registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A rate beside its previous value, with the change in percentage points.',
      size: 'compact',
      usedWith: ['kpi-02', 'funnel-01', 'chart-panel-01'],
    },
  },
  {
    name: 'kpi-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('kpi-provenance'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A value with its change and a button beside it that shows the date range, filters and query behind the number.',
      size: 'compact',
      usedWith: ['kpi-01', 'stat-group-02', 'chart-panel-01'],
    },
  },
  {
    name: 'progress-kpi-01',
    type: 'registry:component',
    registryDependencies: [registryUrl('format'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/progress-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Progress to a monthly target, with the projected total hatched ahead of it and a line where an even pace would be by today.',
      size: 'compact',
      usedWith: ['goals-01', 'forecast-03', 'kpi-01'],
    },
  },
  {
    name: 'progress-kpi-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('progress-bar'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/progress-kpi-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'The share of work done, as one bar split by status with a count for each.',
      size: 'compact',
      usedWith: ['progress-kpi-03', 'pipeline-01', 'kanban-01'],
    },
  },
  {
    name: 'progress-kpi-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('ring'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/progress-kpi-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A count against a goal as a ring, with how many are left and how many a day that takes.',
      size: 'compact',
      usedWith: ['progress-kpi-01', 'goals-04', 'kpi-01'],
    },
  },
  {
    name: 'bar-chart-kpi-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('chart'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/bar-chart-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "The week's total with a bar for each day and the change on the week before.",
      size: 'compact',
      usedWith: ['kpi-01', 'line-chart-kpi-01', 'chart-panel-01'],
    },
  },
  {
    name: 'bar-chart-kpi-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('chart'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/bar-chart-kpi-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "Each day's value with its goal marked on the bar, the share of the goal reached and how many days met it.",
      size: 'compact',
      usedWith: ['goals-02', 'progress-kpi-01', 'chart-panel-01'],
    },
  },
  {
    name: 'line-chart-kpi-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('chart'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/line-chart-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'This week as a filled area over last week as a dashed line, with the days it fell behind.',
      size: 'compact',
      usedWith: ['bar-chart-kpi-01', 'comparison-01', 'chart-panel-02'],
    },
  },
  {
    name: 'area-chart-kpi-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('chart'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/area-chart-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Gross profit with its margin, and profit inside revenue by day, with the best margin day.',
      size: 'compact',
      usedWith: ['spend-01', 'chart-panel-04', 'stat-group-02'],
    },
  },
  {
    name: 'area-chart-kpi-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('chart'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/area-chart-kpi-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A large total with an area chart along the bottom, as a hero number at the top of a dashboard.',
      size: 'compact',
      usedWith: ['stat-group-02', 'kpi-01', 'chart-panel-01'],
    },
  },
]
