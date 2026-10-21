import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'settings-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'input',
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('settings'),
      registryUrl('status-label'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "Invite people by email with a role, change roles, remove members and resend or revoke pending invites, counted against the plan's seats.",
      size: 'full',
      usedWith: ['team-05', 'billing-01', 'team-01'],
    },
  },
  {
    name: 'settings-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'input',
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('settings'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'API keys with their access, last use and creator, with unused keys flagged and a new key shown once with a copy button.',
      size: 'full',
      usedWith: ['settings-05', 'security-02'],
    },
  },
  {
    name: 'settings-03',
    type: 'registry:component',
    registryDependencies: ['switch', registryUrl('block-state'), registryUrl('table')],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Each notification against each channel, grouped by topic, with a switch for each one and a switch for the whole channel.',
      size: 'full',
      usedWith: ['notifications-01', 'settings-07'],
    },
  },
  {
    name: 'settings-04',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'tabs',
      registryUrl('block-state'),
      registryUrl('settings'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Connected and available integrations in tabs, one row each with what it does, its status and a prompt for ones that need reconnecting.',
      size: 'half',
      usedWith: ['settings-05', 'settings-02'],
    },
  },
  {
    name: 'settings-05',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      'button',
      'switch',
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('details'),
      registryUrl('format'),
      registryUrl('settings'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Webhook endpoints with the events they receive, a chart of recent deliveries with each one in a tooltip, the delivery rate, and a switch to pause each one.',
      size: 'full',
      usedWith: ['settings-02', 'settings-04', 'status-01'],
    },
  },
  {
    name: 'settings-06',
    type: 'registry:component',
    registryDependencies: ['button', 'input', registryUrl('settings')],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-06.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Transferring, archiving and deleting a workspace, with deletion confirmed by typing the workspace name.',
      size: 'half',
      usedWith: ['settings-01', 'security-06'],
    },
  },
  {
    name: 'settings-07',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'field',
      'input',
      registryUrl('option-select'),
      registryUrl('block-state'),
      registryUrl('forms'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings/settings-07.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A profile form with your photo, name, email, time zone and theme, a save bar that shows once something changes, and a new email confirmed before it takes effect.',
      size: 'half',
      usedWith: ['security-05', 'settings-03'],
    },
  },
]
