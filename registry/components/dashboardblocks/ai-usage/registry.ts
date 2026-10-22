import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'ai-usage-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('ai-usage'),
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-usage/ai-usage-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Tokens per day stacked by model against the daily average, with the total cost and the cost per million tokens; hovering a day splits it by model.',
      size: 'full',
      usedWith: ['ai-usage-02', 'ai-usage-03', 'ai-usage-04'],
    },
  },
  {
    name: 'ai-usage-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('ai-usage'),
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-usage/ai-usage-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "Model spend by product feature, with each feature's input, cached and output tokens and its cost per thousand requests.",
      size: 'full',
      usedWith: ['ai-usage-01', 'ai-usage-04', 'spend-01'],
    },
  },
  {
    name: 'ai-usage-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('ai-usage'),
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-usage/ai-usage-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Requests, time to first token from the median to the 95th percentile, output speed and error rate for each model.',
      size: 'full',
      usedWith: ['ai-usage-01', 'ai-usage-02'],
    },
  },
  {
    name: 'ai-usage-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('ai-usage'),
      registryUrl('block-state'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-usage/ai-usage-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The share of input tokens served from the cache, what it saved and what the tokens would have cost without it.',
      size: 'half',
      usedWith: ['ai-usage-01', 'ai-usage-02'],
    },
  },
]
