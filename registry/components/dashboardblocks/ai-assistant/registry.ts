import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'ai-assistant-01',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('ai-assistant')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-assistant/ai-assistant-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-assistant-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('ai-assistant')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-assistant/ai-assistant-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-assistant-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('ai-assistant'), registryUrl('ai-usage')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-assistant/ai-assistant-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-assistant-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('ai-assistant')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-assistant/ai-assistant-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
