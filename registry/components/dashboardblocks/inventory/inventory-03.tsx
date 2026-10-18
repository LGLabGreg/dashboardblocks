'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  BreakdownBar,
  BreakdownKey,
  formatShare,
} from '@/registry/components/dashboardblocks/breakdown'
import { ChartPlaceholder } from '@/registry/components/dashboardblocks/chart'
import {
  type StockStatus,
  stockStatusConfig,
} from '@/registry/components/dashboardblocks/inventory'
import { formatCurrency, formatNumber } from '@/registry/lib/dashboardblocks/format'

interface Inventory3Props {
  annualCogs?: number
  /** Leave out, with `value`, to show the empty state. */
  counts?: Record<StockStatus, number>
  /** @default 'USD' */
  currency?: string
  /** Defaults to a sentence counting the SKUs that need ordering. */
  description?: string
  status?: BlockStatus
  title: string
  /** Leave out, with `counts`, to show the empty state. */
  value?: number
}

const exampleProps: Inventory3Props = {
  annualCogs: 9_860_000,
  counts: { low: 64, ok: 1_182, out: 17, over: 93 },
  title: 'Stock health',
  value: 2_340_000,
}

const ORDER: StockStatus[] = ['ok', 'low', 'out', 'over']

const noCounts: Record<StockStatus, number> = { low: 0, ok: 0, out: 0, over: 0 }

const Inventory3 = (props: Inventory3Props) => {
  const { annualCogs, counts = noCounts, currency = 'USD', status, title, value } = props
  const state = getBlockState(status, value === undefined)
  const total = ORDER.reduce((sum, stock) => sum + counts[stock], 0)
  const reorder = counts.low + counts.out
  const turnover =
    annualCogs !== undefined && value !== undefined && value > 0
      ? annualCogs / value
      : null
  const {
    description = `${formatNumber(total)} SKUs across every warehouse; ${formatNumber(reorder)} of them are low or out and need ordering.`,
  } = props

  return (
    <BlockStateProvider status={status} empty={value === undefined}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <p className='text-4xl font-light tracking-tight tabular-nums'>
            {state || value === undefined ? (
              <BlockStateText variant='short' />
            ) : (
              <>
                {formatCurrency(value, { compact: true, currency })}
                <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                  in stock
                </span>
              </>
            )}
          </p>
          <BlockReady className='text-sm'>
            {turnover !== null && (
              <p className='text-muted-foreground text-sm'>
                Turns over{' '}
                <span className='text-foreground font-medium tabular-nums'>
                  {formatNumber(turnover)}
                </span>{' '}
                times a year, about {Math.round(365 / turnover)} days of stock.
              </p>
            )}
          </BlockReady>
        </div>
        {state === 'loading' && (
          <>
            <ChartPlaceholder className='rounded-full' height={12} />
            <BlockStateRows rows={4} />
          </>
        )}
        {!state && (
          <>
            <BreakdownBar
              segments={ORDER.map((stock) => ({
                color: stockStatusConfig[stock].color,
                label: stockStatusConfig[stock].label,
                value: counts[stock],
              }))}
            />
            <table className='w-full text-sm'>
              <caption className='sr-only'>{`${title}: ${description}`}</caption>
              <thead className='sr-only'>
                <tr>
                  <th scope='col'>Status</th>
                  <th scope='col'>SKUs</th>
                  <th scope='col'>Share</th>
                </tr>
              </thead>
              <tbody>
                {ORDER.map((stock) => (
                  <tr key={stock} className='border-b last:border-b-0'>
                    <th scope='row' className='py-2.5 pr-3 text-left font-normal'>
                      <span className='flex items-center gap-2'>
                        <BreakdownKey color={stockStatusConfig[stock].color} />
                        {stockStatusConfig[stock].label}
                      </span>
                    </th>
                    <td className='py-2.5 pr-3 text-right tabular-nums'>
                      {formatNumber(counts[stock])}
                    </td>
                    <td className='text-muted-foreground w-12 py-2.5 text-right tabular-nums'>
                      {formatShare(counts[stock], total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Inventory3, exampleProps as inventory3ExampleProps, type Inventory3Props }
