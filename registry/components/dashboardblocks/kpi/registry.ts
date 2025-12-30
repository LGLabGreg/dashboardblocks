import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'kpi-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('kpi'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'kpi-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('kpi'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'kpi-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('kpi'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/kpi-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'progress-kpi-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('kpi'),
      registryUrl('progress-bar'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/progress-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'progress-kpi-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('icon'),
      registryUrl('kpi'),
      registryUrl('progress-bar'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/progress-kpi-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'progress-kpi-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('kpi'),
      registryUrl('ring'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/progress-kpi-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'bar-chart-kpi-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('chart'),
      registryUrl('kpi'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/bar-chart-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'bar-chart-kpi-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('chart'),
      registryUrl('kpi'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/bar-chart-kpi-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'line-chart-kpi-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('chart'),
      registryUrl('kpi'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/line-chart-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'area-chart-kpi-01',
    type: 'registry:component',
    registryDependencies: [
      'card',
      registryUrl('animated-number'),
      registryUrl('chart'),
      registryUrl('kpi'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/area-chart-kpi-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'area-chart-kpi-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('chart'),
      registryUrl('kpi'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi/area-chart-kpi-02.tsx',
        type: 'registry:component',
      },
    ],
  },
]
