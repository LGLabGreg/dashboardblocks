'use client'

import {
  formatBillingDate,
  getDaysUntil,
} from '@/registry/components/dashboardblocks/billing'
import {
  BlockReady,
  BlockStateProvider,
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
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { startTransition, useState } from 'react'

import { Button } from '@/components/ui/button'

type QuoteDecision = 'accepted' | 'declined'

type QuoteStatus = QuoteDecision | 'expired' | 'open'

const quoteStatusConfig: Record<QuoteStatus, { label: string; tone: StatusTone }> = {
  accepted: { label: 'Accepted', tone: 'good' },
  declined: { label: 'Declined', tone: 'neutral' },
  expired: { label: 'Expired', tone: 'neutral' },
  open: { label: 'Awaiting response', tone: 'info' },
}

interface Invoice3Props {
  brand: { name: string; website: string }
  /** @default 'USD' */
  currency?: string
  defaultSelected?: string[]
  /** A share off the subtotal, 0.1 for 10%. */
  discountRate?: number
  expiresAt: Date
  /** Facts about the sender, printed at the foot of the page. */
  footer: string[]
  from: DocumentParty
  issueDate: Date
  /** Lines marked `optional` get a checkbox to include them. Leave out, or pass none, to show the empty state. */
  lines?: DocumentLine[]
  notes: string
  /** Pass a fixed date, so the days left render the same on the server and in the browser. */
  now: Date
  number: string
  onAccept?: (selected: string[]) => Promise<void>
  onDecline?: () => Promise<void>
  preparedBy: string
  preparedFor: DocumentParty
  status?: BlockStatus
  terms: string
}

const exampleProps: Invoice3Props = {
  brand: { name: 'Kestrel Analytics', website: 'kestrel.io' },
  defaultSelected: ['migration'],
  discountRate: 0.1,
  expiresAt: new Date(Date.UTC(2026, 9, 12)),
  footer: ['Kestrel Analytics, Inc.', '88 Pine Street, Suite 1400, New York, NY 10005'],
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
      detail: 'Remote sessions for up to 12 people',
      id: 'training',
      optional: true,
      quantity: 2,
      unit: 'sessions',
      unitPrice: 650,
    },
    {
      description: 'Premium support, annual',
      detail: '1-hour response around the clock',
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
    lines = [],
    notes,
    now,
    number,
    onAccept = respond,
    onDecline = respond,
    preparedBy,
    preparedFor,
    status: blockStatus,
    terms,
  } = props
  const state = getBlockState(blockStatus, lines)
  const [selected, setSelected] = useState(defaultSelected)
  const [decision, setDecision] = useState<QuoteDecision | null>(null)
  const [pending, setPending] = useState<QuoteDecision | null>(null)

  const included = lines.filter((line) => !line.optional || selected.includes(line.id))
  const amounts = getDocumentTotals(included, { currency, discountRate })
  const total = formatDocumentAmount(amounts.total, currency)
  const options = lines.filter((line) => line.optional)
  const daysLeft = getDaysUntil(expiresAt, now)
  const expired = daysLeft < 0
  const status: QuoteStatus = decision ?? (expired ? 'expired' : 'open')

  const decide = async (next: QuoteDecision) => {
    setPending(next)
    try {
      await (next === 'accepted' ? onAccept(selected) : onDecline())
      startTransition(() => {
        setDecision(next)
        setPending(null)
      })
    } catch {
      startTransition(() => {
        setDecision(null)
        setPending(null)
      })
    }
  }

  return (
    <BlockStateProvider state={state}>
      <DocumentLayout>
        <DocumentToolbar
          description={
            <p role='status'>
              <BlockReady className='text-sm'>
                {decision === 'accepted'
                  ? `Accepted with ${selected.length} of ${options.length} options, ${total} in total`
                  : decision === 'declined'
                    ? 'Quote declined. We’ll let the sender know.'
                    : `${selected.length} of ${options.length} options included`}
              </BlockReady>
            </p>
          }
        >
          <PrintButton />
          {decision ? (
            <Button variant='outline' size='sm' onClick={() => setDecision(null)}>
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
                  size='sm'
                  disabled={!!state || pending !== null}
                  onClick={() => decide('declined')}
                >
                  {pending === 'declined' ? 'Declining…' : 'Decline'}
                </Button>
                <Button
                  size='sm'
                  disabled={!!state || pending !== null}
                  onClick={() => decide('accepted')}
                >
                  <IconPlaceholder
                    lucide='CheckIcon'
                    tabler='IconCheck'
                    hugeicons='Tick02Icon'
                    phosphor='CheckIcon'
                    remixicon='RiCheckLine'
                    aria-hidden
                  />
                  {pending === 'accepted'
                    ? 'Accepting…'
                    : state
                      ? 'Accept'
                      : `Accept for ${total}`}
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
            status={
              <StatusLabel tone={quoteStatusConfig[status].tone}>
                {quoteStatusConfig[status].label}
              </StatusLabel>
            }
          />
          <DocumentSummary>
            <DocumentHeadline label='Total' value={total}>
              {discountRate ? `After the ${formatRate(discountRate)} discount. ` : null}
              {expired
                ? `Expired on ${formatBillingDate(expiresAt)}.`
                : daysLeft === 0
                  ? 'Expires today.'
                  : `Valid for ${daysLeft} more ${daysLeft === 1 ? 'day' : 'days'}.`}
            </DocumentHeadline>
            <DocumentMeta
              items={[
                { label: 'Issued', value: formatBillingDate(issueDate) },
                { label: 'Valid until', value: formatBillingDate(expiresAt) },
                { label: 'Prepared by', value: preparedBy },
              ]}
            />
          </DocumentSummary>
          {state !== 'empty' && state !== 'error' && (
            <>
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
              {!decision && (
                <DocumentSection title='Acceptance' className='hidden print:flex'>
                  <p className='text-muted-foreground'>
                    Sign and return to accept this quote with the options ticked above.
                  </p>
                  <div className='mt-8 grid grid-cols-3 gap-6'>
                    {['Name', 'Signature', 'Date'].map((label) => (
                      <span
                        key={label}
                        className='border-foreground border-t pt-1.5 text-xs'
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </DocumentSection>
              )}
            </>
          )}
          <DocumentFooter parts={footer} />
        </DocumentPage>
      </DocumentLayout>
    </BlockStateProvider>
  )
}

export { Invoice3, exampleProps as invoice3ExampleProps, type Invoice3Props }
