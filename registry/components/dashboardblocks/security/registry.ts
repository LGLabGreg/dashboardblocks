import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'security-01',
    type: 'registry:component',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('format'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Failed and blocked sign-ins per day against a typical day, with the failure rate, the spike in blocked attempts called out, and two-factor coverage.',
      size: 'full',
      usedWith: ['security-02', 'security-04', 'alerts-01'],
    },
  },
  {
    name: 'security-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('security'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Changes to access, keys and settings, newest first, with a switch to show warnings only.',
      size: 'full',
      usedWith: ['security-01', 'security-03', 'activity-feed-01'],
    },
  },
  {
    name: 'security-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('security'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The devices signed in to an account, with where and when each was last active, and buttons to sign them out.',
      size: 'half',
      usedWith: ['security-05', 'security-02'],
    },
  },
  {
    name: 'security-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('gauge'),
      registryUrl('security'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A security score on a banded gauge, built from workspace checks, with failing checks first and what to do about each.',
      size: 'half',
      usedWith: ['security-05', 'security-06', 'security-01'],
    },
  },
  {
    name: 'security-05',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'input',
      registryUrl('block-state'),
      registryUrl('settings'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Setting up two-factor sign-in with an authenticator app, security keys and passkeys, and recovery codes shown once.',
      size: 'half',
      usedWith: ['security-03', 'security-04'],
    },
  },
  {
    name: 'security-06',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'input',
      registryUrl('option-select'),
      'switch',
      'textarea',
      registryUrl('block-state'),
      registryUrl('settings'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/security/security-06.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A single sign-on connection with details to copy into your identity provider, verified domains, and a switch to require it.',
      size: 'half',
      usedWith: ['security-04', 'team-05', 'settings-01'],
    },
  },
]
