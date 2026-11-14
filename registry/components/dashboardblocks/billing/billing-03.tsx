'use client'

import {
  type InvoiceStatus,
  InvoiceStatusLabel,
  formatBillingDate,
  getOutstandingInvoices,
} from '@/registry/components/dashboardblocks/billing'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowLink,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Invoice {
  amount: number
  date: Date
  description: string
  /** A muted line under the description, such as the period it covers. */
  detail?: string
  /** Where the invoice opens. The whole row links there. */
  href?: string
  id: string
  number: string
  status: InvoiceStatus
}

interface Billing3Props extends BlockStateProps {
  /** @default 'USD' */
  currency?: string
  /** Leave out to say what's outstanding. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  invoices?: Invoice[]
  /** Leave out to hide Download. */
  onDownload?: (id: string) => void
  onViewAll?: () => void
  title: string
}

const invoiceDate = (month: number, day: number) => new Date(Date.UTC(2026, month, day))

const exampleProps: Billing3Props = {
  invoices: [
    {
      amount: 612,
      date: invoiceDate(8, 14),
      description: 'Growth',
      detail: 'Sep 14 – Oct 14',
      href: '#in_0926',
      id: 'in_0926',
      number: 'INV-2026-0926',
      status: 'due',
    },
    {
      amount: 180,
      date: invoiceDate(8, 2),
      description: 'Extra seats',
      detail: 'Prorated for 4 seats',
      href: '#in_0914',
      id: 'in_0914',
      number: 'INV-2026-0914',
      status: 'failed',
    },
    {
      amount: 588,
      date: invoiceDate(7, 14),
      description: 'Growth',
      detail: 'Aug 14 – Sep 14',
      href: '#in_0871',
      id: 'in_0871',
      number: 'INV-2026-0871',
      status: 'overdue',
    },
    {
      amount: 604.5,
      date: invoiceDate(6, 14),
      description: 'Growth',
      detail: 'Jul 14 – Aug 14',
      href: '#in_0813',
      id: 'in_0813',
      number: 'INV-2026-0813',
      status: 'paid',
    },
    {
      amount: 541.2,
      date: invoiceDate(5, 14),
      description: 'Growth',
      detail: 'Jun 14 – Jul 14',
      href: '#in_0760',
      id: 'in_0760',
      number: 'INV-2026-0760',
      status: 'paid',
    },
  ],
  onDownload: () => {},
  title: 'Invoices',
}

const Billing3 = (props: Billing3Props) => {
  const {
    currency = 'USD',
    description: givenDescription,
    invoices = [],
    onDownload,
    onViewAll,
    errorMessage,
    status,
    title,
  } = props
  const state = getBlockState(status, invoices)
  const outstanding = getOutstandingInvoices(invoices)
  const money = (value: number) => formatCurrency(value, { currency, precision: 'exact' })
  const description = givenDescription ?? describeOutstanding(outstanding, money)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <Card>
        <CardContent>
          <section className='@container/data-table flex flex-col gap-3'>
            <header className='flex items-start justify-between gap-3'>
              <div className='flex min-w-0 flex-col gap-0.5'>
                <h2 className='font-semibold tracking-tight'>{title}</h2>
                <BlockReady className='text-sm'>
                  <p className='text-muted-foreground text-sm'>{description}</p>
                </BlockReady>
              </div>
              {onViewAll && (
                <Button variant='outline' size='sm' onClick={onViewAll}>
                  View all
                  <IconPlaceholder
                    lucide='ArrowRightIcon'
                    tabler='IconArrowRight'
                    hugeicons='ArrowRight01Icon'
                    phosphor='ArrowRightIcon'
                    remixicon='RiArrowRightLine'
                    data-icon='inline-end'
                  />
                </Button>
              )}
            </header>
            <DataTable caption={state ? title : `${title}: ${description}`}>
              <DataTableHeader>
                <DataTableRow>
                  <DataTableHead>Invoice</DataTableHead>
                  <DataTableHead>Date</DataTableHead>
                  <DataTableHead align='end'>Amount</DataTableHead>
                  <DataTableHead>Status</DataTableHead>
                  {onDownload && (
                    <DataTableHead align='end'>
                      <span className='sr-only'>Download</span>
                    </DataTableHead>
                  )}
                </DataTableRow>
              </DataTableHeader>
              <DataTableBody>
                <DataTableStateRows colSpan={onDownload ? 5 : 4} />
                {!state &&
                  invoices.map((invoice) => (
                    <DataTableRow key={invoice.id}>
                      <DataTableCell primary truncate>
                        {invoice.href ? (
                          <DataTableRowLink
                            aria-label={`${invoice.description}, ${invoice.number}`}
                            className='block'
                            href={invoice.href}
                          >
                            {invoice.description}
                          </DataTableRowLink>
                        ) : (
                          <span className='block truncate'>{invoice.description}</span>
                        )}
                        <Details className='text-muted-foreground block truncate text-xs font-normal tabular-nums'>
                          {invoice.number}
                          {invoice.detail}
                        </Details>
                      </DataTableCell>
                      <DataTableCell className='text-muted-foreground whitespace-nowrap'>
                        <time dateTime={invoice.date.toISOString()}>
                          {formatBillingDate(invoice.date)}
                        </time>
                      </DataTableCell>
                      <DataTableCell align='end'>{money(invoice.amount)}</DataTableCell>
                      <DataTableCell>
                        <InvoiceStatusLabel status={invoice.status} />
                      </DataTableCell>
                      {onDownload && (
                        <DataTableCell align='end'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => onDownload(invoice.id)}
                          >
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
                            <span className='sr-only'> for {invoice.number}</span>
                          </Button>
                        </DataTableCell>
                      )}
                    </DataTableRow>
                  ))}
              </DataTableBody>
            </DataTable>
          </section>
        </CardContent>
      </Card>
    </BlockStateProvider>
  )
}

function describeOutstanding(
  { amount, count, oldest }: ReturnType<typeof getOutstandingInvoices>,
  money: (value: number) => string,
) {
  if (count === 0 || !oldest) return 'Every invoice is paid.'
  if (count === 1) {
    return `${money(amount)} outstanding on the invoice from ${formatBillingDate(oldest.date)}.`
  }
  return `${money(amount)} outstanding across ${count} invoices, the oldest from ${formatBillingDate(oldest.date)}.`
}

export { Billing3, exampleProps as billing3ExampleProps, type Billing3Props }
