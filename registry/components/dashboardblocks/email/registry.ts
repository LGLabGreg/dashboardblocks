import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'email-01',
    type: 'registry:component',
    dependencies: ['react-email'],
    registryDependencies: [registryUrl('email'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/email/email-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A sign-in code email with the code on a dark panel, how long it works and who asked for it.',
      size: 'email',
      usedWith: ['email-02', 'email-03', 'auth-04'],
    },
  },
  {
    name: 'email-02',
    type: 'registry:component',
    dependencies: ['react-email'],
    registryDependencies: [registryUrl('email'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/email/email-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An invite email naming who invited you, the workspace and your role, with an Accept button and when the invite runs out.',
      size: 'email',
      usedWith: ['email-01', 'email-03', 'auth-01'],
    },
  },
  {
    name: 'email-03',
    type: 'registry:component',
    dependencies: ['react-email'],
    registryDependencies: [registryUrl('email'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/email/email-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A receipt email with the amount paid on a dark panel, the lines that add up to it and a link to the invoice.',
      size: 'email',
      usedWith: ['email-01', 'email-02'],
    },
  },
  {
    name: 'email-04',
    type: 'registry:component',
    dependencies: ['react-email'],
    registryDependencies: [registryUrl('email'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/email/email-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        "A failed payment email with the amount due on a dark panel, the card and the bank's reason, Update card, and when it's tried again.",
      size: 'email',
      usedWith: ['email-03', 'email-05', 'billing-02'],
    },
  },
  {
    name: 'email-05',
    type: 'registry:component',
    dependencies: ['react-email'],
    registryDependencies: [registryUrl('email'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/email/email-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A trial ending email counting the days left on a dark panel, with Add a card and what changes on the plan the workspace moves to.',
      size: 'email',
      usedWith: ['email-04', 'email-06', 'billing-02'],
    },
  },
  {
    name: 'email-06',
    type: 'registry:component',
    dependencies: ['react-email'],
    registryDependencies: [registryUrl('email'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/email/email-06.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A usage alert email with how much of a limit is used, a meter on a dark panel, when it resets, and the usage by project.',
      size: 'email',
      usedWith: ['email-04', 'email-05', 'usage-meter-01'],
    },
  },
  {
    name: 'email-07',
    type: 'registry:component',
    dependencies: ['react-email'],
    registryDependencies: [registryUrl('email'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/email/email-07.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A welcome email with the first step and its button on a dark panel, the steps after it, and who answers a reply.',
      size: 'email',
      usedWith: ['email-01', 'email-02', 'onboarding-01'],
    },
  },
]
