import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'activity-feed-01',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'avatar',
      'badge',
      'card',
      registryUrl('activity-feed'),
      registryUrl('icon'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'activity-feed-02',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('activity-feed'),
      registryUrl('icon'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'activity-feed-03',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['avatar', 'button', 'card', registryUrl('activity-feed')],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'activity-feed-04',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      'dropdown-menu',
      registryUrl('activity-feed'),
      registryUrl('icon'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'activity-feed-05',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'avatar',
      'badge',
      'button',
      'card',
      registryUrl('activity-feed'),
      registryUrl('icon'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-05.tsx',
        type: 'registry:component',
      },
    ],
  },
]
