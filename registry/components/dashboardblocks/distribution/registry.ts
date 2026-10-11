import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'distribution-01',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('chart-panel'),
      registryUrl('distribution'),
    ],
    meta: {
      shows:
        'Response times in buckets that widen as times grow, with p50, p95 and p99 lines and the buckets over the target in red.',
      size: 'half',
      usedWith: ['distribution-03', 'alerts-02'],
    },
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution/distribution-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'distribution-02',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('chart-panel'),
      registryUrl('distribution'),
    ],
    meta: {
      shows:
        'A box and whiskers per group on a shared axis, to compare spread and median across groups.',
      size: 'half',
      usedWith: ['distribution-03', 'data-table-04'],
    },
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution/distribution-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'distribution-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('distribution')],
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution/distribution-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The median, mean and percentiles of a set of values, with a note when a long tail pulls the mean away.',
      size: 'half',
      usedWith: ['distribution-01', 'stat-group-01'],
    },
  },
  {
    name: 'distribution-04',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('chart-panel'),
      registryUrl('distribution'),
    ],
    meta: {
      shows:
        "This week's distribution over last week's outline, with both medians and the change at the median and p90.",
      size: 'half',
      usedWith: ['distribution-01', 'stat-group-02'],
    },
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution/distribution-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
