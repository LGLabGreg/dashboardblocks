'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DataTable,
  DataTableBar,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'

interface ProductRow {
  category: string
  name: string
  revenue: number
  units: number
}

interface DataTable2Props {
  /** Defaults to a sentence with the total and the top product's share. */
  description?: string
  /** Follows the total in the default description. */
  period?: string
  /** Leave out, or pass none, to show the empty state. */
  rows?: ProductRow[]
  status?: BlockStatus
  title: string
}

const exampleProps: DataTable2Props = {
  period: 'in the last 30 days',
  rows: [
    { category: 'Displays', name: 'Studio Display 27"', revenue: 48_920, units: 112 },
    { category: 'Audio', name: 'Wireless headphones', revenue: 41_370, units: 287 },
    { category: 'Furniture', name: 'Ergonomic chair', revenue: 36_540, units: 84 },
    { category: 'Accessories', name: 'Mechanical keyboard', revenue: 21_480, units: 179 },
    { category: 'Accessories', name: 'USB-C dock', revenue: 12_960, units: 144 },
    { category: 'Audio', name: 'Desk speakers', revenue: 8_730, units: 97 },
  ],
  title: 'Revenue by product',
}

const share = (value: number, total: number) =>
  formatPercent(total > 0 ? value / total : 0, { maximumFractionDigits: 0 })

const DataTable2 = (props: DataTable2Props) => {
  const { period, rows = [], status, title } = props
  const sorted = [...rows].sort((a, b) => b.revenue - a.revenue)
  const total = rows.reduce((sum, row) => sum + row.revenue, 0)
  const top = sorted[0]
  const {
    description = top
      ? `${formatCurrency(total)} from ${rows.length} products${period ? ` ${period}` : ''}; ${top.name} brings in ${share(top.revenue, total)}.`
      : `No sales${period ? ` ${period}` : ''}.`,
  } = props

  return (
    <BlockStateProvider state={getBlockState(status, rows)}>
      <section className='@container/data-table flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <DataTable caption={`${title}: ${description}`}>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Product</DataTableHead>
              <DataTableHead align='end'>Units</DataTableHead>
              <DataTableHead className='w-2/5'>Revenue</DataTableHead>
              <DataTableHead align='end'>Share</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableStateRows colSpan={4} rows={6} />
            {!status &&
              sorted.map((row) => (
                <DataTableRow key={row.name}>
                  <DataTableCell primary>
                    <span className='block'>{row.name}</span>
                    <span className='text-muted-foreground block text-xs font-normal'>
                      {row.category}
                    </span>
                  </DataTableCell>
                  <DataTableCell align='end'>{formatNumber(row.units)}</DataTableCell>
                  <DataTableCell>
                    <span className='flex w-full items-center gap-3'>
                      <DataTableBar max={top?.revenue ?? 0} value={row.revenue} />
                      <span className='w-16 shrink-0 text-right tabular-nums'>
                        {formatCurrency(row.revenue)}
                      </span>
                    </span>
                  </DataTableCell>
                  <DataTableCell align='end' className='text-muted-foreground'>
                    {share(row.revenue, total)}
                  </DataTableCell>
                </DataTableRow>
              ))}
          </DataTableBody>
        </DataTable>
      </section>
    </BlockStateProvider>
  )
}

export { DataTable2, exampleProps as dataTable2ExampleProps, type DataTable2Props }
