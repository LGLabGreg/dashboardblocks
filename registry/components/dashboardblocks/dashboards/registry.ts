import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'dashboard-01',
    type: 'registry:block',
    title: 'Store dashboard',
    description:
      'A store dashboard: header filters scope stats, revenue, channels, products, a checkout funnel and month-to-date revenue, with low stock alongside.',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('breakdown-01'),
      registryUrl('chart-panel-01'),
      registryUrl('dashboard-header'),
      registryUrl('data-table-02'),
      registryUrl('forecast-03'),
      registryUrl('funnel-01'),
      registryUrl('inventory-01'),
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
      'A SaaS dashboard: metric tabs, an activity heatmap, MRR by region, MRR movement, retention milestones and service status, filtered by plan.',
    registryDependencies: [
      'button',
      'button-group',
      registryUrl('billing-01'),
      registryUrl('block-state'),
      registryUrl('dashboard-header'),
      registryUrl('data-table-04'),
      registryUrl('geo-04'),
      registryUrl('heatmap-01'),
      registryUrl('retention-03'),
      registryUrl('stat-group-03'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboards/dashboard-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dashboard-03',
    type: 'registry:block',
    title: 'Web analytics dashboard',
    description:
      'A web analytics dashboard: traffic tabs, visitors right now, a traffic flow, top pages, top countries and browsers, filtered by device.',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('breakdown-01'),
      registryUrl('chart-panel-02'),
      registryUrl('dashboard-header'),
      registryUrl('flow-01'),
      registryUrl('geo-02'),
      registryUrl('leaderboard-01'),
      registryUrl('realtime-01'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboards/dashboard-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dashboard-04',
    type: 'registry:block',
    title: 'CRM dashboard',
    description:
      'A CRM dashboard: sales stats, open pipeline by stage, monthly bookings, lead conversion, a quarter forecast by rep, deal activity and stuck deals, filtered by segment.',
    registryDependencies: [
      'button',
      'button-group',
      registryUrl('activity-feed-01'),
      registryUrl('block-state'),
      registryUrl('chart-panel-04'),
      registryUrl('dashboard-header'),
      registryUrl('funnel-03'),
      registryUrl('pipeline'),
      registryUrl('pipeline-02'),
      registryUrl('pipeline-03'),
      registryUrl('pipeline-04'),
      registryUrl('stat-group-02'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboards/dashboard-04.tsx',
        type: 'registry:component',
      },
    ],
  },
]
