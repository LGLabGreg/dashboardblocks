import { type Registry } from 'shadcn/schema'

export const examples: Registry['items'] = [
  {
    name: 'activity-feed-01',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'avatar',
      'badge',
      'card',
      'https://dashboardblocks.com/r/activity-feed.json',
      'https://dashboardblocks.com/r/icon.json',
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
      'https://dashboardblocks.com/r/activity-feed.json',
      'https://dashboardblocks.com/r/icon.json',
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
    registryDependencies: [
      'avatar',
      'button',
      'card',
      'https://dashboardblocks.com/r/activity-feed.json',
    ],
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
      'https://dashboardblocks.com/r/activity-feed.json',
      'https://dashboardblocks.com/r/icon.json',
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
      'https://dashboardblocks.com/r/activity-feed.json',
      'https://dashboardblocks.com/r/icon.json',
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-05.tsx',
        type: 'registry:component',
      },
    ],
  },
]
