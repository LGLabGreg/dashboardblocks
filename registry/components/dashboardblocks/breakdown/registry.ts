import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'breakdown-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('breakdown')],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown/breakdown-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A single 100% bar splitting a total into categories, with each value and share listed below.',
      size: 'half',
      usedWith: ['chart-panel-01', 'stat-group-02'],
    },
  },
  {
    name: 'breakdown-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('breakdown')],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown/breakdown-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "One bar per group showing its mix of categories, with a chosen category's share labelled on every row.",
      size: 'half',
      usedWith: ['chart-panel-03', 'data-table-02'],
    },
  },
  {
    name: 'breakdown-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('breakdown')],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown/breakdown-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A 10 by 10 grid of squares where each square is 1% of the total, coloured by category.',
      size: 'half',
      usedWith: ['breakdown-01', 'chart-panel-05'],
    },
  },
  {
    name: 'breakdown-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('breakdown')],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown/breakdown-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: "How each category's share of a total moved between two periods.",
      size: 'half',
      usedWith: ['chart-panel-03', 'data-table-03'],
    },
  },
]
