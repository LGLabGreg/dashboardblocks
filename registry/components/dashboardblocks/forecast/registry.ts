import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'forecast-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('forecast')],
    files: [
      {
        path: 'registry/components/dashboardblocks/forecast/forecast-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'forecast-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('forecast')],
    files: [
      {
        path: 'registry/components/dashboardblocks/forecast/forecast-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'forecast-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('forecast')],
    files: [
      {
        path: 'registry/components/dashboardblocks/forecast/forecast-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'forecast-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      registryUrl('chart-panel'),
      registryUrl('data-table'),
      registryUrl('forecast'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forecast/forecast-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
