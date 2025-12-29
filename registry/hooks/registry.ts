import { type Registry } from 'shadcn/schema'

export const hooks: Registry['items'] = [
  {
    name: 'use-animated-number',
    type: 'registry:hook',
    title: 'Use Animated Number',
    description: 'A hook for animating a number.',
    files: [
      {
        path: 'registry/hooks/use-animated-number.tsx',
        type: 'registry:hook',
      },
    ],
  },
]
