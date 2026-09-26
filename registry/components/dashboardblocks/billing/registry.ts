import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'billing-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('billing'), registryUrl('chart-panel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing/billing-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'billing-02',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['button', 'card', registryUrl('billing')],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing/billing-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'billing-03',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('billing'),
      registryUrl('data-table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing/billing-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'billing-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('billing'), registryUrl('stat-group')],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing/billing-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
