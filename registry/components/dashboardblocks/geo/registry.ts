import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'geo-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('geo'),
      registryUrl('heatmap'),
      registryUrl('kpi'),
      registryUrl('leaderboard'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/geo/geo-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Revenue by US state as a tile map on a single-hue scale, with the total and the top five states.',
      size: 'full',
      usedWith: ['geo-02', 'chart-panel-01'],
    },
  },
  {
    name: 'geo-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('geo'),
      registryUrl('leaderboard'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/geo/geo-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The leading countries with flags, values and shares, and the rest summed into one row.',
      size: 'half',
      usedWith: ['geo-03', 'chart-panel-02', 'breakdown-01'],
    },
  },
  {
    name: 'geo-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('geo'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/geo/geo-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Active users by city right now as markers sized by value on a dotted world map, with the busiest city named.',
      size: 'full',
      usedWith: ['realtime-01', 'geo-02'],
    },
  },
  {
    name: 'geo-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('breakdown'),
      registryUrl('kpi'),
    ],
    meta: {
      shows:
        'Revenue split across regions, each with its share and its change on the previous quarter.',
      size: 'half',
      usedWith: ['heatmap-01', 'billing-01'],
    },
    files: [
      {
        path: 'registry/components/dashboardblocks/geo/geo-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
