import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'page-header-01',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('page-header')],
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
    registryDependencies: ['badge', 'button', registryUrl('page-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "A page title with a status badge and links to the page's sections, each with a count.",
      size: 'full',
      usedWith: ['data-table-02', 'record-detail-01'],
    },
  },
  {
    name: 'page-header-03',
    type: 'registry:component',
    registryDependencies: ['avatar', 'badge', 'button', registryUrl('page-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A record header with a back link, an avatar, facts about the record and a menu for less common actions such as delete.',
      size: 'full',
      usedWith: ['record-detail-01', 'record-detail-02', 'record-detail-03'],
    },
  },
  {
    name: 'page-header-04',
    type: 'registry:component',
    registryDependencies: ['badge', 'button', 'input-group', registryUrl('page-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header/page-header-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A page title with a count beside it, and search and the main action on the same row.',
      size: 'full',
      usedWith: ['data-table-02', 'forms-02'],
    },
  },
]
