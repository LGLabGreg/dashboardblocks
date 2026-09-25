import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const components: Registry['items'] = [
  {
    name: 'activity-feed',
    type: 'registry:component',
    title: 'Activity Feed',
    description: 'Primitives for composing activity and timeline feeds.',
    dependencies: ['class-variance-authority'],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'animated-number',
    type: 'registry:component',
    title: 'Animated Number',
    description: 'An animated number component.',
    registryDependencies: [registryUrl('use-animated-number')],
    files: [
      {
        path: 'registry/components/dashboardblocks/animated-number.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'animated-wave',
    type: 'registry:component',
    title: 'Animated Wave',
    description: 'An animated wave component.',
    files: [
      {
        path: 'registry/components/dashboardblocks/animated-wave.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart',
    type: 'registry:component',
    title: 'Chart',
    description: 'Chart components.',
    dependencies: ['recharts'],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'breakdown',
    type: 'registry:component',
    title: 'Breakdown',
    description:
      'Primitives for part-to-whole breakdowns: a segmented 100% bar, legend keys and share formatting.',
    registryDependencies: [registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart-panel',
    type: 'registry:component',
    title: 'Chart Panel',
    description:
      'Primitives for full-size chart panels: tooltip, legend, axis defaults and an accessible data table.',
    dependencies: ['recharts'],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dashboard-header',
    type: 'registry:component',
    title: 'Dashboard Header',
    description:
      'Primitives for dashboard headers: a date range preset menu, a compare switch, filter chips and an export menu.',
    dependencies: ['lucide-react'],
    registryDependencies: ['button', 'dropdown-menu', 'switch'],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'funnel',
    type: 'registry:component',
    title: 'Funnel',
    description:
      'Primitives for conversion funnels: step conversion maths and horizontal or vertical stage bars.',
    registryDependencies: [registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'icon',
    type: 'registry:component',
    title: 'Icon',
    description: 'An icon component.',
    dependencies: ['class-variance-authority', 'lucide-react'],
    files: [
      {
        path: 'registry/components/dashboardblocks/icon.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'kpi',
    type: 'registry:component',
    title: 'KPI',
    description:
      'A flexible KPI card with trend indicators, sparklines, and progress tracking.',
    registryDependencies: ['card'],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'leaderboard',
    type: 'registry:component',
    title: 'Leaderboard',
    description: 'Primitives for composing ranked lists and leaderboards.',
    dependencies: ['class-variance-authority', 'lucide-react'],
    registryDependencies: [registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'progress-bar',
    type: 'registry:component',
    title: 'Progress Bar',
    description: 'A progress bar component.',
    registryDependencies: [registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/progress-bar.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ring',
    type: 'registry:component',
    title: 'Ring',
    description: 'A ring component.',
    registryDependencies: [registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ring.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'stat-group',
    type: 'registry:component',
    title: 'Stat Group',
    description:
      'Primitives for a row of related stats: a divided grid, labels, values, change vs the previous period and sparklines.',
    registryDependencies: [registryUrl('trend'), registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'status',
    type: 'registry:component',
    title: 'Status',
    description:
      'Primitives for service status: status levels with icons and labels, badges, indicators and a 90-day uptime bar.',
    dependencies: ['lucide-react'],
    files: [
      {
        path: 'registry/components/dashboardblocks/status.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'trend',
    type: 'registry:component',
    title: 'Trend',
    description: 'A trend indicator component.',
    dependencies: ['class-variance-authority', 'lucide-react'],
    registryDependencies: [registryUrl('animated-number')],
    files: [
      {
        path: 'registry/components/dashboardblocks/trend.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter',
    type: 'registry:component',
    title: 'Usage Meter',
    description: 'A usage meter component.',
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter.tsx',
        type: 'registry:component',
      },
    ],
  },
]
