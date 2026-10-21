'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  BreakdownBar,
  BreakdownKey,
  formatShare,
} from '@/registry/components/dashboardblocks/breakdown'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowHead,
} from '@/registry/components/dashboardblocks/table'
import { formatCurrency, formatNumber } from '@/registry/lib/dashboardblocks/format'

interface Region {
  color: string
  current: number
  label: string
  previous: number
}

interface Geo4Props {
  /** Follows the previous value in a sentence, such as `in Q2`. */
  comparison: string
  /** Defaults to a sentence about the fastest-growing region. */
  description?: string
  formatter?: (value: number) => string
  /** Leave out, or pass none, to show the empty state. */
  regions?: Region[]
  status?: BlockStatus
  title: string
}

const currency = (value: number) =>
  formatCurrency(value, { compact: true, maximumFractionDigits: 2 })

const exampleProps: Geo4Props = {
  comparison: 'in Q2',
  formatter: currency,
  regions: [
    {
      color: 'var(--color-chart-2)',
      current: 1_284_600,
      label: 'North America',
      previous: 1_196_300,
    },
    {
      color: 'var(--color-chart-3)',
      current: 912_400,
      label: 'Europe',
      previous: 861_900,
    },
    {
      color: 'var(--color-chart-4)',
      current: 538_700,
      label: 'Asia Pacific',
      previous: 462_100,
    },
    {
      color: 'var(--color-chart-5)',
      current: 186_300,
      label: 'Latin America',
      previous: 191_800,
    },
    {
      color: 'var(--color-chart-1)',
      current: 97_900,
      label: 'Middle East & Africa',
      previous: 84_600,
    },
  ],
  title: 'Revenue by region',
}

const Geo4 = (props: Geo4Props) => {
  const {
    comparison,
    formatter = (value: number) => formatNumber(value),
    regions = [],
    status,
    title,
  } = props
  const state = getBlockState(status, regions)
  const total = regions.reduce((sum, region) => sum + region.current, 0)
  const previousTotal = regions.reduce((sum, region) => sum + region.previous, 0)
  const growth = (region: Region) =>
    region.previous > 0 ? region.current / region.previous - 1 : 0
  const fastest = regions.reduce<Region | null>(
    (best, region) => (best === null || growth(region) > growth(best) ? region : best),
    null,
  )
  const {
    description = fastest
      ? `${fastest.label} grew fastest, by ${formatShare(fastest.current - fastest.previous, fastest.previous, 1)}.`
      : undefined,
  } = props

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            {description && (
              <p className='text-muted-foreground text-sm'>{description}</p>
            )}
          </BlockReady>
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <KPIValue value={total} format={formatter} />
          <KPIChange
            comparison={comparison}
            format={formatter}
            previous={previousTotal}
            value={total}
          />
        </div>
        <BreakdownBar
          segments={regions.map((region) => ({
            color: region.color,
            label: region.label,
            value: region.current,
          }))}
        />
        {state === 'loading' && <BlockStateRows rows={5} />}
        {!state && (
          <DataTable
            density='compact'
            caption={`${title}, with the change on the amount ${comparison}`}
          >
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Region</DataTableHead>
                <DataTableHead align='end'>Revenue</DataTableHead>
                <DataTableHead align='end' className='w-24'>
                  Change
                </DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {regions.map((region) => (
                <DataTableRow key={region.label}>
                  <DataTableRowHead>
                    <span className='flex items-start gap-2'>
                      <BreakdownKey color={region.color} className='mt-1' />
                      <span className='flex min-w-0 flex-col @md:flex-row @md:gap-2'>
                        <span>{region.label}</span>
                        <span className='text-muted-foreground text-xs tabular-nums @md:text-sm'>
                          {formatShare(region.current, total, 1)}
                          <span className='sr-only'> of revenue</span>
                        </span>
                      </span>
                    </span>
                  </DataTableRowHead>
                  <DataTableCell align='end' className='align-top font-medium'>
                    {formatter(region.current)}
                  </DataTableCell>
                  <DataTableCell align='end' className='align-top'>
                    <KPIChange
                      inline
                      className='text-xs'
                      comparison={comparison}
                      format={formatter}
                      previous={region.previous}
                      value={region.current}
                      variant='short'
                    />
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Geo4, exampleProps as geo4ExampleProps, type Geo4Props }
