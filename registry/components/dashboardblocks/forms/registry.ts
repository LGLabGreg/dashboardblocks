import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'forms-01',
    type: 'registry:component',
    registryDependencies: [
      'card',
      'field',
      'input',
      'native-select',
      'separator',
      'switch',
      'textarea',
      registryUrl('forms'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms/forms-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'forms-02',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      'card',
      'field',
      'input',
      'native-select',
      'textarea',
      registryUrl('forms'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms/forms-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'forms-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'field',
      'input',
      'native-select',
      'switch',
      'textarea',
      registryUrl('forms'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms/forms-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'forms-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('forms')],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms/forms-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
