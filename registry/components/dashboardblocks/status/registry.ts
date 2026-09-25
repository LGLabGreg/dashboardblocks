import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'status-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('status')],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'status-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('status')],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'status-03',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['button', 'card', registryUrl('status')],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'status-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('status')],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'status-05',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('status')],
    files: [
      {
        path: 'registry/components/dashboardblocks/status/status-05.tsx',
        type: 'registry:component',
      },
    ],
  },
]
