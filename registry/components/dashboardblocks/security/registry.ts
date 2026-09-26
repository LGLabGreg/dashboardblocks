import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'security-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'security-02',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('security')],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'security-03',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('security')],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'security-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('ring'), registryUrl('security')],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
