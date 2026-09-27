'use client'

import {
  InvoiceStatusBadge,
  formatBillingDate,
  getDaysUntil,
} from '@/registry/components/dashboardblocks/billing'
import {
  DocumentBrand,
  DocumentFooter,
  DocumentHeader,
  DocumentLayout,
  DocumentMeta,
  DocumentPage,
  DocumentParties,
  DocumentSection,
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
import { useState } from 'react'

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
  /** Small print, such as the legal name and tax ID. */
  footer: string
  from: DocumentParty
  issueDate: Date
  lines: DocumentLine[]
  notes: string
  /** Pass a fixed date, so the status renders the same on the server and in the browser. */
  now: Date
  number: string
  onDownload?: () => void
  onSendReminder?: () => Promise<void>
  /** Paid so far, such as a deposit. */
  paid?: number
  /** Where the client pays online. */
  payUrl: string
  poNumber?: string
  /** Who the invoice was sent to. */
  sentTo: string
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
  footer: 'Halden Studio LLC · 214 Wythe Avenue, Brooklyn, NY 11249 · EIN 88-4410273',
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
    lines,
    notes,
    now,
    number,
    onDownload = () => {},
    onSendReminder = sendReminder,
    paid,
    payUrl,
    poNumber,
    sentTo,
    taxRate,
    terms,
  } = props
  const [reminder, setReminder] = useState<'idle' | 'sending' | 'sent'>('idle')
  const amounts = getDocumentTotals(lines, { currency, discountRate, paid, taxRate })
  const daysLeft = getDaysUntil(dueDate, now)
  const status = amounts.balanceDue <= 0 ? 'paid' : daysLeft < 0 ? 'overdue' : 'due'
  const due = formatDocumentAmount(amounts.balanceDue, currency)

  const remind = async () => {
    setReminder('sending')
    try {
      await onSendReminder()
      setReminder('sent')
    } catch {
      setReminder('idle')
    }
  }

  return (
    <DocumentLayout>
      <DocumentToolbar
        description={
          <p role='status'>
            {reminder === 'sent'
              ? `Reminder sent to ${sentTo}`
              : `Sent to ${sentTo} on ${formatBillingDate(issueDate)}`}
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
          Download PDF
        </Button>
        {status !== 'paid' && (
          <Button disabled={reminder !== 'idle'} onClick={remind}>
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
          status={<InvoiceStatusBadge status={status} />}
        />
        <DocumentMeta
          className='border-y py-5'
          items={[
            { label: 'Issued', value: formatBillingDate(issueDate) },
            {
              label: 'Due',
              note:
                status === 'overdue' ? (
                  <span className='text-amber-800 dark:text-amber-400 print:text-foreground!'>
                    {-daysLeft} {daysLeft === -1 ? 'day' : 'days'} overdue
                  </span>
                ) : status === 'due' ? (
                  <span className='text-muted-foreground'>
                    {daysLeft === 0
                      ? 'Today'
                      : `In ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`}
                  </span>
                ) : undefined,
              value: formatBillingDate(dueDate),
            },
            ...(poNumber ? [{ label: 'PO number', value: poNumber }] : []),
            { label: 'Amount due', value: due },
          ]}
        />
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
            {status !== 'paid' && (
              <a
                href={payUrl}
                className={buttonVariants({ className: 'w-fit print:hidden' })}
              >
                Pay {due} online
              </a>
            )}
            <p className='text-muted-foreground'>
              <span className='print:hidden'>Or transfer to the account below.</span>
              <span className='hidden print:inline'>
                Pay online at {payUrl.replace(/^https:\/\//, '')} or transfer to the
                account below.
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
          </DocumentSection>
          <div className='flex flex-col gap-6'>
            <DocumentSection title='Notes'>
              <p className='text-muted-foreground text-pretty'>{notes}</p>
            </DocumentSection>
            <DocumentSection title='Terms'>
              <p className='text-muted-foreground text-pretty'>{terms}</p>
            </DocumentSection>
          </div>
        </div>
        <DocumentFooter>{footer}</DocumentFooter>
      </DocumentPage>
    </DocumentLayout>
  )
}

export { Invoice1, exampleProps as invoice1ExampleProps, type Invoice1Props }
