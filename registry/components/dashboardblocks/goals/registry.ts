import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'goals-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('goals')],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'One target with an expected-by-today marker, what is left and a projection at the current pace.',
      size: 'half',
      usedWith: ['forecast-03', 'progress-kpi-01', 'goals-03'],
    },
  },
  {
    name: 'goals-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('goals')],
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
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('goals')],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Cumulative progress this month, projected to the end of the month at the current daily rate, against the target line.',
      size: 'full',
      usedWith: ['goals-01', 'forecast-03', 'stat-group-01'],
    },
  },
  {
    name: 'goals-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('ring')],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Small daily goals as rings, with a check mark once a goal is met.',
      size: 'half',
      usedWith: ['progress-kpi-03', 'goals-02', 'checklist-01'],
    },
  },
]
