import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'forms-01',
    type: 'registry:component',
    registryDependencies: [
      'card',
      'field',
      'input',
      'native-select',
      'separator',
      'switch',
      'textarea',
      registryUrl('forms'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms/forms-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A form with fields grouped into titled sections and a save bar that appears while there are unsaved changes.',
      size: 'half',
      usedWith: ['page-header-01', 'forms-04'],
    },
  },
  {
    name: 'forms-02',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      'card',
      'field',
      'input',
      'native-select',
      'textarea',
      registryUrl('forms'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms/forms-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A create form in a panel that slides in from the side, with errors from the server shown on the field.',
      size: 'half',
      usedWith: ['data-table-02', 'page-header-04'],
    },
  },
  {
    name: 'forms-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'field',
      'input',
      'native-select',
      'switch',
      'textarea',
      registryUrl('forms'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms/forms-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A form in steps that checks each step before moving on and reviews everything on the last one.',
      size: 'half',
      usedWith: ['onboarding-01', 'checklist-02'],
    },
  },
  {
    name: 'forms-04',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('forms')],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms/forms-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Single values edited in place, saved with Enter and cancelled with Escape.',
      size: 'half',
      usedWith: ['record-detail-01', 'forms-01'],
    },
  },
]
