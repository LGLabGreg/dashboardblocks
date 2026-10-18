import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'insights-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('insights'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/insights/insights-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A list of plain-language insights, each with its kind as a coloured word, its topic, the key figures picked out, an optional line on the drivers and a link to explore.',
      size: 'half',
      usedWith: ['insights-02', 'insights-03', 'stat-group-02'],
    },
  },
  {
    name: 'insights-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('insights'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/insights/insights-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An unusual reading against the range it was expected to fall in, with the days outside it shaded, the worst day labelled on the chart, the explanation and likely causes.',
      size: 'half',
      usedWith: ['insights-03', 'chart-panel-01', 'alerts-01'],
    },
  },
  {
    name: 'insights-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('comparison'),
      registryUrl('format'),
      registryUrl('insights'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/insights/insights-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'What contributed to a change, as bars either side of zero, with a sentence naming the biggest driver and the biggest drag.',
      size: 'half',
      usedWith: ['insights-02', 'chart-panel-01', 'breakdown-01'],
    },
  },
  {
    name: 'insights-04',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('block-state'), registryUrl('insights')],
    files: [
      {
        path: 'registry/components/dashboardblocks/insights/insights-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A short weekly summary with a headline, three takeaways and buttons to say whether it helped.',
      size: 'half',
      usedWith: ['insights-01', 'activity-feed-04'],
    },
  },
]
