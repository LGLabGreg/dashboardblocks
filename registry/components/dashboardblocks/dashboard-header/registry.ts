import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'dashboard-header-01',
    type: 'registry:component',
    registryDependencies: [registryUrl('dashboard-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header/dashboard-header-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A dashboard header with a title, date range presets, a compare switch, removable filter chips, an add filter menu and export.',
      size: 'full',
      usedWith: ['stat-group-02', 'chart-panel-01'],
    },
  },
  {
    name: 'dashboard-header-02',
    type: 'registry:component',
    registryDependencies: [registryUrl('dashboard-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header/dashboard-header-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A short dashboard header with a title, a date range menu and an export button.',
      size: 'full',
      usedWith: ['stat-group-01', 'chart-panel-01'],
    },
  },
  {
    name: 'dashboard-header-03',
    type: 'registry:component',
    registryDependencies: ['button', 'button-group', registryUrl('dashboard-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header/dashboard-header-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A dashboard header with date range presets as a segmented control, a compare switch and a filter chip.',
      size: 'full',
      usedWith: ['stat-group-02', 'chart-panel-02'],
    },
  },
  {
    name: 'dashboard-header-04',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('dashboard-header')],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header/dashboard-header-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A dashboard header with a description, the time of the last update and a refresh button beside the date range and export.',
      size: 'full',
      usedWith: ['realtime-01', 'stat-group-02'],
    },
  },
]
