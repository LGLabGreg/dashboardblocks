import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'page-header-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('page-header'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A page title and description with a secondary action and a main action.',
      size: 'full',
      usedWith: ['data-table-02', 'forms-01'],
    },
  },
  {
    name: 'page-header-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('page-header'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "A page title with its status as a coloured word and links to the page's sections, each with a count.",
      size: 'full',
      usedWith: ['data-table-02', 'record-detail-01'],
    },
  },
  {
    name: 'page-header-03',
    type: 'registry:component',
    registryDependencies: [
      'avatar',
      'button',
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('page-header'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "A record header with a back link, a photo, the record's key numbers in a row and a menu for less common actions such as delete.",
      size: 'full',
      usedWith: ['record-detail-01', 'record-detail-02', 'record-detail-03'],
    },
  },
  {
    name: 'page-header-04',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'input-group',
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('page-header'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A page title with its count beside it, and search and the main action on the same row.',
      size: 'full',
      usedWith: ['data-table-02', 'forms-02'],
    },
  },
]
