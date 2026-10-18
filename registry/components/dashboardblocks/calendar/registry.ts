import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'calendar-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('calendar'),
      registryUrl('details'),
      registryUrl('schedule'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/calendar/calendar-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A month grid of team events, launches, travel and holidays, with the selected day listed beside it.',
      size: 'full',
      usedWith: ['calendar-02', 'schedule-01'],
    },
  },
  {
    name: 'calendar-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('calendar'),
      registryUrl('schedule'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/calendar/calendar-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "A week on an hour axis that opens at working hours, with all-day events on top and the selected event's details.",
      size: 'full',
      usedWith: ['calendar-01', 'calendar-04'],
    },
  },
  {
    name: 'calendar-03',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('calendar'),
      registryUrl('schedule'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/calendar/calendar-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A content calendar that switches between month and week, with each calendar toggled from a sidebar.',
      size: 'full',
      usedWith: ['calendar-01', 'kanban-01'],
    },
  },
  {
    name: 'calendar-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('calendar'),
      registryUrl('schedule'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/calendar/calendar-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A day of meeting room bookings with a column per room and whether each is free right now.',
      size: 'full',
      usedWith: ['calendar-02', 'schedule-01'],
    },
  },
]
