import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'checklist-01',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('checklist'),
      registryUrl('ring'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist/checklist-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'checklist-02',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['button', 'card', registryUrl('checklist')],
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist/checklist-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'checklist-03',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('checklist'),
      registryUrl('progress-bar'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist/checklist-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'checklist-04',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: ['card', registryUrl('checklist'), registryUrl('progress-bar')],
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist/checklist-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
