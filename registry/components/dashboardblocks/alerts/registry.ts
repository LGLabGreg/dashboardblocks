import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'alerts-01',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('alerts')],
    files: [
      {
        path: 'registry/components/dashboardblocks/alerts/alerts-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Open alerts, most recent first, each with a button to acknowledge it.',
      size: 'half',
      usedWith: ['alerts-04', 'status-01', 'activity-feed-01'],
    },
  },
  {
    name: 'alerts-02',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      'card',
      registryUrl('alerts'),
      registryUrl('chart-panel'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/alerts/alerts-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A metric over the last hour against its threshold line, with the current value, the peak and actions to take.',
      size: 'half',
      usedWith: ['alerts-01', 'chart-panel-01', 'status-02'],
    },
  },
  {
    name: 'alerts-03',
    type: 'registry:component',
    registryDependencies: [
      'card',
      'switch',
      registryUrl('alerts'),
      registryUrl('data-table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/alerts/alerts-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A table of alert rules with their conditions, severities and channels, and a switch to pause or resume each one.',
      size: 'full',
      usedWith: ['alerts-01', 'alerts-04'],
    },
  },
  {
    name: 'alerts-04',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('alerts')],
    files: [
      {
        path: 'registry/components/dashboardblocks/alerts/alerts-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A slim strip with open alerts by severity and the latest one, for the top of a dashboard.',
      size: 'full',
      usedWith: ['alerts-01', 'stat-group-02', 'status-01'],
    },
  },
]
