import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'flow-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('flow'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/flow/flow-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Sessions from each source through the landing page, to signing up, browsing on or bouncing.',
      size: 'full',
      usedWith: ['funnel-01', 'chart-panel-02', 'geo-02'],
    },
  },
  {
    name: 'flow-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('flow'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/flow/flow-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Where visitors go in their first pages after landing, with the ones who left at each step.',
      size: 'full',
      usedWith: ['flow-04', 'funnel-01'],
    },
  },
  {
    name: 'flow-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('flow'),
      registryUrl('kpi'),
    ],
    meta: {
      shows:
        "Revenue streams into total revenue, then out to costs and profit, with each part's share of revenue.",
      size: 'full',
      usedWith: ['spend-02', 'billing-01'],
    },
    files: [
      {
        path: 'registry/components/dashboardblocks/flow/flow-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'flow-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('flow'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/flow/flow-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The most common routes as steps, ranked by how many people took them, with how often each reaches the goal.',
      size: 'full',
      usedWith: ['flow-02', 'funnel-03'],
    },
  },
]
