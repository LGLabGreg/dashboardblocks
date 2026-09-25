import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'stat-group-01',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('stat-group')],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'stat-group-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('stat-group')],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'stat-group-03',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'card',
      'tabs',
      registryUrl('chart-panel'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'stat-group-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('stat-group')],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'stat-group-05',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('stat-group')],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group/stat-group-05.tsx',
        type: 'registry:component',
      },
    ],
  },
]
