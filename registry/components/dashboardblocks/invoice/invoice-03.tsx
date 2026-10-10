'use client'

import {
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
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type QuoteDecision = 'accepted' | 'declined'

interface Invoice3Props {
  brand: { name: string; website: string }
  /** @default 'USD' */
  currency?: string
  defaultSelected?: string[]
  /** A share off the subtotal, 0.1 for 10%. */
  discountRate?: number
  expiresAt: Date
  footer: string
  from: DocumentParty
  issueDate: Date
  /** Lines marked `optional` get a checkbox to include them. */
  lines: DocumentLine[]
  notes: string
  /** Pass a fixed date, so the days left render the same on the server and in the browser. */
  now: Date
  number: string
  onAccept?: (selected: string[]) => Promise<void>
  onDecline?: () => Promise<void>
  preparedBy: string
  preparedFor: DocumentParty
  terms: string
}

const exampleProps: Invoice3Props = {
  brand: { name: 'Kestrel Analytics', website: 'kestrel.io' },
  defaultSelected: ['migration'],
  discountRate: 0.1,
  expiresAt: new Date(Date.UTC(2026, 9, 12)),
  footer: 'Kestrel Analytics, Inc. · 88 Pine Street, Suite 1400, New York, NY 10005',
  from: {
    label: 'From',
    lines: ['88 Pine Street, Suite 1400', 'New York, NY 10005', 'sales@kestrel.io'],
    name: 'Kestrel Analytics, Inc.',
  },
  issueDate: new Date(Date.UTC(2026, 8, 12)),
  lines: [
    {
      description: 'Kestrel Business, annual licence',
      detail: 'Oct 1, 2026 – Sep 30, 2027',
      id: 'licence',
      quantity: 25,
      unit: 'seats',
      unitPrice: 540,
    },
    {
      description: 'Implementation and onboarding',
      detail: 'Six weeks with a named solutions engineer',
      id: 'implementation',
      quantity: 1,
      unitPrice: 4800,
    },
    {
      description: 'Salesforce and NetSuite connectors',
      id: 'connectors',
      quantity: 2,
      unitPrice: 1200,
    },
    {
      description: 'Historical data migration',
      detail: 'Up to five years of shipment and billing data',
      id: 'migration',
      optional: true,
      quantity: 1,
      unitPrice: 2200,
    },
    {
      description: 'Admin training',
      detail: 'Remote, up to 12 people per session',
      id: 'training',
      optional: true,
      quantity: 2,
      unit: 'sessions',
      unitPrice: 650,
    },
    {
      description: 'Premium support, annual',
      detail: '1-hour response time, 24/7',
      id: 'support',
      optional: true,
      quantity: 1,
      unitPrice: 3000,
    },
  ],
  notes:
    'Prices include the 10% discount for paying the first year up front. Seats can be added at any time at the same rate, prorated.',
  now: new Date(Date.UTC(2026, 8, 27, 12)),
  number: 'Q-2026-0318',
  preparedBy: 'Daniel Osei',
  preparedFor: {
    label: 'Prepared for',
    lines: ['Attn: Hannah Lindqvist, COO', '410 Terminal Way', 'Savannah, GA 31401'],
    name: 'Marlow Freight Co.',
  },
  terms:
    'Tax is added at invoicing. The licence is invoiced on acceptance, services when they start. Net 30.',
}

function respond() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

const logo = (
  <svg viewBox='0 0 36 36' fill='none' aria-hidden>
    <path
      d='M4 26 18 6l14 20H4Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinejoin='round'
    />
    <path d='M11 26 18 16l7 10' stroke='currentColor' strokeWidth='2' />
  </svg>
)

const Invoice3 = (props: Invoice3Props) => {
  const {
    brand,
    currency = 'USD',
    defaultSelected = [],
    discountRate,
    expiresAt,
    footer,
    from,
    issueDate,
    lines,
    notes,
    now,
    number,
    onAccept = respond,
    onDecline = respond,
    preparedBy,
    preparedFor,
    terms,
  } = props
  const [selected, setSelected] = useState(defaultSelected)
  const [decision, setDecision] = useState<QuoteDecision | null>(null)
  const [pending, setPending] = useState<QuoteDecision | null>(null)

  const included = lines.filter((line) => !line.optional || selected.includes(line.id))
  const amounts = getDocumentTotals(included, { currency, discountRate })
  const total = formatDocumentAmount(amounts.total, currency)
  const options = lines.filter((line) => line.optional)
  const daysLeft = getDaysUntil(expiresAt, now)
  const expired = daysLeft < 0
  const status = decision ?? (expired ? 'expired' : 'open')

  const decide = async (next: QuoteDecision) => {
    setPending(next)
    try {
      await (next === 'accepted' ? onAccept(selected) : onDecline())
      setDecision(next)
    } catch {
      setDecision(null)
    } finally {
      setPending(null)
    }
  }

  const statusBadge = {
    accepted: (
      <Badge variant='secondary'>
        <IconPlaceholder
          lucide='CircleCheckIcon'
          tabler='IconCircleCheck'
          hugeicons='CheckmarkCircle02Icon'
          phosphor='CheckCircleIcon'
          remixicon='RiCheckboxCircleLine'
          aria-hidden
        />
        Accepted
      </Badge>
    ),
    declined: <Badge variant='outline'>Declined</Badge>,
    expired: <Badge variant='outline'>Expired</Badge>,
    open: <Badge variant='outline'>Awaiting response</Badge>,
  }[status]

  return (
    <DocumentLayout>
      <DocumentToolbar
        description={
          <p role='status'>
            {decision === 'accepted'
              ? `Accepted with ${selected.length} of ${options.length} options, ${total} in total`
              : decision === 'declined'
                ? 'Quote declined. We’ll let the sender know.'
                : `${selected.length} of ${options.length} options included`}
          </p>
        }
      >
        <PrintButton />
        {decision ? (
          <Button variant='outline' onClick={() => setDecision(null)}>
            <IconPlaceholder
              lucide='Undo2Icon'
              tabler='IconArrowBackUp'
              hugeicons='Undo02Icon'
              phosphor='ArrowUUpLeftIcon'
              remixicon='RiArrowGoBackLine'
              aria-hidden
            />
            Undo
          </Button>
        ) : (
          !expired && (
            <>
              <Button
                variant='outline'
                disabled={pending !== null}
                onClick={() => decide('declined')}
              >
                {pending === 'declined' ? 'Declining…' : 'Decline'}
              </Button>
              <Button disabled={pending !== null} onClick={() => decide('accepted')}>
                <IconPlaceholder
                  lucide='CheckIcon'
                  tabler='IconCheck'
                  hugeicons='Tick02Icon'
                  phosphor='CheckIcon'
                  remixicon='RiCheckLine'
                  aria-hidden
                />
                {pending === 'accepted' ? 'Accepting…' : `Accept for ${total}`}
              </Button>
            </>
          )
        )}
      </DocumentToolbar>
      <DocumentPage>
        <DocumentHeader
          brand={<DocumentBrand logo={logo} name={brand.name} detail={brand.website} />}
          title='Quote'
          number={number}
          status={statusBadge}
        />
        <DocumentMeta
          className='border-y py-5'
          items={[
            { label: 'Issued', value: formatBillingDate(issueDate) },
            {
              label: 'Valid until',
              note: (
                <span className='text-muted-foreground'>
                  {expired
                    ? 'Expired'
                    : daysLeft === 0
                      ? 'Expires today'
                      : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                </span>
              ),
              value: formatBillingDate(expiresAt),
            },
            { label: 'Prepared by', value: preparedBy },
            { label: 'Total', value: total },
          ]}
        />
        <DocumentParties parties={[from, preparedFor]} />
        <div className='flex flex-col gap-6'>
          <LineItemsTable
            currency={currency}
            lines={decision ? included : lines}
            selection={
              decision
                ? undefined
                : {
                    isSelectable: (line) => Boolean(line.optional),
                    label: (line) => `Include ${line.description}`,
                    onChange: (id, isSelected) =>
                      setSelected((current) =>
                        isSelected
                          ? [...current, id]
                          : current.filter((item) => item !== id),
                      ),
                    selected,
                  }
            }
          />
          <DocumentTotals
            currency={currency}
            rows={getTotalRows(amounts, {
              discount: discountRate
                ? `Prepay discount (${formatRate(discountRate)})`
                : undefined,
            })}
          />
        </div>
        <div className='grid gap-8 border-t pt-8 @xl/document:grid-cols-2 print:grid-cols-2'>
          <DocumentSection title='Notes'>
            <p className='text-muted-foreground text-pretty'>{notes}</p>
          </DocumentSection>
          <DocumentSection title='Terms'>
            <p className='text-muted-foreground text-pretty'>{terms}</p>
          </DocumentSection>
        </div>
        {!decision && (
          <DocumentSection title='Acceptance' className='hidden print:flex'>
            <p className='text-muted-foreground'>
              Sign and return to accept this quote with the options ticked above.
            </p>
            <div className='mt-8 grid grid-cols-3 gap-6'>
              {['Name', 'Signature', 'Date'].map((label) => (
                <span key={label} className='border-foreground border-t pt-1.5 text-xs'>
                  {label}
                </span>
              ))}
            </div>
          </DocumentSection>
        )}
        <DocumentFooter>{footer}</DocumentFooter>
      </DocumentPage>
    </DocumentLayout>
  )
}

export { Invoice3, exampleProps as invoice3ExampleProps, type Invoice3Props }
