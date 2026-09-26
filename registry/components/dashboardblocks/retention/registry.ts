import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'retention-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('heatmap'), registryUrl('retention')],
    files: [
      {
        path: 'registry/components/dashboardblocks/retention/retention-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'retention-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('retention')],
    files: [
      {
        path: 'registry/components/dashboardblocks/retention/retention-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'retention-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('retention')],
    files: [
      {
        path: 'registry/components/dashboardblocks/retention/retention-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'retention-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('retention')],
    files: [
      {
        path: 'registry/components/dashboardblocks/retention/retention-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
