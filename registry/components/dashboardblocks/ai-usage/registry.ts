import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'ai-usage-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('ai-usage'), registryUrl('chart-panel')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-usage/ai-usage-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-usage-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('ai-usage')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-usage/ai-usage-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-usage-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('ai-usage')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-usage/ai-usage-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-usage-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('ai-usage'), registryUrl('ring')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-usage/ai-usage-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
