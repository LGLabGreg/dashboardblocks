import { type Registry } from 'shadcn/schema'

export const components: Registry['items'] = [
  {
    name: 'kpi',
    type: 'registry:component',
    title: 'KPI',
    description:
      'A flexible KPI card with trend indicators, sparklines, and progress tracking.',
    registryDependencies: ['card', 'https://dashboardblocks.com/r/progress.json'],
    dependencies: ['lucide-react', 'recharts'],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'progress',
    type: 'registry:component',
    title: 'Progress',
    description: 'A progress bar component.',
    registryDependencies: ['progress'],
    files: [
      {
        path: 'registry/components/dashboardblocks/progress.tsx',
        type: 'registry:component',
      },
    ],
  },
]
