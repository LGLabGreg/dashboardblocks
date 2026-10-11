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
    meta: {
      shows:
        'Discussion threads with replies, reactions and resolved threads, and a box to start a new one.',
      size: 'half',
      usedWith: ['comments-02', 'activity-feed-01'],
    },
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
    meta: {
      shows:
        'A composer that previews how mentions will look and who will be notified, above the latest updates.',
      size: 'half',
      usedWith: ['comments-01', 'team-01'],
    },
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
    meta: {
      shows:
        'Comments in a column beside a document, each quoting the words it is about, that move to Resolved when closed.',
      size: 'full',
      usedWith: ['comments-01', 'activity-feed-01'],
    },
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
    meta: {
      shows:
        'A support ticket conversation with replies emailed to the customer and internal notes only the team sees.',
      size: 'half',
      usedWith: ['record-detail-01', 'kanban-03'],
    },
  },
]
