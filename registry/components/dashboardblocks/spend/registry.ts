import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'spend-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('billing'), registryUrl('spend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/spend/spend-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "Spend so far against the month's budget, with the projected month end and what is left to spend per day.",
      size: 'half',
      usedWith: ['spend-03', 'forecast-03'],
    },
  },
  {
    name: 'spend-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('billing'), registryUrl('spend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/spend/spend-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'One budget bar per service, each with its own status, and the total underneath.',
      size: 'half',
      usedWith: ['spend-01', 'data-table-04'],
    },
  },
  {
    name: 'spend-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      registryUrl('billing'),
      registryUrl('chart-panel'),
      registryUrl('spend'),
    ],
    meta: {
      shows:
        'Monthly spend as bars against a stepped budget line, with months over budget in red and the year-to-date variance.',
      size: 'full',
      usedWith: ['spend-01', 'spend-02'],
    },
    files: [
      {
        path: 'registry/components/dashboardblocks/spend/spend-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'spend-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      registryUrl('billing'),
      registryUrl('chart-panel'),
      registryUrl('spend'),
    ],
    meta: {
      shows:
        'The cash balance, the average net burn and the months of runway left, with the balance projected to zero.',
      size: 'half',
      usedWith: ['forecast-02', 'billing-04'],
    },
    files: [
      {
        path: 'registry/components/dashboardblocks/spend/spend-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
