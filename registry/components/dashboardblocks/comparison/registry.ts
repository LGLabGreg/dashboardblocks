import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'comparison-01',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('comparison'),
      registryUrl('data-table'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Each metric this period and last, with the difference and the change, coloured by whether a rise is good.',
      size: 'full',
      usedWith: ['stat-group-01', 'line-chart-kpi-01', 'comparison-03'],
    },
  },
  {
    name: 'comparison-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('comparison')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The lift of a variant over the control, with a 95% confidence interval drawn against zero.',
      size: 'half',
      usedWith: ['comparison-01', 'funnel-01', 'kpi-03'],
    },
  },
  {
    name: 'comparison-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('comparison')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The change in each segment as bars either side of zero, sorted from the biggest gain to the biggest drop.',
      size: 'half',
      usedWith: ['comparison-01', 'breakdown-01', 'data-table-01'],
    },
  },
  {
    name: 'comparison-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('comparison'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Two values per row on a shared scale, with a hollow dot for before and a filled dot for after.',
      size: 'half',
      usedWith: ['comparison-01', 'comparison-03', 'metric-list-03'],
    },
  },
]
