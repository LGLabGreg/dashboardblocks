import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'files-01',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('files'), registryUrl('format')],
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
      'button',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('data-table'),
      registryUrl('files'),
      registryUrl('team'),
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
      registryUrl('block-state'),
      registryUrl('files'),
      registryUrl('format'),
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
        'Storage used against the plan, split by kind of file, with the largest files and the space deleting them would free.',
      size: 'half',
      usedWith: ['files-02', 'usage-meter-01'],
    },
  },
  {
    name: 'files-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('files'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/files/files-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Folders as tiles over a list of files with their size and last change, a path back to the top, and a menu on each file.',
      size: 'full',
      usedWith: ['files-01', 'files-02'],
    },
  },
]
