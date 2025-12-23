import { type Registry } from 'shadcn/schema'

export const examples: Registry['items'] = [
  {
    name: 'minimal-kpi',
    type: 'registry:example',
    registryDependencies: ['https://dashboardblocks.com/r/kpi.json'],
    files: [
      {
        path: 'registry/examples/minimal-kpi.tsx',
        type: 'registry:example',
      },
    ],
  },
  {
    name: 'descriptive-kpi',
    type: 'registry:example',
    registryDependencies: ['https://dashboardblocks.com/r/kpi.json'],
    files: [
      {
        path: 'registry/examples/descriptive-kpi.tsx',
        type: 'registry:example',
      },
    ],
  },
  {
    name: 'compact-kpi',
    type: 'registry:example',
    registryDependencies: ['https://dashboardblocks.com/r/kpi.json'],
    files: [
      {
        path: 'registry/examples/compact-kpi.tsx',
        type: 'registry:example',
      },
    ],
  },
  {
    name: 'progress-kpi',
    type: 'registry:example',
    registryDependencies: ['https://dashboardblocks.com/r/kpi.json'],
    files: [
      {
        path: 'registry/examples/progress-kpi.tsx',
        type: 'registry:example',
      },
    ],
  },
]
