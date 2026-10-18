'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/data-table'
import { getKPIChange, KPIChange } from '@/registry/components/dashboardblocks/kpi'
import { StatSparkline } from '@/registry/components/dashboardblocks/stat-group'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'

interface CampaignRow {
  channel: string
  /** Daily conversions for the last 14 days, oldest first. */
  conversions: number[]
  name: string
  previousConversions: number
  previousCost: number
  spend: number
}

interface DataTable3Props {
  /** Follows each change, such as `the previous 14 days`. */
  comparison: string
  /** Defaults to a sentence with the total conversions, spend and change. */
  description?: string
  /** Follows the totals in the default description. */
  period?: string
  /** Leave out, or pass none, to show the empty state. */
  rows?: CampaignRow[]
  status?: BlockStatus
  title: string
}

const exampleDaily = (base: number, slope: number, phase: number) =>
  Array.from({ length: 14 }, (_, day) =>
    Math.max(
      0,
      Math.round(base + day * slope + Math.sin(day / 1.4 + phase) * base * 0.18),
    ),
  )

const exampleProps: DataTable3Props = {
  comparison: 'the previous 14 days',
  period: 'in the last 14 days',
  rows: [
    {
      channel: 'Paid search',
      conversions: exampleDaily(38, 1.1, 0),
      name: 'Brand keywords',
      previousConversions: 512,
      previousCost: 14.2,
      spend: 7_420,
    },
    {
      channel: 'Paid social',
      conversions: exampleDaily(24, 0.9, 1.2),
      name: 'Autumn launch',
      previousConversions: 268,
      previousCost: 31.6,
      spend: 9_860,
    },
    {
      channel: 'Display',
      conversions: exampleDaily(15, -0.5, 2.4),
      name: 'Retargeting',
      previousConversions: 241,
      previousCost: 18.9,
      spend: 4_310,
    },
    {
      channel: 'Email',
      conversions: exampleDaily(11, 0.2, 3.1),
      name: 'Weekly newsletter',
      previousConversions: 149,
      previousCost: 2.1,
      spend: 320,
    },
  ],
  title: 'Campaigns',
}

const money = (value: number) =>
  formatCurrency(value, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

const dayLabel = (index: number, count: number) => {
  const daysAgo = count - 1 - index
  return daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

const summarize = (rows: CampaignRow[], comparison: string, period?: string) => {
  const conversions = sum(rows.map((row) => sum(row.conversions)))
  const previous = sum(rows.map((row) => row.previousConversions))
  const spend = sum(rows.map((row) => row.spend))
  const change = getKPIChange({ previous, value: conversions })
  const trend = change
    ? `, ${change > 0 ? 'up' : 'down'} ${formatPercent(Math.abs(change) / 100, { maximumFractionDigits: 0 })} on ${comparison}`
    : ''
  return `${formatNumber(conversions)} conversions for ${formatCurrency(spend)}${period ? ` ${period}` : ''}${trend}.`
}

const DataTable3 = (props: DataTable3Props) => {
  const { comparison, period, rows = [], status, title } = props
  const { description = summarize(rows, comparison, period) } = props

  return (
    <BlockStateProvider state={getBlockState(status, rows)}>
      <section className='@container/data-table flex flex-col gap-3 [--data-table-inset:0px]'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <DataTable>
          <caption className='sr-only'>{`${title}: ${description}`}</caption>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Campaign</DataTableHead>
              <DataTableHead align='end'>Spend</DataTableHead>
              <DataTableHead align='end'>Conversions</DataTableHead>
              <DataTableHead align='end'>Cost per conversion</DataTableHead>
              <DataTableHead>Conversions by day</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableStateRows colSpan={5} rows={4} />
            {!status &&
              rows.map((row) => {
                const conversions = sum(row.conversions)
                const cost = conversions > 0 ? row.spend / conversions : 0
                const first = row.conversions[0]
                const last = row.conversions[row.conversions.length - 1]
                return (
                  <DataTableRow key={row.name}>
                    <DataTableCell primary>
                      <span className='block'>{row.name}</span>
                      <span className='text-muted-foreground block text-xs font-normal'>
                        {row.channel}
                      </span>
                    </DataTableCell>
                    <DataTableCell align='end' label='Spend'>
                      {formatCurrency(row.spend)}
                    </DataTableCell>
                    <DataTableCell align='end' label='Conversions'>
                      <span className='block'>{formatNumber(conversions)}</span>
                      <KPIChange
                        className='text-xs'
                        comparison={comparison}
                        inline
                        previous={row.previousConversions}
                        value={conversions}
                        variant='short'
                      />
                    </DataTableCell>
                    <DataTableCell align='end' label='Cost per conversion'>
                      <span className='block'>{money(cost)}</span>
                      <KPIChange
                        className='text-xs'
                        comparison={comparison}
                        format={money}
                        goodDirection='down'
                        inline
                        previous={row.previousCost}
                        value={cost}
                        variant='short'
                      />
                    </DataTableCell>
                    <DataTableCell label='Conversions by day' className='w-32'>
                      <StatSparkline
                        className='h-7 w-full'
                        data={row.conversions}
                        label={`${row.name} conversions by day: from ${first} to ${last}`}
                        labels={row.conversions.map((_, index) =>
                          dayLabel(index, row.conversions.length),
                        )}
                      />
                    </DataTableCell>
                  </DataTableRow>
                )
              })}
          </DataTableBody>
        </DataTable>
      </section>
    </BlockStateProvider>
  )
}

export { DataTable3, exampleProps as dataTable3ExampleProps, type DataTable3Props }
