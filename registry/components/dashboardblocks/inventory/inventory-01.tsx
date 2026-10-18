'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  ReorderPointKey,
  StockBar,
  StockStatusLabel,
  getDaysOfCover,
  getReorderQuantity,
  getStockStatus,
} from '@/registry/components/dashboardblocks/inventory'
import { formatNumber, joinDetails } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface StockItem {
  dailyDemand: number
  leadTimeDays: number
  name: string
  onHand: number
  onOrder?: number
  reorderPoint: number
  sku: string
}

interface Inventory1Props {
  /** Defaults to a sentence counting the items that are out or run out before an order arrives. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  items?: StockItem[]
  status?: BlockStatus
  targetDays?: number
  title: string
}

const exampleProps: Inventory1Props = {
  items: [
    {
      dailyDemand: 14,
      leadTimeDays: 10,
      name: 'Trail runner, size 42',
      onHand: 0,
      reorderPoint: 160,
      sku: 'TR-42-BLK',
    },
    {
      dailyDemand: 22,
      leadTimeDays: 7,
      name: 'Merino crew socks, 3 pack',
      onHand: 58,
      onOrder: 120,
      reorderPoint: 180,
      sku: 'MS-3P-GRY',
    },
    {
      dailyDemand: 9,
      leadTimeDays: 14,
      name: 'Waterproof shell, M',
      onHand: 71,
      reorderPoint: 140,
      sku: 'WS-M-NVY',
    },
    {
      dailyDemand: 31,
      leadTimeDays: 5,
      name: 'Insulated bottle, 750 ml',
      onHand: 204,
      reorderPoint: 170,
      sku: 'IB-750-STL',
    },
    {
      dailyDemand: 6,
      leadTimeDays: 21,
      name: 'Daypack, 22 l',
      onHand: 118,
      reorderPoint: 130,
      sku: 'DP-22-OLV',
    },
  ],
  title: 'Low stock',
}

const summarize = (items: StockItem[]) => {
  const out = items.filter((item) => item.onHand <= 0).length
  const late = items.filter((item) => {
    const cover = getDaysOfCover(item.onHand, item.dailyDemand)
    return cover > 0 && cover < item.leadTimeDays
  }).length
  const count = `${items.length} ${items.length === 1 ? 'item' : 'items'} at or near their reorder point`
  const details = [
    out > 0 && `${out} out of stock`,
    late > 0 && `${late} running out before an order would arrive`,
  ].filter(Boolean)
  return details.length > 0 ? `${count}: ${details.join(', ')}.` : `${count}.`
}

const formatCover = (cover: number) =>
  cover === 0
    ? 'Out now'
    : Number.isFinite(cover)
      ? `${Math.floor(cover)} ${Math.floor(cover) === 1 ? 'day' : 'days'} left`
      : 'No demand'

const Inventory1 = (props: Inventory1Props) => {
  const { items = [], status, targetDays = 30, title } = props
  const state = getBlockState(status, items)
  const { description = summarize(items) } = props
  const sorted = [...items].sort(
    (a, b) =>
      getDaysOfCover(a.onHand, a.dailyDemand) - getDaysOfCover(b.onHand, b.dailyDemand),
  )
  const capacity =
    Math.max(...items.map((item) => Math.max(item.onHand, item.reorderPoint))) * 1.1

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <BlockStateRows className='border-t' rows={4} />
        {!state && (
          <ul className='flex flex-col border-t'>
            {sorted.map((item) => {
              const cover = getDaysOfCover(item.onHand, item.dailyDemand)
              const late = cover < item.leadTimeDays
              const reorder = getReorderQuantity({ ...item, targetDays })
              return (
                <li key={item.sku} className='flex flex-col gap-2 border-b py-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-medium'>{item.name}</span>
                      <span className='text-muted-foreground font-mono text-xs'>
                        {item.sku}
                      </span>
                    </div>
                    <StockStatusLabel status={getStockStatus(item)} />
                  </div>
                  <StockBar
                    capacity={capacity}
                    onHand={item.onHand}
                    reorderPoint={item.reorderPoint}
                  />
                  <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs tabular-nums'>
                    <span>
                      {joinDetails(
                        `${formatNumber(item.onHand)} on hand`,
                        `reorder at ${formatNumber(item.reorderPoint)}`,
                        item.onOrder
                          ? `${formatNumber(item.onOrder)} on order`
                          : undefined,
                      )}
                    </span>
                    <Details>
                      <span
                        className={cn(
                          late && 'font-medium text-red-700 dark:text-red-400',
                        )}
                      >
                        {formatCover(cover)}
                        {late && cover > 0 && (
                          <span className='sr-only'>
                            , runs out before a new order would arrive
                          </span>
                        )}
                      </span>
                      {reorder > 0 && (
                        <span className='text-foreground font-medium'>
                          Order {formatNumber(reorder)}
                        </span>
                      )}
                    </Details>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {state !== 'empty' && state !== 'error' && (
          <div className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
            <ReorderPointKey />
            <span>Red days: runs out before an order placed today arrives.</span>
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Inventory1,
  exampleProps as inventory1ExampleProps,
  type Inventory1Props,
  type StockItem,
}
