'use client'

import {
  InvoiceStatusLabel,
  formatBillingDate,
  getDaysUntil,
} from '@/registry/components/dashboardblocks/billing'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DocumentBrand,
  DocumentFooter,
  DocumentHeader,
  DocumentHeadline,
  DocumentLayout,
  DocumentMeta,
  DocumentPage,
  DocumentParties,
  DocumentSection,
  DocumentSummary,
  DocumentToolbar,
  DocumentTotals,
  type DocumentLine,
  type DocumentParty,
  LineItemsTable,
  PrintButton,
  formatDocumentAmount,
  formatRate,
  getDocumentTotals,
  getTotalRows,
} from '@/registry/components/dashboardblocks/invoice'
import {
  Property,
  PropertyList,
} from '@/registry/components/dashboardblocks/record-detail'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { startTransition, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'

interface Invoice1Props {
  bank: { accountName: string; accountNumber: string; bank: string; routing: string }
  billTo: DocumentParty
  brand: { name: string; website: string }
  /** @default 'USD' */
  currency?: string
  /** A share off the subtotal, 0.05 for 5%. */
  discountRate?: number
  dueDate: Date
  /** Facts about the sender, printed at the foot of the page. */
  footer: string[]
  from: DocumentParty
  issueDate: Date
  /** Leave out, or pass none, to show the empty state. */
  lines?: DocumentLine[]
  notes: string
  /** Pass a fixed date, so the status renders the same on the server and in the browser. */
  now: Date
  number: string
  onDownload?: () => void
  onSendReminder?: () => Promise<void>
  paid?: number
  payUrl: string
  poNumber?: string
  sentTo: string
  status?: BlockStatus
  taxRate?: number
  terms: string
}

const exampleProps: Invoice1Props = {
  bank: {
    accountName: 'Halden Studio LLC',
    accountNumber: '•••• 7702',
    bank: 'Hudson Valley Credit Union',
    routing: '221 970 443',
  },
  billTo: {
    label: 'Bill to',
    lines: [
      'Attn: Priya Raman, Accounts Payable',
      '500 Boylston Street, Floor 12',
      'Boston, MA 02116',
      'ap@brightwavehealth.com',
    ],
    name: 'Brightwave Health, Inc.',
  },
  brand: { name: 'Halden Studio', website: 'halden.studio' },
  discountRate: 0.05,
  dueDate: new Date(Date.UTC(2026, 8, 20)),
  footer: ['Halden Studio LLC', '214 Wythe Avenue, Brooklyn, NY 11249', 'EIN 88-4410273'],
  from: {
    label: 'From',
    lines: ['214 Wythe Avenue, Studio 3', 'Brooklyn, NY 11249', 'billing@halden.studio'],
    name: 'Halden Studio LLC',
  },
  issueDate: new Date(Date.UTC(2026, 7, 31)),
  lines: [
    {
      description: 'Product design sprint',
      detail: 'Discovery, patient interviews and wireframes, Aug 4 – Aug 15',
      id: 'sprint',
      quantity: 1,
      unitPrice: 7200,
    },
    {
      description: 'Senior product engineering',
      detail: 'Patient intake flow in React Native',
      id: 'engineering',
      quantity: 46,
      unit: 'hrs',
      unitPrice: 165,
    },
    {
      description: 'Design system audit',
      detail: 'Tokens, components and an accessibility review',
      id: 'audit',
      quantity: 1,
      unitPrice: 2400,
    },
    {
      description: 'Moderated usability sessions',
      detail: 'Including participant incentives',
      id: 'usability',
      quantity: 8,
      unit: 'sessions',
      unitPrice: 180,
    },
    {
      description: 'Travel, Boston on-site',
      detail: 'Reimbursed at cost, not taxed. Receipts attached.',
      id: 'travel',
      quantity: 1,
      taxRate: 0,
      unitPrice: 612.48,
    },
  ],
  notes:
    'Thanks for another great sprint. The 5% retainer discount applies to every invoice through December.',
  now: new Date(Date.UTC(2026, 8, 27, 12)),
  number: 'INV-2026-0142',
  paid: 6000,
  payUrl: 'https://pay.halden.studio/inv/2026-0142',
  poNumber: 'PO-88213',
  sentTo: 'ap@brightwavehealth.com',
  taxRate: 0.08875,
  terms: 'Net 20. Balances unpaid after the due date accrue 1.5% interest per month.',
}

function sendReminder() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

const logo = (
  <svg viewBox='0 0 36 36' fill='none' aria-hidden>
    <rect
      x='1'
      y='1'
      width='34'
      height='34'
      rx='9'
      stroke='currentColor'
      strokeWidth='2'
    />
    <path d='M12 10v16M24 10v16M12 18h12' stroke='currentColor' strokeWidth='2.5' />
  </svg>
)

const Invoice1 = (props: Invoice1Props) => {
  const {
    bank,
    billTo,
    brand,
    currency = 'USD',
    discountRate,
    dueDate,
    footer,
    from,
    issueDate,
    lines = [],
    notes,
    now,
    number,
    onDownload = () => {},
    onSendReminder = sendReminder,
    paid,
    payUrl,
    poNumber,
    sentTo,
    status: blockStatus,
    taxRate,
    terms,
  } = props
  const state = getBlockState(blockStatus, lines)
  const [reminder, setReminder] = useState<'idle' | 'sending' | 'sent'>('idle')
  const amounts = getDocumentTotals(lines, { currency, discountRate, paid, taxRate })
  const daysLeft = getDaysUntil(dueDate, now)
  const status =
    lines.length > 0 && amounts.balanceDue <= 0
      ? 'paid'
      : daysLeft < 0
        ? 'overdue'
        : 'due'
  const due = formatDocumentAmount(amounts.balanceDue, currency)
  const dueWhen =
    status === 'overdue'
      ? `${-daysLeft} ${daysLeft === -1 ? 'day' : 'days'} overdue`
      : daysLeft === 0
        ? 'Due today'
        : `Due in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`

  const remind = async () => {
    setReminder('sending')
    try {
      await onSendReminder()
      startTransition(() => setReminder('sent'))
    } catch {
      startTransition(() => setReminder('idle'))
    }
  }

  return (
    <BlockStateProvider state={state}>
      <DocumentLayout>
        <DocumentToolbar
          description={
            <p role='status'>
              <BlockReady className='text-sm'>
                {reminder === 'sent'
                  ? `Reminder sent to ${sentTo}`
                  : `Sent to ${sentTo} on ${formatBillingDate(issueDate)}`}
              </BlockReady>
            </p>
          }
        >
          <PrintButton />
          <Button variant='outline' size='sm' disabled={!!state} onClick={onDownload}>
            <IconPlaceholder
              lucide='DownloadIcon'
              tabler='IconDownload'
              hugeicons='Download01Icon'
              phosphor='DownloadIcon'
              remixicon='RiDownloadLine'
              aria-hidden
            />
            Download PDF
          </Button>
          {status !== 'paid' && (
            <Button size='sm' disabled={!!state || reminder !== 'idle'} onClick={remind}>
              <IconPlaceholder
                lucide='SendIcon'
                tabler='IconSend'
                hugeicons='SentIcon'
                phosphor='PaperPlaneTiltIcon'
                remixicon='RiSendPlaneLine'
                aria-hidden
              />
              {reminder === 'sending'
                ? 'Sending…'
                : reminder === 'sent'
                  ? 'Reminder sent'
                  : 'Send reminder'}
            </Button>
          )}
        </DocumentToolbar>
        <DocumentPage>
          <DocumentHeader
            brand={<DocumentBrand logo={logo} name={brand.name} detail={brand.website} />}
            title='Invoice'
            number={number}
            status={<InvoiceStatusLabel status={status} />}
          />
          <DocumentSummary>
            <DocumentHeadline
              label={status === 'paid' ? 'Total paid' : 'Amount due'}
              value={
                status === 'paid' ? formatDocumentAmount(amounts.total, currency) : due
              }
            >
              {status === 'paid' ? (
                'Paid in full, nothing left to pay.'
              ) : (
                <>
                  <span
                    className={
                      status === 'overdue'
                        ? 'font-medium text-orange-700 dark:text-orange-400 print:text-black!'
                        : undefined
                    }
                  >
                    {dueWhen}
                  </span>
                  {amounts.paid > 0 && (
                    <>
                      , with{' '}
                      <span className='tabular-nums'>
                        {formatDocumentAmount(amounts.paid, currency)}
                      </span>{' '}
                      of{' '}
                      <span className='tabular-nums'>
                        {formatDocumentAmount(amounts.total, currency)}
                      </span>{' '}
                      paid
                    </>
                  )}
                  .
                </>
              )}
            </DocumentHeadline>
            <DocumentMeta
              items={[
                { label: 'Issued', value: formatBillingDate(issueDate) },
                { label: 'Due', value: formatBillingDate(dueDate) },
                ...(poNumber ? [{ label: 'PO number', value: poNumber }] : []),
              ]}
            />
          </DocumentSummary>
          {state !== 'empty' && state !== 'error' && (
            <>
              <DocumentParties parties={[from, billTo]} />
              <div className='flex flex-col gap-6'>
                <LineItemsTable currency={currency} lines={lines} />
                <DocumentTotals
                  currency={currency}
                  rows={getTotalRows(amounts, {
                    discount: discountRate
                      ? `Discount (${formatRate(discountRate)})`
                      : undefined,
                    paid: 'Deposit paid',
                    tax: 'Sales tax',
                  })}
                />
              </div>
              <div className='grid gap-8 border-t pt-8 @xl/document:grid-cols-2 print:grid-cols-2'>
                <DocumentSection title='How to pay'>
                  {status !== 'paid' && !state && (
                    <a
                      href={payUrl}
                      className={buttonVariants({
                        className: 'w-fit print:hidden',
                        size: 'sm',
                        variant: 'outline',
                      })}
                    >
                      Pay {due} online
                    </a>
                  )}
                  {state ? (
                    <BlockStateRows rows={4} />
                  ) : (
                    <>
                      <p className='text-muted-foreground'>
                        <span className='print:hidden'>
                          Or transfer to the account below.
                        </span>
                        <span className='hidden print:inline'>
                          Pay online at {payUrl.replace(/^https:\/\//, '')} or transfer to
                          the account below.
                        </span>{' '}
                        Use{' '}
                        <span className='text-foreground font-mono whitespace-nowrap'>
                          {number}
                        </span>{' '}
                        as the reference.
                      </p>
                      <PropertyList className='mt-1'>
                        <Property label='Bank'>{bank.bank}</Property>
                        <Property label='Account name'>{bank.accountName}</Property>
                        <Property label='Routing'>
                          <span className='font-mono'>{bank.routing}</span>
                        </Property>
                        <Property label='Account'>
                          <span className='font-mono'>{bank.accountNumber}</span>
                        </Property>
                      </PropertyList>
                    </>
                  )}
                </DocumentSection>
                <div className='flex flex-col gap-6'>
                  <DocumentSection title='Notes'>
                    <BlockReady>
                      <p className='text-muted-foreground text-pretty'>{notes}</p>
                    </BlockReady>
                  </DocumentSection>
                  <DocumentSection title='Terms'>
                    <BlockReady>
                      <p className='text-muted-foreground text-pretty'>{terms}</p>
                    </BlockReady>
                  </DocumentSection>
                </div>
              </div>
            </>
          )}
          <DocumentFooter parts={footer} />
        </DocumentPage>
      </DocumentLayout>
    </BlockStateProvider>
  )
}

export { Invoice1, exampleProps as invoice1ExampleProps, type Invoice1Props }
