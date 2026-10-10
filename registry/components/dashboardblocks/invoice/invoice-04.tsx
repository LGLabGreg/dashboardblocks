'use client'

import { formatBillingDate } from '@/registry/components/dashboardblocks/billing'
import {
  Barcode,
  DocumentBrand,
  DocumentFooter,
  DocumentHeader,
  DocumentLayout,
  DocumentMeta,
  DocumentPage,
  DocumentParties,
  DocumentSection,
  DocumentToolbar,
  type DocumentLine,
  type DocumentParty,
  LineItemsTable,
  PrintButton,
} from '@/registry/components/dashboardblocks/invoice'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Invoice4Props {
  billTo: DocumentParty
  brand: { name: string; website: string }
  footer: string
  giftMessage?: string
  /** Put the bin or shelf in `detail`. */
  lines: DocumentLine[]
  onMarkPacked?: () => Promise<void>
  orderDate: Date
  /** Printed as a Code 39 barcode, so keep to digits, capitals and - . */
  orderNumber: string
  packages: string
  returnsUrl: string
  shipBy: Date
  shipping: string
  shipTo: DocumentParty
}

const exampleProps: Invoice4Props = {
  billTo: {
    label: 'Bill to',
    lines: ['1650 Fillmore Street', 'Denver, CO 80206', 'tomas.reyes@hey.com'],
    name: 'Tomás Reyes',
  },
  brand: { name: 'Tidepool Goods', website: 'tidepoolgoods.com' },
  footer: 'Tidepool Goods · Returns, 2200 NW Front Avenue, Portland, OR 97209',
  giftMessage:
    'Happy housewarming, Ana! Can’t wait to see the new place. Love, Tomás and Jun',
  lines: [
    {
      description: 'Linen duvet cover, queen',
      detail: 'Bin A-14 · Oat',
      id: 'duvet',
      quantity: 1,
      sku: 'LIN-DUV-Q-OAT',
      unitPrice: 189,
    },
    {
      description: 'Linen pillowcases, set of 2',
      detail: 'Bin A-15 · Oat',
      id: 'pillowcases',
      quantity: 2,
      sku: 'LIN-PIL-S2-OAT',
      unitPrice: 58,
    },
    {
      description: 'Stoneware mugs, set of 4',
      detail: 'Bin C-03 · Fragile, wrap each mug',
      id: 'mugs',
      quantity: 1,
      sku: 'STN-MUG-S4-SND',
      unitPrice: 64,
    },
    {
      description: 'Waffle bath towel',
      detail: 'Bin B-22 · Sage',
      id: 'towels',
      quantity: 4,
      sku: 'WAF-BTH-SGE',
      unitPrice: 42,
    },
    {
      description: 'Beeswax taper candles, pair',
      detail: 'Bin D-07',
      id: 'candles',
      quantity: 3,
      sku: 'BWX-TPR-PR',
      unitPrice: 18,
    },
    {
      description: 'Gift wrap and card',
      detail: 'Packing station',
      id: 'gift',
      quantity: 1,
      sku: 'SVC-GIFT',
      unitPrice: 6,
    },
  ],
  orderDate: new Date(Date.UTC(2026, 8, 25)),
  orderNumber: 'SO-10482',
  packages: '2 boxes · 6.4 kg',
  returnsUrl: 'https://tidepoolgoods.com/returns',
  shipBy: new Date(Date.UTC(2026, 8, 28)),
  shipping: 'UPS Ground',
  shipTo: {
    label: 'Ship to',
    lines: ['Unit 5B, 88 Ocean Parkway', 'Brooklyn, NY 11218', '+1 (718) 555-0142'],
    name: 'Ana Castillo',
  },
}

function markPacked() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

const logo = (
  <svg viewBox='0 0 36 36' fill='none' aria-hidden>
    <circle cx='18' cy='18' r='17' stroke='currentColor' strokeWidth='2' />
    <path
      d='M7 20c3-3 5-3 7.5 0s5 3 7.5 0 5-3 7 0'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
)

const Invoice4 = (props: Invoice4Props) => {
  const {
    billTo,
    brand,
    footer,
    giftMessage,
    lines,
    onMarkPacked = markPacked,
    orderDate,
    orderNumber,
    packages,
    returnsUrl,
    shipBy,
    shipping,
    shipTo,
  } = props
  const [picked, setPicked] = useState<string[]>([])
  const [packing, setPacking] = useState<'idle' | 'saving' | 'packed'>('idle')
  const units = lines.reduce((sum, line) => sum + line.quantity, 0)
  const allPicked = picked.length === lines.length

  const pack = async () => {
    setPacking('saving')
    try {
      await onMarkPacked()
      setPacking('packed')
    } catch {
      setPacking('idle')
    }
  }

  return (
    <DocumentLayout>
      <DocumentToolbar
        description={
          <p role='status'>
            {packing === 'packed'
              ? `Order ${orderNumber} packed and ready for pickup`
              : `${picked.length} of ${lines.length} items picked`}
          </p>
        }
      >
        <PrintButton>Print slip</PrintButton>
        <Button disabled={!allPicked || packing !== 'idle'} onClick={pack}>
          <IconPlaceholder
            lucide='PackageIcon'
            tabler='IconPackage'
            hugeicons='PackageIcon'
            phosphor='PackageIcon'
            remixicon='RiBox3Line'
            aria-hidden
          />
          {packing === 'saving'
            ? 'Saving…'
            : packing === 'packed'
              ? 'Packed'
              : 'Mark as packed'}
        </Button>
      </DocumentToolbar>
      <DocumentPage>
        <DocumentHeader
          brand={<DocumentBrand logo={logo} name={brand.name} detail={brand.website} />}
          title='Packing slip'
          number={`Order ${orderNumber}`}
          status={
            <Badge variant={packing === 'packed' ? 'secondary' : 'outline'}>
              {packing === 'packed' ? 'Packed' : 'To pack'}
            </Badge>
          }
        >
          <Barcode
            value={orderNumber}
            className='mt-2 items-start @xl/document:items-end print:items-end'
          />
        </DocumentHeader>
        <DocumentMeta
          className='border-y py-5'
          items={[
            { label: 'Ordered', value: formatBillingDate(orderDate) },
            { label: 'Ship by', value: formatBillingDate(shipBy) },
            { label: 'Shipping', value: shipping },
            { label: 'Packages', value: packages },
          ]}
        />
        <DocumentParties parties={[shipTo, billTo]} />
        <LineItemsTable
          caption={`${units} units in ${lines.length} lines`}
          hidePrices
          lines={lines}
          selection={{
            label: (line) => `Picked ${line.description}`,
            onChange: (id, isSelected) =>
              setPicked((current) =>
                isSelected ? [...current, id] : current.filter((item) => item !== id),
              ),
            selected: picked,
          }}
        />
        <div className='grid gap-8 border-t pt-8 @xl/document:grid-cols-2 print:grid-cols-2'>
          {giftMessage && (
            <DocumentSection title='Gift message'>
              <p className='text-muted-foreground text-pretty italic'>{giftMessage}</p>
            </DocumentSection>
          )}
          <DocumentSection title='Returns'>
            <p className='text-muted-foreground text-pretty'>
              Free returns within 30 days. Start one at{' '}
              <a
                href={returnsUrl}
                className='text-foreground underline underline-offset-4'
              >
                {returnsUrl.replace(/^https:\/\//, '')}
              </a>{' '}
              with order number {orderNumber}.
            </p>
          </DocumentSection>
        </div>
        <DocumentFooter>{footer}</DocumentFooter>
      </DocumentPage>
    </DocumentLayout>
  )
}

export { Invoice4, exampleProps as invoice4ExampleProps, type Invoice4Props }
