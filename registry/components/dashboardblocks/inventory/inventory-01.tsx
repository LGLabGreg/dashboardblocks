'use client'

import {
  ReorderPointKey,
  StockBar,
  StockStatusBadge,
  getDaysOfCover,
  getReorderQuantity,
  getStockStatus,
} from '@/registry/components/dashboardblocks/inventory'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
  description: string
  items: StockItem[]
  /** Days of stock to hold once an order arrives. @default 30 */
  targetDays?: number
  title: string
}

const exampleProps: Inventory1Props = {
  description: 'Items at or near their reorder point, soonest to run out first',
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

const Inventory1 = (props: Inventory1Props) => {
  const { description, items, targetDays = 30, title } = props
  const sorted = [...items].sort(
    (a, b) =>
      getDaysOfCover(a.onHand, a.dailyDemand) - getDaysOfCover(b.onHand, b.dailyDemand),
  )
  const capacity =
    Math.max(...items.map((item) => Math.max(item.onHand, item.reorderPoint))) * 1.1

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ul className='flex flex-col divide-y'>
          {sorted.map((item) => {
            const status = getStockStatus(item)
            const cover = getDaysOfCover(item.onHand, item.dailyDemand)
            const reorder = getReorderQuantity({ ...item, targetDays })
            return (
              <li
                key={item.sku}
                className='flex flex-col gap-2 py-3 first:pt-0 last:pb-0'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 flex-col'>
                    <span className='truncate text-sm font-medium'>{item.name}</span>
                    <span className='text-muted-foreground font-mono text-xs'>
                      {item.sku}
                    </span>
                  </div>
                  <StockStatusBadge status={status} />
                </div>
                <StockBar
                  capacity={capacity}
                  onHand={item.onHand}
                  reorderPoint={item.reorderPoint}
                />
                <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs tabular-nums'>
                  <span>
                    <span className='text-foreground font-medium'>
                      {item.onHand.toLocaleString()}
                    </span>{' '}
                    on hand, reorder at {item.reorderPoint.toLocaleString()}
                    {item.onOrder ? `, ${item.onOrder.toLocaleString()} on order` : ''}
                  </span>
                  <span
                    className={cn(
                      cover < item.leadTimeDays &&
                        'font-medium text-red-700 dark:text-red-400',
                    )}
                  >
                    {cover === 0
                      ? 'Out now'
                      : Number.isFinite(cover)
                        ? `${Math.floor(cover)} days left`
                        : 'No demand'}
                    {cover < item.leadTimeDays && cover > 0 && (
                      <span className='sr-only'>
                        , runs out before a new order would arrive
                      </span>
                    )}
                    {reorder > 0 && (
                      <span className='text-foreground font-medium'>
                        {' '}
                        · order {reorder.toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
        <div className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs'>
          <ReorderPointKey />
          <span>Red days: runs out before an order placed today arrives.</span>
        </div>
      </CardContent>
    </Card>
  )
}

export {
  Inventory1,
  exampleProps as inventory1ExampleProps,
  type Inventory1Props,
  type StockItem,
}
