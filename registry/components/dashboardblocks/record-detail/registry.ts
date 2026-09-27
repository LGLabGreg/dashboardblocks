import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'record-detail-01',
    type: 'registry:component',
    registryDependencies: [
      'avatar',
      'badge',
      'button',
      'card',
      'table',
      registryUrl('page-header'),
      registryUrl('record-detail'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/record-detail/record-detail-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'record-detail-02',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      'card',
      'table',
      registryUrl('activity-feed'),
      registryUrl('page-header'),
      registryUrl('record-detail'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/record-detail/record-detail-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'record-detail-03',
    type: 'registry:component',
    registryDependencies: [
      'avatar',
      'badge',
      'button',
      'card',
      'textarea',
      registryUrl('activity-feed'),
      registryUrl('page-header'),
      registryUrl('record-detail'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/record-detail/record-detail-03.tsx',
        type: 'registry:component',
      },
    ],
  },
]
