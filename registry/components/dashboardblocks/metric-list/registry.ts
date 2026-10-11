import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'metric-list-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('metric-list')],
    files: [
      {
        path: 'registry/components/dashboardblocks/metric-list/metric-list-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A list of metrics with their change and a 14-day sparkline each.',
      size: 'half',
      usedWith: ['stat-group-02', 'metric-list-02', 'chart-panel-01'],
    },
  },
  {
    name: 'metric-list-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('metric-list')],
    files: [
      {
        path: 'registry/components/dashboardblocks/metric-list/metric-list-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Metrics grouped into sections, each with a header and a count of how many improved.',
      size: 'half',
      usedWith: ['metric-list-01', 'stat-group-01', 'comparison-01'],
    },
  },
  {
    name: 'metric-list-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('metric-list')],
    files: [
      {
        path: 'registry/components/dashboardblocks/metric-list/metric-list-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Metrics against their targets, each with a bar, a tick at the target and a status.',
      size: 'half',
      usedWith: ['goals-02', 'gauge-02', 'metric-list-01'],
    },
  },
  {
    name: 'metric-list-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      registryUrl('chart-panel'),
      registryUrl('metric-list'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/metric-list/metric-list-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A list of metrics where picking one charts it in the same card.',
      size: 'full',
      usedWith: ['stat-group-03', 'metric-list-01', 'chart-panel-01'],
    },
  },
]
