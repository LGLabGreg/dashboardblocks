import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'timeline-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('timeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/timeline/timeline-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'timeline-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('timeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/timeline/timeline-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'timeline-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('timeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/timeline/timeline-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'timeline-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('timeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/timeline/timeline-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
