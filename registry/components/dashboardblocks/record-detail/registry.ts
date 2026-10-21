import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'record-detail-01',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('page-header'),
      registryUrl('record-detail'),
      registryUrl('status-label'),
      registryUrl('table'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/record-detail/record-detail-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A customer page with headline numbers, recent orders, contact details and notes.',
      size: 'full',
      usedWith: ['page-header-03', 'data-table-02', 'comments-01'],
    },
  },
  {
    name: 'record-detail-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('format'),
      registryUrl('page-header'),
      registryUrl('record-detail'),
      registryUrl('status-label'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/record-detail/record-detail-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An order page with line items and totals, a timeline of what happened, the customer, and shipping and payment.',
      size: 'full',
      usedWith: ['page-header-03', 'invoice-01', 'timeline-01'],
    },
  },
  {
    name: 'record-detail-03',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      'textarea',
      registryUrl('activity-feed'),
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('page-header'),
      registryUrl('record-detail'),
      registryUrl('status-label'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/record-detail/record-detail-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A ticket page with a description, activity and comments, a comment box, and properties such as priority, assignee and labels.',
      size: 'full',
      usedWith: ['page-header-03', 'comments-01', 'activity-feed-02'],
    },
  },
]
