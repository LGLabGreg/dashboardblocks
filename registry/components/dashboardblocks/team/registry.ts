import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'team-01',
    type: 'registry:component',
    registryDependencies: ['button', 'card', registryUrl('team')],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A list of members with their role, whether they are online and when they were last active.',
      size: 'half',
      usedWith: ['team-05', 'team-06', 'settings-01'],
    },
  },
  {
    name: 'team-02',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('team')],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Work assigned to each person against their capacity on a shared scale, with anyone over capacity flagged and listed first.',
      size: 'half',
      usedWith: ['team-03', 'kanban-01', 'leaderboard-02'],
    },
  },
  {
    name: 'team-03',
    type: 'registry:component',
    registryDependencies: ['card', registryUrl('team')],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'How many people are online, shown as avatars, with the team split by presence.',
      size: 'half',
      usedWith: ['team-01', 'team-04'],
    },
  },
  {
    name: 'team-04',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      registryUrl('progress-bar'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'Who is on call now and until when, who is next, and the rest of the rota.',
      size: 'half',
      usedWith: ['schedule-01', 'alerts-01', 'team-03'],
    },
  },
  {
    name: 'team-05',
    type: 'registry:component',
    registryDependencies: ['button', 'card', 'checkbox'],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A grid of what each role can do, with permissions in rows and roles in columns, and unsaved changes highlighted.',
      size: 'full',
      usedWith: ['team-01', 'settings-01', 'security-02'],
    },
  },
  {
    name: 'team-06',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'card',
      'input',
      'native-select',
      registryUrl('settings'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/team/team-06.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A share panel for inviting people with view or edit access, changing or removing it, and choosing who the link works for.',
      size: 'half',
      usedWith: ['team-01', 'settings-01'],
    },
  },
]
