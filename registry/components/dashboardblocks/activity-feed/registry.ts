import { type Registry } from 'shadcn/schema'

export const examples: Registry['items'] = [
  {
    name: 'activity-feed-01',
    type: 'registry:component',
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
]
