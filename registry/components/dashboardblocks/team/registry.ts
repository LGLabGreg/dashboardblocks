import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'team-01',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['button', 'card', registryUrl('team')],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'team-02',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['card', registryUrl('team')],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'team-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('team')],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'team-04',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('progress-bar'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
