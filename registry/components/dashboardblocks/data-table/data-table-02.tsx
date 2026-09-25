'use client'

import {
  DataTable,
  DataTableBar,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/registry/components/dashboardblocks/data-table'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductRow {
  category: string
  name: string
  revenue: number
  units: number
}

interface DataTable2Props {
  description: string
  rows: ProductRow[]
  title: string
}

const exampleProps: DataTable2Props = {
  description: 'Units sold, revenue and share of total, last 30 days',
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

const currency = (value: number) => `$${value.toLocaleString('en-US')}`

const DataTable2 = (props: DataTable2Props) => {
  const { description, rows, title } = props
  const sorted = [...rows].sort((a, b) => b.revenue - a.revenue)
  const total = rows.reduce((sum, row) => sum + row.revenue, 0)
  const max = sorted[0]?.revenue ?? 0

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <DataTable>
        <caption className='sr-only'>{`${title}: ${description}`}</caption>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead>Product</DataTableHead>
            <DataTableHead align='end'>Units</DataTableHead>
            <DataTableHead className='w-2/5'>Revenue</DataTableHead>
            <DataTableHead align='end'>Share</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {sorted.map((row) => {
            const share = total > 0 ? (row.revenue / total) * 100 : 0
            return (
              <DataTableRow key={row.name}>
                <DataTableCell primary>
                  <span className='block'>{row.name}</span>
                  <span className='text-muted-foreground block text-xs font-normal'>
                    {row.category}
                  </span>
                </DataTableCell>
                <DataTableCell align='end' label='Units'>
                  {row.units.toLocaleString()}
                </DataTableCell>
                <DataTableCell
                  label='Revenue'
                  className='@max-2xl/data-table:order-last @max-2xl/data-table:col-span-2'
                >
                  <span className='flex w-full items-center gap-3'>
                    <DataTableBar max={max} value={row.revenue} className='flex-1' />
                    <span className='w-16 text-right tabular-nums'>
                      {currency(row.revenue)}
                    </span>
                  </span>
                </DataTableCell>
                <DataTableCell
                  align='end'
                  label='Share'
                  className='text-muted-foreground'
                >
                  {share.toFixed(0)}%
                </DataTableCell>
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
    </Card>
  )
}

export { DataTable2, exampleProps as dataTable2ExampleProps, type DataTable2Props }
