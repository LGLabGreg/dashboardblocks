import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'activity-feed-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows: 'What people did across a workspace, newest first and grouped by day.',
      size: 'half',
      usedWith: ['activity-feed-03', 'team-01'],
    },
  },
  {
    name: 'activity-feed-02',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The history of one record as a timeline, with each change shown from the old value to the new one and comments quoted in full.',
      size: 'half',
      usedWith: ['activity-feed-01', 'comments-01'],
    },
  },
  {
    name: 'activity-feed-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'tabs',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Notifications in All, Mentions and Unread tabs, with each marked read when opened or all at once.',
      size: 'half',
      usedWith: ['activity-feed-01', 'alerts-01'],
    },
  },
  {
    name: 'activity-feed-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('kpi'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A week of activity as daily bars with the busiest day labelled, by kind, with the most active people.',
      size: 'half',
      usedWith: ['activity-feed-01', 'stat-group-02', 'leaderboard-01'],
    },
  },
  {
    name: 'activity-feed-05',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('icon'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed/activity-feed-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Slack and GitHub activity in one timeline, with quoted messages and actions such as starting a review.',
      size: 'half',
      usedWith: ['activity-feed-01', 'deployments-01'],
    },
  },
]
