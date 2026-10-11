import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'kpi-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('kpi')],
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
    registryDependencies: ['card', registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A value with its change shown as a badge beside the label.',
      size: 'compact',
      usedWith: ['kpi-01', 'chart-panel-02', 'stat-group-04'],
    },
  },
  {
    name: 'kpi-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A rate with its previous value underneath and the change in percentage points.',
      size: 'compact',
      usedWith: ['kpi-02', 'funnel-01', 'chart-panel-01'],
    },
  },
  {
    name: 'progress-kpi-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('kpi'), registryUrl('progress-bar')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/progress-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Progress to a monthly target, with a tick where an even pace would be by today and the total you are on pace for.',
      size: 'compact',
      usedWith: ['goals-01', 'forecast-03', 'kpi-01'],
    },
  },
  {
    name: 'progress-kpi-02',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('icon'),
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
      shows: 'The share of work done, with a bar for each status.',
      size: 'compact',
      usedWith: ['progress-kpi-03', 'pipeline-01', 'kanban-01'],
    },
  },
  {
    name: 'progress-kpi-03',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('animated-number'),
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
      shows: 'A count against a goal as a ring, with how many are left to go.',
      size: 'compact',
      usedWith: ['progress-kpi-01', 'goals-04', 'kpi-01'],
    },
  },
  {
    name: 'bar-chart-kpi-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart'), registryUrl('kpi')],
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
    registryDependencies: ['card', registryUrl('chart'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/bar-chart-kpi-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "Each day's value next to its goal, with the share of the goal reached and how many days met it.",
      size: 'compact',
      usedWith: ['goals-02', 'progress-kpi-01', 'chart-panel-01'],
    },
  },
  {
    name: 'line-chart-kpi-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/line-chart-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'This week against the same days last week, drawn as a solid and a dashed line.',
      size: 'compact',
      usedWith: ['bar-chart-kpi-01', 'comparison-01', 'chart-panel-02'],
    },
  },
  {
    name: 'area-chart-kpi-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/area-chart-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Gross profit with its margin, and revenue and profit by day as stacked areas.',
      size: 'compact',
      usedWith: ['spend-01', 'chart-panel-04', 'stat-group-02'],
    },
  },
  {
    name: 'area-chart-kpi-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/area-chart-kpi-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A total with a faint area chart behind it, as a headline card at the top of a dashboard.',
      size: 'compact',
      usedWith: ['stat-group-02', 'kpi-01', 'chart-panel-01'],
    },
  },
]
