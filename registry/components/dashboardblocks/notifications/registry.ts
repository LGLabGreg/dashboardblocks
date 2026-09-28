import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'notifications-01',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('notifications')],
    files: [
      {
        path: 'registry/components/dashboardblocks/notifications/notifications-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'notifications-02',
    type: 'registry:component',
    registryDependencies: ['button', 'tabs', registryUrl('notifications')],
    files: [
      {
        path: 'registry/components/dashboardblocks/notifications/notifications-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'notifications-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'tabs',
      registryUrl('activity-feed'),
      registryUrl('notifications'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/notifications/notifications-03.tsx',
        type: 'registry:component',
      },
    ],
  },
]
