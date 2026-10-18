import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'deployments-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('deployments'),
      registryUrl('details'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/deployments/deployments-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The latest builds, each with its commit, environment, author, duration and status.',
      size: 'full',
      usedWith: ['deployments-02', 'deployments-04', 'activity-feed-05'],
    },
  },
  {
    name: 'deployments-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('deployments'),
      registryUrl('details'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/deployments/deployments-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'What each environment is running, and how many commits are waiting to be promoted to the next one.',
      size: 'half',
      usedWith: ['deployments-01', 'deployments-04', 'status-01'],
    },
  },
  {
    name: 'deployments-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('deployments'),
      registryUrl('details'),
      registryUrl('format'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/deployments/deployments-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The four DORA delivery metrics, each with its performance band and the change on the previous period.',
      size: 'full',
      usedWith: ['deployments-01', 'deployments-04', 'chart-panel-01'],
    },
  },
  {
    name: 'deployments-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('deployments'),
      registryUrl('format'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/deployments/deployments-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The latest runs of each pipeline as a strip of results, with the pass rate and median duration.',
      size: 'half',
      usedWith: ['deployments-01', 'deployments-03'],
    },
  },
]
