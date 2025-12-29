import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const hooks: Registry['items'] = [
  {
    name: 'use-animated-number',
    type: 'registry:hook',
    title: 'Use Animated Number',
    description: 'A hook for animating a number.',
    registryDependencies: [registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/hooks/use-animated-number.tsx',
        type: 'registry:hook',
      },
    ],
  },
  {
    name: 'use-in-view',
    type: 'registry:hook',
    title: 'Use In View',
    description:
      'A hook that tracks whether an element is visible in the viewport using IntersectionObserver.',
    files: [
      {
        path: 'registry/hooks/use-in-view.tsx',
        type: 'registry:hook',
      },
    ],
  },
]
