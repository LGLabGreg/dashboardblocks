import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'forms-01',
    type: 'registry:component',
    registryDependencies: [
      'field',
      'input',
      registryUrl('option-select'),
      'switch',
      'textarea',
      registryUrl('block-state'),
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
      'button',
      'field',
      'input',
      registryUrl('option-select'),
      'textarea',
      registryUrl('block-state'),
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
      'field',
      'input',
      registryUrl('option-select'),
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
    registryDependencies: [registryUrl('block-state'), registryUrl('forms')],
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
  {
    name: 'forms-05',
    type: 'registry:component',
    registryDependencies: [
      'field',
      registryUrl('block-state'),
      registryUrl('forms'),
      registryUrl('geo'),
      registryUrl('multi-select'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms/forms-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Several values picked from a searchable list and shown as removable chips, with a limit checked on save.',
      size: 'half',
      usedWith: ['forms-01', 'settings-01'],
    },
  },
]
