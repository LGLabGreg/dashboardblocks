'use client'

import { formatCurrency } from '@/registry/components/dashboardblocks/billing'
import {
  type StockStatus,
  stockStatusConfig,
} from '@/registry/components/dashboardblocks/inventory'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Inventory3Props {
  /** How many SKUs are in each status. */
  counts: Record<StockStatus, number>
  /** @default 'USD' */
  currency?: string
  description: string
  /** Cost of goods sold over the last 12 months, for turnover. */
  annualCogs?: number
  title: string
  /** Value of stock on hand, at cost. */
  value: number
}

const exampleProps: Inventory3Props = {
  annualCogs: 9_860_000,
  counts: { low: 64, ok: 1_182, out: 17, over: 93 },
  description: 'All SKUs across every warehouse',
  title: 'Stock health',
  value: 2_340_000,
}

const ORDER: StockStatus[] = ['ok', 'low', 'out', 'over']

const Inventory3 = (props: Inventory3Props) => {
  const { annualCogs, counts, currency = 'USD', description, title, value } = props
  const total = ORDER.reduce((sum, status) => sum + counts[status], 0) || 1
  const turnover = annualCogs !== undefined && value > 0 ? annualCogs / value : null

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>SKUs</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {total.toLocaleString()}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Stock value</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatCurrency(value, { compact: true, currency })}
            </dd>
          </div>
          {turnover !== null && (
            <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
              <dt className='text-muted-foreground text-xs'>Turnover</dt>
              <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                {turnover.toFixed(1)}×
              </dd>
              <dd className='text-muted-foreground text-xs'>
                a year, about {Math.round(365 / turnover)} days of stock
              </dd>
            </div>
          )}
        </dl>
        <div aria-hidden className='flex h-3 gap-0.5 overflow-hidden rounded-full'>
          {ORDER.map((status) =>
            counts[status] > 0 ? (
              <span
                key={status}
                className={cn('h-full', stockStatusConfig[status].bar)}
                style={{ width: `${(counts[status] / total) * 100}%` }}
              />
            ) : null,
          )}
        </div>
        <ul className='grid grid-cols-2 gap-3 @md:grid-cols-4'>
          {ORDER.map((status) => {
            const config = stockStatusConfig[status]
            return (
              <li key={status} className='flex flex-col gap-0.5'>
                <span className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                  <span
                    aria-hidden
                    className={cn('size-2.5 rounded-[3px]', config.bar)}
                  />
                  {config.label}
                </span>
                <span className='text-lg font-semibold tabular-nums'>
                  {counts[status].toLocaleString()}
                  <span className='text-muted-foreground ml-1.5 text-xs font-normal'>
                    {((counts[status] / total) * 100).toFixed(1)}%
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export { Inventory3, exampleProps as inventory3ExampleProps, type Inventory3Props }
