import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const examples: Registry['items'] = [
  {
    name: 'invoice-01',
    type: 'registry:component',
    registryDependencies: [
      'button',
      registryUrl('billing'),
      registryUrl('invoice'),
      registryUrl('record-detail'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/invoice/invoice-01.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'An overdue invoice with discount, sales tax, deposit and balance due, payment instructions and a reminder to send.',
      size: 'full',
      usedWith: ['billing-01', 'invoice-02'],
    },
  },
  {
    name: 'invoice-02',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      registryUrl('billing'),
      registryUrl('invoice'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/invoice/invoice-02.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A paid receipt with the payment method, a partial refund and the net amount paid.',
      size: 'full',
      usedWith: ['invoice-01', 'billing-02'],
    },
  },
  {
    name: 'invoice-03',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      registryUrl('billing'),
      registryUrl('invoice'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/invoice/invoice-03.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A quote with optional items to tick before accepting, totals that follow and an expiry date.',
      size: 'full',
      usedWith: ['invoice-01', 'billing-01'],
    },
  },
  {
    name: 'invoice-04',
    type: 'registry:component',
    registryDependencies: [
      'badge',
      'button',
      registryUrl('billing'),
      registryUrl('invoice'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/invoice/invoice-04.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      shows:
        'A packing slip listing items with SKU and bin, a pick checkbox for each and a barcode of the order number, with no prices.',
      size: 'full',
      usedWith: ['invoice-02', 'inventory-01'],
    },
  },
]
