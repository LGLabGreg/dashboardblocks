import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'checklist-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('checklist'),
      registryUrl('details'),
      registryUrl('progress-bar'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist/checklist-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Setup steps with a progress bar, where each step expands to show what it involves and the current step has its action.',
      size: 'half',
      usedWith: ['checklist-03', 'onboarding-01'],
    },
  },
  {
    name: 'checklist-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('checklist'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist/checklist-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The stages of a multi-stage setup as a row of rules, side by side when wide and stacked when narrow.',
      size: 'full',
      usedWith: ['checklist-01', 'onboarding-02'],
    },
  },
  {
    name: 'checklist-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('checklist'),
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('progress-bar'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist/checklist-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A small block with how many setup steps are done and the next one, to bring people back to finish.',
      size: 'compact',
      usedWith: ['checklist-01', 'kpi-01'],
    },
  },
  {
    name: 'checklist-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('checklist'),
      registryUrl('details'),
      registryUrl('progress-bar'),
      registryUrl('schedule'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist/checklist-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Tasks grouped by team with owners, due dates and checkboxes, with overdue and due-soon tasks written in colour.',
      size: 'half',
      usedWith: ['schedule-03', 'kanban-01', 'team-02'],
    },
  },
]
