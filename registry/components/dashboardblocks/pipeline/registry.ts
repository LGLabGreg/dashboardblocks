import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'pipeline-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'dropdown-menu',
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('pipeline'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/pipeline/pipeline-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A board with a column for each stage showing its item count and total value, and a card for each item that can be moved from its menu.',
      size: 'full',
      usedWith: ['pipeline-02', 'pipeline-03', 'funnel-01'],
    },
  },
  {
    name: 'pipeline-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'button-group',
      registryUrl('block-state'),
      registryUrl('breakdown'),
      registryUrl('chart'),
      registryUrl('format'),
      registryUrl('pipeline'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/pipeline/pipeline-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Open value across stages, with each stage as a segment sized by value or by count.',
      size: 'full',
      usedWith: ['pipeline-01', 'funnel-01', 'stat-group-02'],
    },
  },
  {
    name: 'pipeline-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('pipeline'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/pipeline/pipeline-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Items that have been in a stage longer than expected, longest first, with how long they have waited and who owns them.',
      size: 'full',
      usedWith: ['pipeline-01', 'pipeline-02'],
    },
  },
  {
    name: 'pipeline-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('goals'),
      registryUrl('pipeline'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/pipeline/pipeline-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Closed and open deals weighted by the chance each stage closes, per owner, against their quota.',
      size: 'full',
      usedWith: ['pipeline-02', 'forecast-03', 'leaderboard-01'],
    },
  },
]
