import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'feedback-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('feedback'),
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('use-reveal'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The average rating as stars, the number of ratings and the share of each star, with the change on the last period and the share rating 4 or 5.',
      size: 'half',
      usedWith: ['feedback-03', 'feedback-04'],
    },
  },
  {
    name: 'feedback-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('feedback'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A diverging bar chart of negative and positive mentions for each topic, sorted by net sentiment, with the best and worst topic in a sentence.',
      size: 'half',
      usedWith: ['feedback-03', 'feedback-01'],
    },
  },
  {
    name: 'feedback-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('feedback'),
      registryUrl('status-label'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The latest reviews with their rating and source, flagging low ratings still waiting for a reply.',
      size: 'half',
      usedWith: ['feedback-01', 'feedback-02'],
    },
  },
  {
    name: 'feedback-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('format'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Weekly customer satisfaction against a target, with the change on the week before and how many weeks met it.',
      size: 'half',
      usedWith: ['feedback-01', 'feedback-03'],
    },
  },
]
