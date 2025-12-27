import { type Registry } from 'shadcn/schema'

export const components: Registry['items'] = [
  {
    name: 'kpi',
    type: 'registry:component',
    title: 'KPI',
    description:
      'A flexible KPI card with trend indicators, sparklines, and progress tracking.',
    registryDependencies: [
      'card',
      'https://dashboardblocks.com/r/chart.json',
      'https://dashboardblocks.com/r/progress.json',
      'https://dashboardblocks.com/r/ring.json',
      'https://dashboardblocks.com/r/trend.json',
    ],
    dependencies: ['lucide-react', 'recharts'],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart',
    type: 'registry:component',
    title: 'Chart',
    description: 'Chart components.',
    files: [
      {
        path: 'registry/components/dashboardblocks/chart.tsx',
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
  {
    name: 'ring',
    type: 'registry:component',
    title: 'Ring',
    description: 'A ring component.',
    files: [
      {
        path: 'registry/components/dashboardblocks/ring.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'trend',
    type: 'registry:component',
    title: 'Trend',
    description: 'A trend indicator component.',
    files: [
      {
        path: 'registry/components/dashboardblocks/trend.tsx',
        type: 'registry:component',
      },
    ],
  },
]
