'use client'

import {
  type InvoiceStatus,
  InvoiceStatusLabel,
  formatBillingDate,
} from '@/registry/components/dashboardblocks/billing'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
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
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'

import { Button } from '@/components/ui/button'

interface Invoice {
  amount: number
  date: Date
  description: string
  /** A muted line under the description, such as the period it covers. */
  detail?: string
  id: string
  number: string
  status: InvoiceStatus
}

interface Billing3Props {
  /** @default 'USD' */
  currency?: string
  /** Leave out, or pass none, to show the empty state. */
  invoices?: Invoice[]
  /** Leave out to hide Download. */
  onDownload?: (id: string) => void
  onViewAll?: () => void
  status?: BlockStatus
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
      id: 'in_0926',
      number: 'INV-2026-0926',
      status: 'due',
    },
    {
      amount: 180,
      date: invoiceDate(8, 2),
      description: 'Extra seats',
      detail: 'Prorated for 4 seats',
      id: 'in_0914',
      number: 'INV-2026-0914',
      status: 'failed',
    },
    {
      amount: 588,
      date: invoiceDate(7, 14),
      description: 'Growth',
      detail: 'Aug 14 – Sep 14',
      id: 'in_0871',
      number: 'INV-2026-0871',
      status: 'overdue',
    },
    {
      amount: 604.5,
      date: invoiceDate(6, 14),
      description: 'Growth',
      detail: 'Jul 14 – Aug 14',
      id: 'in_0813',
      number: 'INV-2026-0813',
      status: 'paid',
    },
    {
      amount: 541.2,
      date: invoiceDate(5, 14),
      description: 'Growth',
      detail: 'Jun 14 – Jul 14',
      id: 'in_0760',
      number: 'INV-2026-0760',
      status: 'paid',
    },
  ],
  onDownload: () => {},
  title: 'Invoices',
}

const Billing3 = (props: Billing3Props) => {
  const { currency = 'USD', invoices = [], onDownload, onViewAll, status, title } = props
  const state = getBlockState(status, invoices)
  const unpaid = invoices.filter((invoice) => invoice.status !== 'paid')
  const outstanding = unpaid.reduce((sum, invoice) => sum + invoice.amount, 0)
  const money = (value: number) =>
    formatCurrency(value, {
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })
  const oldest = unpaid.reduce<Invoice | undefined>(
    (first, invoice) => (!first || invoice.date < first.date ? invoice : first),
    undefined,
  )
  const description =
    unpaid.length === 0 || !oldest
      ? 'Every invoice is paid.'
      : `${money(outstanding)} outstanding across ${unpaid.length} ${unpaid.length === 1 ? 'invoice' : 'invoices'}, the oldest from ${formatBillingDate(oldest.date)}.`

  return (
    <BlockStateProvider state={state}>
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
                    <span className='block truncate'>{invoice.description}</span>
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
    </BlockStateProvider>
  )
}

export { Billing3, exampleProps as billing3ExampleProps, type Billing3Props }
