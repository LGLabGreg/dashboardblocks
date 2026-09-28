import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'error-pages-01',
    type: 'registry:component',
    registryDependencies: ['button', 'input', registryUrl('error-pages')],
    files: [
      {
        path: 'registry/components/dashboardblocks/error-pages/error-pages-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'error-pages-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'textarea',
      registryUrl('team'),
      registryUrl('error-pages'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/error-pages/error-pages-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'error-pages-03',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('settings'), registryUrl('error-pages')],
    files: [
      {
        path: 'registry/components/dashboardblocks/error-pages/error-pages-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'error-pages-04',
    type: 'registry:component',
    registryDependencies: ['button', 'input', registryUrl('error-pages')],
    files: [
      {
        path: 'registry/components/dashboardblocks/error-pages/error-pages-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'error-pages-05',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('error-pages')],
    files: [
      {
        path: 'registry/components/dashboardblocks/error-pages/error-pages-05.tsx',
        type: 'registry:component',
      },
    ],
  },
]
