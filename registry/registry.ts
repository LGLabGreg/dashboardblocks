import { type Registry } from 'shadcn/schema'

export const components: Registry['items'] = [
  {
    name: 'kpi',
    type: 'registry:component',
    title: 'KPI',
    description:
      'A flexible KPI card with trend indicators, sparklines, and progress tracking.',
    registryDependencies: ['card'],
    dependencies: ['lucide-react'],
    files: [
      {
        path: 'registry/kpi.tsx',
        type: 'registry:component',
      },
    ],
  },
]
