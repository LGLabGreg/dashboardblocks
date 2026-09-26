'use client'

import {
  InvoiceStatusBadge,
  type InvoiceStatus,
  formatBillingDate,
  formatCurrency,
} from '@/registry/components/dashboardblocks/billing'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/registry/components/dashboardblocks/data-table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Invoice {
  amount: number
  date: Date
  /** What the invoice covers, e.g. the plan and period. */
  description: string
  id: string
  number: string
  status: InvoiceStatus
}

interface Billing3Props {
  /** @default 'USD' */
  currency?: string
  invoices: Invoice[]
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
      description: 'Growth · Sep 14 – Oct 14',
      id: 'in_0926',
      number: 'INV-2026-0926',
      status: 'due',
    },
    {
      amount: 180,
      date: invoiceDate(8, 2),
      description: 'Extra seats · 4 seats, prorated',
      id: 'in_0914',
      number: 'INV-2026-0914',
      status: 'failed',
    },
    {
      amount: 588,
      date: invoiceDate(7, 14),
      description: 'Growth · Aug 14 – Sep 14',
      id: 'in_0871',
      number: 'INV-2026-0871',
      status: 'overdue',
    },
    {
      amount: 604.5,
      date: invoiceDate(6, 14),
      description: 'Growth · Jul 14 – Aug 14',
      id: 'in_0813',
      number: 'INV-2026-0813',
      status: 'paid',
    },
    {
      amount: 541.2,
      date: invoiceDate(5, 14),
      description: 'Growth · Jun 14 – Jul 14',
      id: 'in_0760',
      number: 'INV-2026-0760',
      status: 'paid',
    },
  ],
  title: 'Invoices',
}

const Billing3 = (props: Billing3Props) => {
  const { currency = 'USD', invoices, onDownload, onViewAll, title } = props
  const unpaid = invoices.filter((invoice) => invoice.status !== 'paid')
  const outstanding = unpaid.reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {unpaid.length === 0
            ? 'All invoices paid'
            : `${formatCurrency(outstanding, { currency, fractionDigits: 2 })} outstanding across ${unpaid.length} ${unpaid.length === 1 ? 'invoice' : 'invoices'}`}
        </CardDescription>
        {onViewAll && (
          <CardAction>
            <Button variant='outline' size='sm' onClick={onViewAll}>
              View all
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <DataTable>
        <caption className='sr-only'>{title}</caption>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead>Invoice</DataTableHead>
            <DataTableHead>Date</DataTableHead>
            <DataTableHead align='end'>Amount</DataTableHead>
            <DataTableHead>Status</DataTableHead>
            <DataTableHead align='end'>
              <span className='sr-only'>Download</span>
            </DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {invoices.map((invoice) => (
            <DataTableRow key={invoice.id}>
              <DataTableCell primary truncate>
                <span className='block truncate font-mono text-xs'>{invoice.number}</span>
                <span className='text-muted-foreground block truncate text-xs font-normal'>
                  {invoice.description}
                </span>
              </DataTableCell>
              <DataTableCell
                label='Date'
                className='text-muted-foreground whitespace-nowrap'
              >
                <time dateTime={invoice.date.toISOString()}>
                  {formatBillingDate(invoice.date)}
                </time>
              </DataTableCell>
              <DataTableCell align='end' label='Amount' className='font-medium'>
                {formatCurrency(invoice.amount, { currency, fractionDigits: 2 })}
              </DataTableCell>
              <DataTableCell label='Status'>
                <InvoiceStatusBadge status={invoice.status} />
              </DataTableCell>
              <DataTableCell
                align='end'
                className='@max-2xl/data-table:items-end @max-2xl/data-table:justify-end'
              >
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onDownload?.(invoice.id)}
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
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </Card>
  )
}

export { Billing3, exampleProps as billing3ExampleProps, type Billing3Props }
