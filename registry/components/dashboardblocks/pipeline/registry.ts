import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'pipeline-01',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['button', 'card', 'dropdown-menu', registryUrl('pipeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/pipeline/pipeline-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'pipeline-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'button-group',
      'card',
      registryUrl('pipeline'),
      registryUrl('use-in-view'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/pipeline/pipeline-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'pipeline-03',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['card', registryUrl('data-table'), registryUrl('pipeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/pipeline/pipeline-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'pipeline-04',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['card', registryUrl('pipeline'), registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/pipeline/pipeline-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
