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
  },
]
