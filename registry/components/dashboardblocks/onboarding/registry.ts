import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'onboarding-01',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      'field',
      'input',
      'input-group',
      registryUrl('checklist'),
      registryUrl('forms'),
      registryUrl('link'),
      registryUrl('onboarding'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/onboarding/onboarding-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'onboarding-02',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      'card',
      registryUrl('block-state'),
      registryUrl('checklist'),
      registryUrl('link'),
      registryUrl('onboarding'),
      registryUrl('progress-bar'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/onboarding/onboarding-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'onboarding-03',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      'card',
      'field',
      'input-group',
      'native-select',
      registryUrl('block-state'),
      registryUrl('link'),
      registryUrl('onboarding'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/onboarding/onboarding-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'onboarding-04',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'field',
      'native-select',
      registryUrl('onboarding'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/onboarding/onboarding-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
