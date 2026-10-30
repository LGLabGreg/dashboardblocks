import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'app-shell-01',
    type: 'registry:component',
    registryDependencies: ['separator', 'sidebar', registryUrl('app-shell')],
    files: [
      {
        path: 'registry/components/dashboardblocks/app-shell/app-shell-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A sidebar app shell with a workspace switcher, navigation sections with count badges, a user menu and a top bar with breadcrumbs, search and notifications.',
      size: 'page',
      usedWith: ['app-shell-02'],
    },
  },
  {
    name: 'app-shell-02',
    type: 'registry:component',
    registryDependencies: ['button', 'separator', 'sidebar', registryUrl('app-shell')],
    files: [
      {
        path: 'registry/components/dashboardblocks/app-shell/app-shell-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An app shell whose sidebar collapses to icons with tooltips, with nested links and help and settings pinned to the bottom.',
      size: 'page',
      usedWith: ['app-shell-01'],
    },
  },
  {
    name: 'app-shell-03',
    type: 'registry:component',
    registryDependencies: ['separator', 'sidebar', registryUrl('app-shell')],
    files: [
      {
        path: 'registry/components/dashboardblocks/app-shell/app-shell-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An app shell with the page set in a card beside the sidebar, and plan usage with an upgrade link above the user menu.',
      size: 'page',
      usedWith: ['app-shell-01'],
    },
  },
  {
    name: 'app-shell-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('app-shell'),
      registryUrl('link'),
      registryUrl('tag'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/app-shell/app-shell-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An app shell with no sidebar: page links sit under the top bar and scroll sideways on small screens.',
      size: 'page',
      usedWith: ['app-shell-01'],
    },
  },
]
