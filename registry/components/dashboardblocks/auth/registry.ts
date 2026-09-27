import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'auth-01',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('team'), registryUrl('auth')],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'auth-02',
    type: 'registry:component',
    registryDependencies: ['button', 'input', registryUrl('auth')],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'auth-03',
    type: 'registry:component',
    registryDependencies: ['button', 'input', 'switch', registryUrl('auth')],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'auth-04',
    type: 'registry:component',
    registryDependencies: ['button', 'input', registryUrl('auth')],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
