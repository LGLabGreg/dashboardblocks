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
    meta: {
      shows:
        "A dropzone showing the accepted types and size limit, with each upload's progress and cancel, retry and remove actions.",
      size: 'half',
      usedWith: ['files-02', 'files-03'],
    },
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
    meta: {
      shows:
        'A table of files with type, owner, last change and size, with search, type filter, sorting and bulk download or delete.',
      size: 'full',
      usedWith: ['files-01', 'files-03'],
    },
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
    meta: {
      shows:
        'Storage used against the plan, split by kind of file, with the largest files listed to delete.',
      size: 'half',
      usedWith: ['files-02', 'usage-meter-01'],
    },
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
    meta: {
      shows:
        'Folders and files in a grid with a path back to the top, and a menu on each file.',
      size: 'full',
      usedWith: ['files-01', 'files-02'],
    },
  },
]
