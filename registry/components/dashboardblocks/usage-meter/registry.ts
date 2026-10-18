import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'usage-meter-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('status-label'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An API quota with its status, when it resets and the usage it is on pace for, with the date it would hit the limit.',
      size: 'compact',
      usedWith: ['usage-meter-06', 'billing-01', 'ai-usage-01'],
    },
  },
  {
    name: 'usage-meter-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('animated-number'),
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('format'),
      registryUrl('ring'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Storage used as a ring in its status colour, with the space that is free.',
      size: 'compact',
      usedWith: ['usage-meter-05', 'files-01', 'usage-meter-06'],
    },
  },
  {
    name: 'usage-meter-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Usage against what the plan includes, with the overage past the limit and what it will cost.',
      size: 'half',
      usedWith: ['billing-01', 'usage-meter-06', 'spend-01'],
    },
  },
  {
    name: 'usage-meter-04',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      registryUrl('animated-number'),
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('kpi'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A credit balance with the days left, the date it runs out and recent daily use against the average.',
      size: 'compact',
      usedWith: ['billing-02', 'usage-meter-01', 'ai-usage-02'],
    },
  },
  {
    name: 'usage-meter-05',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('progress-bar'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "Storage split into categories as one segmented bar, with each category's size and share, and the space that is free.",
      size: 'compact',
      usedWith: ['usage-meter-02', 'files-01', 'breakdown-01'],
    },
  },
  {
    name: 'usage-meter-06',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-06.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Every limit on a plan, flagging the ones nearly reached and prompting an upgrade.',
      size: 'compact',
      usedWith: ['billing-01', 'usage-meter-01', 'usage-meter-03'],
    },
  },
  {
    name: 'usage-meter-07',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('animated-number'),
      registryUrl('animated-wave'),
      registryUrl('block-state'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-07.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'What is left as a liquid that drains as usage grows, turning amber and then red.',
      size: 'compact',
      usedWith: ['usage-meter-02', 'billing-01', 'usage-meter-06'],
    },
  },
  {
    name: 'usage-meter-08',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('animated-number'),
      registryUrl('animated-wave'),
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('usage-meter'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter/usage-meter-08.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'What is left as a round wave that drains as usage grows, with used, free and days until reset below.',
      size: 'compact',
      usedWith: ['usage-meter-07', 'billing-01', 'usage-meter-06'],
    },
  },
]
