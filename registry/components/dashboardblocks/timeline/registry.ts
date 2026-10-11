import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'timeline-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('timeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/timeline/timeline-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Projects grouped by team, each a bar from start to end filled to its progress, with a line for today.',
      size: 'full',
      usedWith: ['timeline-02', 'timeline-04', 'pipeline-01'],
    },
  },
  {
    name: 'timeline-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('timeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/timeline/timeline-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A launch plan as a list on a rail, with the next milestone highlighted and how soon or how late each one is.',
      size: 'half',
      usedWith: ['timeline-01', 'checklist-01'],
    },
  },
  {
    name: 'timeline-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('timeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/timeline/timeline-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Every release on one line, sized as major, minor or patch, with the median gap and days since the last one.',
      size: 'full',
      usedWith: ['deployments-01', 'deployments-03'],
    },
  },
  {
    name: 'timeline-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('timeline')],
    files: [
      {
        path: 'registry/components/dashboardblocks/timeline/timeline-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "Each phase's plan as a dashed outline with what actually happened as a bar beneath it, and how many days it slipped.",
      size: 'full',
      usedWith: ['timeline-01', 'timeline-02'],
    },
  },
]
