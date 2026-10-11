import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'command-menu-01',
    type: 'registry:component',
    registryDependencies: [registryUrl('command-menu')],
    files: [
      {
        path: 'registry/components/dashboardblocks/command-menu/command-menu-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A command palette to jump to a page or run an action, with shortcuts shown beside each action.',
      size: 'half',
      usedWith: ['app-shell-01', 'command-menu-02'],
    },
  },
  {
    name: 'command-menu-02',
    type: 'registry:component',
    registryDependencies: [registryUrl('command-menu')],
    files: [
      {
        path: 'registry/components/dashboardblocks/command-menu/command-menu-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A command palette that shows recent records, then searches customers and orders as you type.',
      size: 'half',
      usedWith: ['command-menu-01', 'data-table-02'],
    },
  },
]
