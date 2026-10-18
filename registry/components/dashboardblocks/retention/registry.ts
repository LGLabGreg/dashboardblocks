import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'retention-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('heatmap'),
      registryUrl('kpi'),
      registryUrl('retention'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/retention/retention-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A retention triangle with a row per cohort and a weighted average row, shaded by share.',
      size: 'full',
      usedWith: ['retention-02', 'heatmap-02'],
    },
  },
  {
    name: 'retention-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('kpi'),
      registryUrl('retention'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/retention/retention-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "Every cohort's retention curve, with one highlighted against the average and where the average levels off.",
      size: 'full',
      usedWith: ['retention-01', 'retention-04'],
    },
  },
  {
    name: 'retention-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('kpi'),
      registryUrl('retention'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/retention/retention-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Day 1, 7 and 30 retention for the latest cohort, with the change against the cohort before written out.',
      size: 'compact',
      usedWith: ['heatmap-01', 'retention-01', 'funnel-01'],
    },
  },
  {
    name: 'retention-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart-panel'),
      registryUrl('kpi'),
      registryUrl('retention'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/retention/retention-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Users gained above the axis and lost below it, with the net change and the quick ratio.',
      size: 'full',
      usedWith: ['retention-01', 'stat-group-02'],
    },
  },
]
