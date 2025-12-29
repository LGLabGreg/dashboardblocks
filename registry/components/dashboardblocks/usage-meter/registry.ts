import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'usage-meter-01',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('animated-number'),
      registryUrl('icon'),
      registryUrl('progress-bar'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-02',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('animated-number'),
      registryUrl('ring'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-03',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('animated-number'),
      registryUrl('progress-bar'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-04',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('animated-number'),
      registryUrl('icon'),
      registryUrl('progress-bar'),
      registryUrl('trend'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-05',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('animated-number'),
      registryUrl('progress-bar'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-05.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-06',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      registryUrl('animated-number'),
      registryUrl('icon'),
      registryUrl('progress-bar'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-06.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-07',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('animated-number'),
      registryUrl('animated-wave'),
      registryUrl('icon'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-07.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-08',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('animated-number'),
      registryUrl('animated-wave'),
      registryUrl('icon'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-08.tsx',
        type: 'registry:component',
      },
    ],
  },
]
