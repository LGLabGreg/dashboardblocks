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
    registryDependencies: ['card', 'https://dashboardblocks.com/r/icon.json'],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-02.tsx',
        type: 'registry:component',
      },
    ],
  },
]
