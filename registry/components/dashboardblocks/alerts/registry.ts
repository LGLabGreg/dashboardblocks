import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'alerts-01',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('alerts')],
    files: [
      {
        path: 'registry/components/dashboardblocks/alerts/alerts-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'alerts-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('alerts'),
      registryUrl('chart-panel'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/alerts/alerts-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'alerts-03',
    type: 'registry:component',
    registryDependencies: [
      'card',
      'switch',
      registryUrl('alerts'),
      registryUrl('data-table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/alerts/alerts-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'alerts-04',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('alerts')],
    files: [
      {
        path: 'registry/components/dashboardblocks/alerts/alerts-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
