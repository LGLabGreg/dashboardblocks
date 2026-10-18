import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'goals-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('goals'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'One target with an expected-by-today marker, the projection at the current pace hatched on the bar, and what is left to do each day.',
      size: 'half',
      usedWith: ['forecast-03', 'progress-kpi-01', 'goals-03'],
    },
  },
  {
    name: 'goals-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('goals'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Several goals for the same period, each with its own pace.',
      size: 'half',
      usedWith: ['goals-01', 'metric-list-03', 'forecast-02'],
    },
  },
  {
    name: 'goals-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('goals'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Cumulative progress this month, projected to the end of the month at the current daily rate, with the day it reaches the target or how far short it ends.',
      size: 'full',
      usedWith: ['goals-01', 'forecast-03', 'stat-group-01'],
    },
  },
  {
    name: 'goals-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('ring'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Small daily goals as rings, with what is left to do or how far past the goal each one is.',
      size: 'half',
      usedWith: ['progress-kpi-03', 'goals-02', 'checklist-01'],
    },
  },
]
