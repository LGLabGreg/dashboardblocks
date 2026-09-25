'use client'

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/registry/components/dashboardblocks/data-table'
import { StatSparkline } from '@/registry/components/dashboardblocks/stat-group'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CampaignRow {
  channel: string
  /** Daily conversions for the last 14 days, oldest first. */
  conversions: number[]
  name: string
  /** Conversions in the previous 14 days. */
  previousConversions: number
  /** Cost per conversion in the previous 14 days. */
  previousCost: number
  spend: number
}

interface DataTable3Props {
  description: string
  rows: CampaignRow[]
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
  description: 'Last 14 days, compared with the previous 14 days',
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

const currency = (value: number, digits = 0) =>
  `$${value.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits })}`

const percentChange = (current: number, previous: number) =>
  previous === 0 ? 0 : Math.round(((current - previous) / previous) * 1000) / 10

const DataTable3 = (props: DataTable3Props) => {
  const { description, rows, title } = props

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
            <DataTableHead>Campaign</DataTableHead>
            <DataTableHead align='end'>Spend</DataTableHead>
            <DataTableHead align='end'>Conversions</DataTableHead>
            <DataTableHead align='end'>Cost per conversion</DataTableHead>
            <DataTableHead>Conversions by day</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {rows.map((row) => {
            const conversions = row.conversions.reduce((sum, value) => sum + value, 0)
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
                  {currency(row.spend)}
                </DataTableCell>
                <DataTableCell align='end' label='Conversions'>
                  <span className='block'>{conversions.toLocaleString()}</span>
                  <Trend
                    className='justify-end text-xs @max-2xl/data-table:justify-start [&_svg]:size-3'
                    trend={percentChange(conversions, row.previousConversions)}
                    trendIcon='arrow'
                  />
                </DataTableCell>
                <DataTableCell align='end' label='Cost per conversion'>
                  <span className='block'>{currency(cost, 2)}</span>
                  <Trend
                    className='justify-end text-xs @max-2xl/data-table:justify-start [&_svg]:size-3'
                    goodDirection='down'
                    trend={percentChange(cost, row.previousCost)}
                    trendIcon='arrow'
                  />
                </DataTableCell>
                <DataTableCell label='Conversions by day' className='w-32'>
                  <StatSparkline
                    className='h-7 w-full'
                    data={row.conversions}
                    label={`${row.name} conversions by day: from ${first} to ${last}`}
                  />
                </DataTableCell>
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
    </Card>
  )
}

export { DataTable3, exampleProps as dataTable3ExampleProps, type DataTable3Props }
