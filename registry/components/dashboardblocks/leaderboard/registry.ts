import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'leaderboard-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('leaderboard'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Ranked rows with a background bar sized relative to the leader.',
      size: 'half',
      usedWith: ['breakdown-01', 'geo-02', 'chart-panel-02'],
    },
  },
  {
    name: 'leaderboard-02',
    type: 'registry:component',
    registryDependencies: [
      'avatar',
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('leaderboard'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'People ranked by revenue with a bar to their quota and the change since the last period.',
      size: 'half',
      usedWith: ['team-01', 'leaderboard-04', 'chart-panel-01'],
    },
  },
  {
    name: 'leaderboard-03',
    type: 'registry:component',
    registryDependencies: [
      'avatar',
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('leaderboard'),
      registryUrl('use-reveal'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The top three on a podium sized by their totals, with the rest of the field listed below.',
      size: 'half',
      usedWith: ['leaderboard-02', 'team-02', 'chart-panel-01'],
    },
  },
  {
    name: 'leaderboard-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('leaderboard'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Products ranked by revenue with how far each moved in the ranking since the last period.',
      size: 'half',
      usedWith: ['leaderboard-01', 'breakdown-01', 'chart-panel-01'],
    },
  },
  {
    name: 'leaderboard-05',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('geo'),
      registryUrl('leaderboard'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard/leaderboard-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'A ranked list that can be reversed and expanded to show every entry.',
      size: 'half',
      usedWith: ['leaderboard-01', 'data-table-01', 'breakdown-01'],
    },
  },
]
