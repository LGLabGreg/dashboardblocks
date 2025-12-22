import { type Registry } from 'shadcn/schema'

export const examples: Registry['items'] = [
  {
    name: 'minimal-kpi',
    type: 'registry:example',
    registryDependencies: ['https://dashboardblocks.com/r/kpi.json'],
    files: [
      {
        path: 'registry/dashboardblocks/examples/minimal-kpi.tsx',
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
        path: 'registry/dashboardblocks/examples/descriptive-kpi.tsx',
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
        path: 'registry/dashboardblocks/examples/compact-kpi.tsx',
        type: 'registry:example',
      },
    ],
  },
]
