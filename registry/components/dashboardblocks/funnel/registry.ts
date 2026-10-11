import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'funnel-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('funnel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel/funnel-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Each stage as a bar sized against the first, with the conversion at each step and overall.',
      size: 'half',
      usedWith: ['stat-group-02', 'data-table-02', 'chart-panel-01'],
    },
  },
  {
    name: 'funnel-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('funnel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel/funnel-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Stages as vertical columns, with the share lost at each step shown as the empty track above the column.',
      size: 'full',
      usedWith: ['funnel-04', 'data-table-03'],
    },
  },
  {
    name: 'funnel-03',
    type: 'registry:component',
    registryDependencies: ['badge', 'card', registryUrl('funnel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel/funnel-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A vertical stepper through the stages that calls out the step with the biggest drop-off.',
      size: 'half',
      usedWith: ['chart-panel-04', 'data-table-03'],
    },
  },
  {
    name: 'funnel-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('funnel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel/funnel-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Two segments side by side at every stage, each as a share of its first step, to compare how they convert.',
      size: 'full',
      usedWith: ['funnel-01', 'data-table-03'],
    },
  },
]
