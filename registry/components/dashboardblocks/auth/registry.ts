import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'auth-01',
    type: 'registry:component',
    registryDependencies: ['button', registryUrl('team'), registryUrl('auth')],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An invite page showing the workspace, who invited you, your role and the people already there, with a prompt to switch account when the address differs.',
      size: 'page',
      usedWith: ['auth-02'],
    },
  },
  {
    name: 'auth-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'input',
      registryUrl('auth'),
      registryUrl('block-state'),
      registryUrl('details'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A list of the workspaces you belong to with your role in each, pending invites to join and a search once there are many.',
      size: 'page',
      usedWith: ['auth-01'],
    },
  },
  {
    name: 'auth-03',
    type: 'registry:component',
    registryDependencies: ['button', 'input', 'switch', registryUrl('auth')],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A six-digit authenticator code form with a recovery code option, the tries left and a choice to trust the device.',
      size: 'page',
      usedWith: ['auth-04'],
    },
  },
  {
    name: 'auth-04',
    type: 'registry:component',
    registryDependencies: ['button', 'input', registryUrl('auth')],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An email verification code form with a resend that waits between emails and a way to fix a mistyped address.',
      size: 'page',
      usedWith: ['auth-03'],
    },
  },
  {
    name: 'auth-05',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'field',
      'input',
      registryUrl('auth'),
      registryUrl('forms'),
      registryUrl('rolling-text'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'One form to sign in or sign up, with Google, X and GitHub on one row, a password you can show, and a switch at the bottom that unfolds the sign-up fields and a password strength meter.',
      size: 'page',
      usedWith: ['auth-06', 'auth-04'],
    },
  },
  {
    name: 'auth-06',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'field',
      'input',
      registryUrl('auth'),
      registryUrl('forms'),
      registryUrl('rolling-text'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-06.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A forgot password form that turns into a check your email page, with buttons to open the mail app and a resend that counts down.',
      size: 'page',
      usedWith: ['auth-05', 'auth-07'],
    },
  },
  {
    name: 'auth-07',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'field',
      registryUrl('auth'),
      registryUrl('forms'),
      registryUrl('rolling-text'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth/auth-07.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A new password form with a strength meter and the rules it still needs, a done state that leads to sign-in, and an expired link state.',
      size: 'page',
      usedWith: ['auth-06', 'auth-05'],
    },
  },
]
