import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'dashboard-01',
    type: 'registry:block',
    title: 'Store dashboard',
    description:
      'A store dashboard: header filters scope stats, revenue, channels, products and a checkout funnel.',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'dropdown-menu',
      registryUrl('block-state'),
      registryUrl('breakdown-01'),
      registryUrl('chart-panel-01'),
      registryUrl('dashboard-header'),
      registryUrl('data-table-02'),
      registryUrl('funnel-01'),
      registryUrl('stat-group-02'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboards/dashboard-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dashboard-02',
    type: 'registry:block',
    title: 'SaaS dashboard',
    description:
      'A SaaS dashboard: metric tabs, an activity heatmap, accounts by region and service status, filtered by plan.',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'button-group',
      'dropdown-menu',
      registryUrl('block-state'),
      registryUrl('breakdown-01'),
      registryUrl('dashboard-header'),
      registryUrl('data-table-04'),
      registryUrl('heatmap-01'),
      registryUrl('stat-group-03'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboards/dashboard-02.tsx',
        type: 'registry:component',
      },
    ],
  },
]
