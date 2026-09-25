import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'leaderboard-01',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['button', 'card', registryUrl('leaderboard')],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'leaderboard-02',
    type: 'registry:component',
    registryDependencies: [
      'avatar',
      'card',
      registryUrl('leaderboard'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'leaderboard-03',
    type: 'registry:component',
    registryDependencies: [
      'avatar',
      'card',
      registryUrl('leaderboard'),
      registryUrl('use-in-view'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'leaderboard-04',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['card', registryUrl('icon'), registryUrl('leaderboard')],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'leaderboard-05',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['button', 'card', registryUrl('leaderboard')],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-05.tsx',
        type: 'registry:component',
      },
    ],
  },
]
