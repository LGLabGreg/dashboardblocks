import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'scatter-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('scatter')],
    files: [
      {
        path: 'registry/components/dashboardblocks/scatter/scatter-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Pages plotted by load time and conversion rate, grouped by section, with a trend line and how strong the link is.',
      size: 'half',
      usedWith: ['data-table-03', 'distribution-01'],
    },
  },
  {
    name: 'scatter-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('scatter')],
    files: [
      {
        path: 'registry/components/dashboardblocks/scatter/scatter-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Features plotted by usage and satisfaction, split into four labelled quadrants with each point named.',
      size: 'half',
      usedWith: ['leaderboard-01', 'data-table-02'],
    },
  },
  {
    name: 'scatter-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: ['card', registryUrl('chart-panel'), registryUrl('scatter')],
    files: [
      {
        path: 'registry/components/dashboardblocks/scatter/scatter-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Campaigns plotted by cost per acquisition and conversion rate, sized by spend and coloured by channel.',
      size: 'full',
      usedWith: ['data-table-03', 'spend-02'],
    },
  },
  {
    name: 'scatter-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('scatter')],
    files: [
      {
        path: 'registry/components/dashboardblocks/scatter/scatter-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Open risks on a likelihood by impact grid, shaded by level, with the risks in a selected cell listed.',
      size: 'full',
      usedWith: ['alerts-01', 'data-table-04'],
    },
  },
]
