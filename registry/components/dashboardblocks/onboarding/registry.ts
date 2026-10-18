import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'onboarding-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'field',
      'input',
      'input-group',
      registryUrl('checklist'),
      registryUrl('forms'),
      registryUrl('link'),
      registryUrl('onboarding'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/onboarding/onboarding-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A setup wizard that names the workspace, sets its URL, asks what it is for and invites the team, checking each step before moving on.',
      size: 'page',
      usedWith: ['onboarding-02'],
    },
  },
  {
    name: 'onboarding-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('checklist'),
      registryUrl('link'),
      registryUrl('onboarding'),
      registryUrl('progress-bar'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/onboarding/onboarding-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The first page of an empty workspace with quick starts, an empty dashboards list, setup progress and help links.',
      size: 'page',
      usedWith: ['onboarding-01'],
    },
  },
  {
    name: 'onboarding-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'field',
      'input-group',
      'native-select',
      registryUrl('block-state'),
      registryUrl('link'),
      registryUrl('onboarding'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/onboarding/onboarding-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A searchable, filterable list of data sources to pick from, then follow through connecting to connected, with an error state.',
      size: 'full',
      usedWith: ['onboarding-04', 'checklist-01'],
    },
  },
  {
    name: 'onboarding-04',
    type: 'registry:component',
    registryDependencies: ['button', 'field', 'native-select', registryUrl('onboarding')],
    files: [
      {
        path: 'registry/components/dashboardblocks/onboarding/onboarding-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A short form asking for a role, a team size and up to three goals, then listing the dashboards set up for them.',
      size: 'half',
      usedWith: ['onboarding-03', 'checklist-01'],
    },
  },
]
