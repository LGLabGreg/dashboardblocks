import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'files-01',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('files')],
    files: [
      {
        path: 'registry/components/dashboardblocks/files/files-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'files-02',
    type: 'registry:component',
    registryDependencies: [
      'avatar',
      'button',
      'card',
      registryUrl('activity-feed'),
      registryUrl('data-table'),
      registryUrl('files'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/files/files-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'files-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      registryUrl('files'),
      registryUrl('progress-bar'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/files/files-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'files-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('activity-feed'), registryUrl('files')],
    files: [
      {
        path: 'registry/components/dashboardblocks/files/files-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
