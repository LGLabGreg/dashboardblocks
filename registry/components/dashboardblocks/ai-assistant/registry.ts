import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'ai-assistant-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('ai-assistant'),
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-assistant/ai-assistant-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An assistant docked beside the page with suggested prompts, the page as context, and new chat and close buttons.',
      size: 'page',
      usedWith: ['ai-assistant-02'],
    },
  },
  {
    name: 'ai-assistant-02',
    type: 'registry:component',
    registryDependencies: [registryUrl('ai-assistant'), registryUrl('block-state')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-assistant/ai-assistant-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A chat with an assistant whose replies include a list and a SQL query, with copy, rating, regenerate and follow-up questions.',
      size: 'half',
      usedWith: ['ai-assistant-01', 'ai-assistant-04'],
    },
  },
  {
    name: 'ai-assistant-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('ai-assistant'),
      registryUrl('ai-usage'),
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('format'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-assistant/ai-assistant-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Questions about token usage numbers, with the tokens and cost shown for each answer.',
      size: 'half',
      usedWith: ['ai-usage-01', 'ai-assistant-02'],
    },
  },
  {
    name: 'ai-assistant-04',
    type: 'registry:component',
    registryDependencies: [registryUrl('ai-assistant'), registryUrl('block-state')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-assistant/ai-assistant-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A failed assistant reply kept in the conversation with a button to try again.',
      size: 'half',
      usedWith: ['ai-assistant-02', 'states-01'],
    },
  },
]
