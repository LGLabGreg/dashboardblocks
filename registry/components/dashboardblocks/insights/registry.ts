import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'insights-01',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('insights')],
    files: [
      {
        path: 'registry/components/dashboardblocks/insights/insights-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'insights-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('chart-panel'),
      registryUrl('insights'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/insights/insights-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'insights-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('comparison'), registryUrl('insights')],
    files: [
      {
        path: 'registry/components/dashboardblocks/insights/insights-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'insights-04',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('insights')],
    files: [
      {
        path: 'registry/components/dashboardblocks/insights/insights-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
