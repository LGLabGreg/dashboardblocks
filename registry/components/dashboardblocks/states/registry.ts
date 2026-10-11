import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'states-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      registryUrl('block-state'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/states/states-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Grey placeholders shaped like a row of stats, shown while data loads so nothing shifts when it arrives.',
      size: 'full',
      usedWith: ['stat-group-02', 'states-04'],
    },
  },
  {
    name: 'states-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('block-state'),
      registryUrl('chart-panel'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/states/states-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A chart that stays in place at reduced opacity while it refreshes, with an updating indicator in the header.',
      size: 'half',
      usedWith: ['chart-panel-01', 'states-01'],
    },
  },
  {
    name: 'states-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      registryUrl('block-state'),
      registryUrl('dashboard-header'),
      registryUrl('data-table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/states/states-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A filtered table with no matching rows, explaining why it is empty and offering a way out.',
      size: 'full',
      usedWith: ['data-table-02', 'dashboard-header-01'],
    },
  },
  {
    name: 'states-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('block-state'),
      registryUrl('chart-panel'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/states/states-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A card that says what went wrong when loading fails and offers to try again.',
      size: 'half',
      usedWith: ['states-01', 'alerts-01'],
    },
  },
]
