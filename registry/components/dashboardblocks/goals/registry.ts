import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'goals-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('goals')],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'goals-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('goals')],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'goals-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('goals')],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'goals-04',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['card', registryUrl('ring')],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals/goals-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
