import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'invoice-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('billing'),
      registryUrl('invoice'),
      registryUrl('record-detail'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/invoice/invoice-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'invoice-02',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      registryUrl('billing'),
      registryUrl('invoice'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/invoice/invoice-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'invoice-03',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      registryUrl('billing'),
      registryUrl('invoice'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/invoice/invoice-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'invoice-04',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      registryUrl('billing'),
      registryUrl('invoice'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/invoice/invoice-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
