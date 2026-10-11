import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'gauge-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('gauge'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge/gauge-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A net promoter score on its full −100 to 100 scale, with the split of promoters, passives and detractors.',
      size: 'compact',
      usedWith: ['feedback-01', 'gauge-04', 'chart-panel-01'],
    },
  },
  {
    name: 'gauge-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('gauge')],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge/gauge-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A health score weighted from its contributing factors, marked on poor, fair and good bands.',
      size: 'half',
      usedWith: ['status-01', 'metric-list-03', 'alerts-01'],
    },
  },
  {
    name: 'gauge-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('gauge')],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge/gauge-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'CPU, memory and disk as small gauges, each in the colour of its band with warning and critical thresholds marked.',
      size: 'half',
      usedWith: ['realtime-01', 'status-02', 'alerts-01'],
    },
  },
  {
    name: 'gauge-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('gauge'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge/gauge-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A satisfaction score on an arc with a target tick, the change since last period and the gap to target.',
      size: 'half',
      usedWith: ['gauge-01', 'feedback-02', 'goals-01'],
    },
  },
]
