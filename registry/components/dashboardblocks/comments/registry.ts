import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'comments-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('comments')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comments/comments-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'comments-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'separator',
      'tabs',
      registryUrl('comments'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/comments/comments-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'comments-03',
    type: 'registry:component',
    registryDependencies: ['badge', 'card', 'tabs', registryUrl('comments')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comments/comments-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'comments-04',
    type: 'registry:component',
    registryDependencies: ['badge', 'card', 'tabs', registryUrl('comments')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comments/comments-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
