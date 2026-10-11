import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'feedback-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('feedback')],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The average rating as stars, the number of ratings and the share of each star, with the change on the last period.',
      size: 'half',
      usedWith: ['feedback-03', 'feedback-04'],
    },
  },
  {
    name: 'feedback-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('feedback')],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback/feedback-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Negative and positive mentions for each topic either side of a centre line, sorted by net sentiment.',
      size: 'half',
      usedWith: ['feedback-03', 'feedback-01'],
    },
  },
  {
    name: 'feedback-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('feedback'), registryUrl('team')],
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
    registryDependencies: ['card', registryUrl('chart-panel')],
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
