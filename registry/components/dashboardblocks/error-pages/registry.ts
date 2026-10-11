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
    meta: {
      shows:
        'A not found page that shows the missing path, a search and the places people usually look.',
      size: 'page',
      usedWith: ['error-pages-02'],
    },
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
    meta: {
      shows:
        'A no access page naming who can grant access, with a request form and the account you are signed in with.',
      size: 'page',
      usedWith: ['error-pages-01'],
    },
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
    meta: {
      shows:
        'A failure page with a retry button and count, a copyable error ID for support and the technical details folded away.',
      size: 'page',
      usedWith: ['error-pages-04'],
    },
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
    meta: {
      shows:
        'A maintenance page with what is being done, when it ends, progress through the window, the latest updates and an email sign-up.',
      size: 'page',
      usedWith: ['error-pages-03'],
    },
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
    meta: {
      shows:
        'A signed-out page saying why the session ended and whether unsaved work was kept, with a sign-in link back to the same page.',
      size: 'page',
      usedWith: ['auth-03'],
    },
  },
]
