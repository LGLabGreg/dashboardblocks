import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'notifications-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('link'),
      registryUrl('notifications'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/notifications/notifications-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A bell menu listing the latest notifications, with a mark all as read action and a link to the inbox.',
      size: 'half',
      usedWith: ['notifications-03', 'app-shell-01'],
    },
  },
  {
    name: 'notifications-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'tabs',
      registryUrl('block-state'),
      registryUrl('nav-tag'),
      registryUrl('notifications'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/notifications/notifications-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Notifications that ask for a decision, such as a request to join or a refund, with a tab for the ones still waiting.',
      size: 'half',
      usedWith: ['notifications-03', 'activity-feed-01'],
    },
  },
  {
    name: 'notifications-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'tabs',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('nav-tag'),
      registryUrl('notifications'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/notifications/notifications-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Every notification grouped by day, filtered by unread and mentions, each markable as read or unread or archived.',
      size: 'full',
      usedWith: ['notifications-01', 'notifications-02'],
    },
  },
]
