import { type Registry } from 'shadcn/schema'

export const examples: Registry['items'] = [
  {
    name: 'usage-meter-01',
    type: 'registry:component',
    registryDependencies: [
      'card',
      'https://dashboardblocks.com/r/icon.json',
      'https://dashboardblocks.com/r/usage-meter.json',
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-01.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-02',
    type: 'registry:component',
    registryDependencies: [
      'card',
      'https://dashboardblocks.com/r/ring.json',
      'https://dashboardblocks.com/r/usage-meter.json',
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-02.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-03',
    type: 'registry:component',
    registryDependencies: ['card', 'https://dashboardblocks.com/r/usage-meter.json'],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-03.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-04',
    type: 'registry:component',
    registryDependencies: [
      'card',
      'https://dashboardblocks.com/r/icon.json',
      'https://dashboardblocks.com/r/trend.json',
      'https://dashboardblocks.com/r/usage-meter.json',
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-04.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-05',
    type: 'registry:component',
    registryDependencies: ['card', 'https://dashboardblocks.com/r/usage-meter.json'],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-05.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-06',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'https://dashboardblocks.com/r/icon.json',
      'https://dashboardblocks.com/r/usage-meter.json',
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-06.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-07',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      'https://dashboardblocks.com/r/animated-wave.json',
      'https://dashboardblocks.com/r/icon.json',
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-07.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter-08',
    type: 'registry:component',
    dependencies: ['lucide-react'],
    registryDependencies: [
      'button',
      'card',
      'https://dashboardblocks.com/r/animated-wave.json',
      'https://dashboardblocks.com/r/icon.json',
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-08.tsx',
        type: 'registry:component',
      },
    ],
  },
]
