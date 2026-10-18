import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'billing-01',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('billing'),
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('format'),
      registryUrl('kpi'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing/billing-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Starting to ending monthly recurring revenue as a waterfall chart, with ending MRR against the start of the month, net new revenue and net revenue retention.',
      size: 'full',
      usedWith: ['billing-04', 'chart-panel-01', 'retention-03'],
    },
  },
  {
    name: 'billing-02',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('billing'),
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('format'),
      registryUrl('kpi'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing/billing-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'The current plan and its price, when it renews, the next invoice and the payment method on file, with actions to manage them.',
      size: 'half',
      usedWith: ['billing-03', 'billing-05', 'usage-meter-01'],
    },
  },
  {
    name: 'billing-03',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('billing'),
      registryUrl('block-state'),
      registryUrl('data-table'),
      registryUrl('details'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing/billing-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Recent invoices with their status and amount, what is outstanding and a PDF download for each one.',
      size: 'half',
      usedWith: ['billing-02', 'billing-05'],
    },
  },
  {
    name: 'billing-04',
    type: 'registry:component',
    registryDependencies: [
      registryUrl('billing'),
      registryUrl('block-state'),
      registryUrl('format'),
      registryUrl('stat-group'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing/billing-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Monthly and annual recurring revenue, revenue per account and net revenue retention, each with its change from the previous month.',
      size: 'full',
      usedWith: ['billing-01', 'chart-panel-01', 'retention-03'],
    },
  },
  {
    name: 'billing-05',
    type: 'registry:component',
    registryDependencies: [
      'button',
      'input',
      registryUrl('billing'),
      registryUrl('block-state'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing/billing-05.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'Plans side by side, monthly or yearly, with seats, what is due today and what a downgrade takes away.',
      size: 'full',
      usedWith: ['billing-02', 'billing-03', 'usage-meter-01'],
    },
  },
]
