import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'forecast-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('forecast'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forecast/forecast-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Weekly actuals continuing into a dashed forecast, with a shaded 80% range and a marker for today.',
      size: 'full',
      usedWith: ['forecast-04', 'chart-panel-01', 'stat-group-01'],
    },
  },
  {
    name: 'forecast-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('forecast'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forecast/forecast-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The running total heading for a goal line, with the forecast, its 80% range, the deadline and the date it gets there.',
      size: 'half',
      usedWith: ['forecast-01', 'goals-01', 'progress-kpi-01'],
    },
  },
  {
    name: 'forecast-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('forecast'),
      registryUrl('format'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forecast/forecast-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Month to date, projected to the end of the month at the daily run-rate, with what is needed per day to hit the target.',
      size: 'half',
      usedWith: ['goals-01', 'goals-03', 'progress-kpi-01'],
    },
  },
  {
    name: 'forecast-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('data-table'),
      registryUrl('forecast'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forecast/forecast-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Low, base and high growth scenarios from the last actual, as a chart and a table with when each one reaches the target.',
      size: 'full',
      usedWith: ['forecast-01', 'forecast-02', 'goals-03'],
    },
  },
]
