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
  },
  {
    name: 'app-shell-04',
    type: 'registry:component',
    registryDependencies: [registryUrl('app-shell'), registryUrl('link')],
    files: [
      {
        path: 'registry/components/dashboardblocks/app-shell/app-shell-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
