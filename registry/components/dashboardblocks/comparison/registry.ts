import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'comparison-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Each metric this period and last, with the difference and the change, under a sentence saying how many improved.',
      size: 'full',
      usedWith: ['stat-group-01', 'line-chart-kpi-01', 'comparison-03'],
    },
  },
  {
    name: 'comparison-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('comparison'),
      registryUrl('details'),
      registryUrl('format'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The lift of a variant over the control, with a 95% confidence interval drawn against zero and what it means.',
      size: 'half',
      usedWith: ['comparison-01', 'funnel-01', 'kpi-03'],
    },
  },
  {
    name: 'comparison-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('comparison'),
      registryUrl('format'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The net change, then the change in each segment as bars either side of zero, from the biggest gain to the biggest drop.',
      size: 'half',
      usedWith: ['comparison-01', 'breakdown-01', 'data-table-01'],
    },
  },
  {
    name: 'comparison-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('comparison'),
      registryUrl('format'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison/comparison-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Two values per row on a shared scale, a hollow dot for before and a filled one for after, with the rows that got worse in grey.',
      size: 'half',
      usedWith: ['comparison-01', 'comparison-03', 'metric-list-03'],
    },
  },
]
