import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'schedule-01',
    type: 'registry:component',
    registryDependencies: [registryUrl('block-state'), registryUrl('schedule')],
    files: [
      {
        path: 'registry/components/dashboardblocks/schedule/schedule-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Upcoming events grouped by day, as Today, Tomorrow and then weekdays, with the event in progress marked.',
      size: 'half',
      usedWith: ['schedule-02', 'calendar-01', 'team-04'],
    },
  },
  {
    name: 'schedule-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('schedule'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/schedule/schedule-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A month calendar with a dot on each day that has events, and a list of the events on the selected day.',
      size: 'full',
      usedWith: ['schedule-01', 'schedule-03'],
    },
  },
  {
    name: 'schedule-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('schedule'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/schedule/schedule-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Deadlines and renewals in date order, each with a countdown and an urgency badge.',
      size: 'half',
      usedWith: ['schedule-01', 'billing-01', 'checklist-04'],
    },
  },
  {
    name: 'schedule-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('schedule'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/schedule/schedule-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The next seven days on a shared time axis, with how many events each day holds and how much of it is booked.',
      size: 'full',
      usedWith: ['schedule-01', 'team-02'],
    },
  },
]
