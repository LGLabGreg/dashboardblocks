import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'feedback-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('feedback')],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'feedback-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('feedback')],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'feedback-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('feedback'), registryUrl('team')],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'feedback-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
