'use client'

import {
  InvoiceStatusBadge,
  formatBillingDate,
} from '@/registry/components/dashboardblocks/billing'
import {
  DocumentBrand,
  DocumentFooter,
  DocumentHeader,
  DocumentLayout,
  DocumentMeta,
  DocumentPage,
  DocumentSection,
  DocumentToolbar,
  DocumentTotals,
  type DocumentLine,
  type DocumentTotalRow,
  LineItemsTable,
  PrintButton,
  formatDocumentAmount,
  getCurrencyDigits,
  getDocumentTotals,
  getTotalRows,
} from '@/registry/components/dashboardblocks/invoice'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Refund {
  amount: number
  date: Date
  reason: string
}

interface Invoice2Props {
  brand: { name: string; website: string }
  /** @default 'USD' */
  currency?: string
  email: string
  footer: string
  lines: DocumentLine[]
  number: string
  onDownload?: () => void
  onEmail?: () => Promise<void>
  orderNumber: string
  paidAt: Date
  paymentMethod: string
  refunds: Refund[]
  shipping?: number
  shippingMethod: string
  supportEmail: string
  taxRate?: number
}

const exampleProps: Invoice2Props = {
  brand: { name: 'Fernhill Coffee Roasters', website: 'fernhill.coffee' },
  email: 'maya.okafor@fastmail.com',
  footer: 'Fernhill Coffee Roasters LLC · 1180 Folsom Street, San Francisco, CA 94103',
  lines: [
    {
      description: 'Ethiopia Guji, whole bean',
      detail: '340 g, not taxed',
      id: 'guji',
      quantity: 2,
      taxRate: 0,
      unitPrice: 21,
    },
    {
      description: 'Stovetop gooseneck kettle',
      detail: 'Matte black, 1 L',
      id: 'kettle',
      quantity: 1,
      unitPrice: 56,
    },
    {
      description: 'Ceramic pour-over dripper',
      detail: 'Size 02, white',
      id: 'dripper',
      quantity: 1,
      unitPrice: 28,
    },
    {
      description: 'Paper filters',
      detail: 'Size 02, pack of 100',
      id: 'filters',
      quantity: 2,
      unitPrice: 7.5,
    },
  ],
  number: 'RCPT-58210',
  orderNumber: '#FH-20931',
  paidAt: new Date(Date.UTC(2026, 8, 14, 17, 42)),
  paymentMethod: 'Visa •••• 4242',
  refunds: [
    {
      amount: 60.06,
      date: new Date(Date.UTC(2026, 8, 22)),
      reason: 'Kettle returned',
    },
  ],
  shipping: 8.95,
  shippingMethod: 'USPS Priority Mail',
  supportEmail: 'orders@fernhill.coffee',
  taxRate: 0.0725,
}

function emailReceipt() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

const logo = (
  <svg viewBox='0 0 36 36' fill='none' aria-hidden>
    <circle cx='18' cy='18' r='17' stroke='currentColor' strokeWidth='2' />
    <path
      d='M18 8c-5 4-5 16 0 20M18 8c5 4 5 16 0 20'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
)

const Invoice2 = (props: Invoice2Props) => {
  const {
    brand,
    currency = 'USD',
    email,
    footer,
    lines,
    number,
    onDownload = () => {},
    onEmail = emailReceipt,
    orderNumber,
    paidAt,
    paymentMethod,
    refunds,
    shipping,
    shippingMethod,
    supportEmail,
    taxRate,
  } = props
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const amounts = getDocumentTotals(lines, { currency, shipping, taxRate })
  const unit = 10 ** getCurrencyDigits(currency)
  const refunded =
    refunds.reduce((sum, refund) => sum + Math.round(refund.amount * unit), 0) / unit
  const netPaid = (Math.round(amounts.total * unit) - Math.round(refunded * unit)) / unit

  const rows: DocumentTotalRow[] = [
    ...getTotalRows(amounts).map((row) =>
      row.id === 'total' ? { ...row, emphasis: 'total' as const } : row,
    ),
    ...refunds.map((refund, index) => ({
      id: `refund-${index}`,
      label: (
        <>
          Refunded {formatBillingDate(refund.date)}
          <span className='block text-xs'>{refund.reason}</span>
        </>
      ),
      value: -refund.amount,
    })),
  ]
  if (refunds.length > 0) {
    rows.push({ emphasis: 'due', id: 'net', label: 'Net paid', value: netPaid })
  }

  const sendEmail = async () => {
    setEmailState('sending')
    try {
      await onEmail()
      setEmailState('sent')
    } catch {
      setEmailState('idle')
    }
  }

  return (
    <DocumentLayout className='max-w-md'>
      <DocumentToolbar
        description={
          <p role='status' className={emailState === 'sent' ? undefined : 'sr-only'}>
            {emailState === 'sent' ? `Sent to ${email}` : ''}
          </p>
        }
      >
        <PrintButton />
        <Button variant='outline' onClick={onDownload}>
          <IconPlaceholder
            lucide='DownloadIcon'
            tabler='IconDownload'
            hugeicons='Download01Icon'
            phosphor='DownloadIcon'
            remixicon='RiDownloadLine'
            aria-hidden
          />
          <span className='sr-only'>Download </span>
          PDF
        </Button>
        <Button variant='outline' disabled={emailState === 'sending'} onClick={sendEmail}>
          <IconPlaceholder
            lucide='MailIcon'
            tabler='IconMail'
            hugeicons='MailIcon'
            phosphor='EnvelopeIcon'
            remixicon='RiMailLine'
            aria-hidden
          />
          {emailState === 'sending' ? 'Sending…' : 'Email'}
        </Button>
      </DocumentToolbar>
      <DocumentPage>
        <DocumentHeader
          brand={<DocumentBrand logo={logo} name={brand.name} detail={brand.website} />}
          title='Receipt'
          number={number}
          status={
            <>
              <InvoiceStatusBadge status='paid' />
              {refunded > 0 && (
                <Badge variant='outline'>
                  {refunded >= amounts.total ? 'Refunded' : 'Partially refunded'}
                </Badge>
              )}
            </>
          }
        />
        <div className='flex flex-col gap-1 border-y py-5'>
          <span className='text-muted-foreground text-sm'>Amount paid</span>
          <span className='text-3xl font-semibold tracking-tight tabular-nums'>
            {formatDocumentAmount(amounts.total, currency)}
          </span>
          {refunded > 0 && (
            <span className='text-muted-foreground text-sm tabular-nums'>
              {formatDocumentAmount(refunded, currency)} refunded,{' '}
              {formatDocumentAmount(netPaid, currency)} net
            </span>
          )}
        </div>
        <DocumentMeta
          className='grid-cols-2 @xl/document:grid-flow-row @xl/document:grid-cols-2 print:grid-flow-row print:grid-cols-2'
          items={[
            { label: 'Date paid', value: formatBillingDate(paidAt) },
            { label: 'Order', value: orderNumber },
            { label: 'Payment method', value: paymentMethod },
            { label: 'Shipping', value: shippingMethod },
          ]}
        />
        <div className='flex flex-col gap-6'>
          <LineItemsTable currency={currency} lines={lines} />
          <DocumentTotals className='max-w-none' currency={currency} rows={rows} />
        </div>
        <DocumentSection title='Questions about your order?'>
          <p className='text-muted-foreground'>
            Reply to your receipt email or write to{' '}
            <a
              href={`mailto:${supportEmail}`}
              className='text-foreground underline underline-offset-4'
            >
              {supportEmail}
            </a>
            . Returns are free within 30 days.
          </p>
        </DocumentSection>
        <DocumentFooter>{footer}</DocumentFooter>
      </DocumentPage>
    </DocumentLayout>
  )
}

export { Invoice2, exampleProps as invoice2ExampleProps, type Invoice2Props }
