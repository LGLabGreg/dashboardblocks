import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'settings-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'input',
      registryUrl('settings'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'settings-02',
    type: 'registry:component',
    registryDependencies: ['badge', 'button', 'card', 'input', registryUrl('settings')],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'settings-03',
    type: 'registry:component',
    registryDependencies: ['card', 'switch'],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'settings-04',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'tabs',
      registryUrl('settings'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'settings-05',
    type: 'registry:component',
    registryDependencies: ['badge', 'button', 'card', 'switch', registryUrl('settings')],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-05.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'settings-06',
    type: 'registry:component',
    registryDependencies: ['button', 'card', 'input', registryUrl('settings')],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-06.tsx',
        type: 'registry:component',
      },
    ],
  },
]
