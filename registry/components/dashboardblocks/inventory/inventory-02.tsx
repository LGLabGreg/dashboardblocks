'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Warehouse {
  /** Units it can hold. */
  capacity: number
  /** Units arriving in the next 7 days. */
  inbound?: number
  location: string
  name: string
  /** Units held now. */
  stored: number
}

interface Inventory2Props {
  description: string
  title: string
  warehouses: Warehouse[]
  /** Utilisation at which a warehouse is getting full, 0–1. @default 0.85 */
  warnAt?: number
}

const exampleProps: Inventory2Props = {
  description: 'Units stored against capacity, with what arrives this week',
  title: 'Warehouse capacity',
  warehouses: [
    {
      capacity: 48_000,
      inbound: 6_200,
      location: 'Rotterdam',
      name: 'EU Central',
      stored: 41_300,
    },
    {
      capacity: 36_000,
      inbound: 1_800,
      location: 'Reno, NV',
      name: 'US West',
      stored: 22_450,
    },
    {
      capacity: 30_000,
      inbound: 4_900,
      location: 'Columbus, OH',
      name: 'US East',
      stored: 27_100,
    },
    {
      capacity: 12_000,
      inbound: 300,
      location: 'Melbourne',
      name: 'APAC',
      stored: 5_880,
    },
  ],
}

const Inventory2 = (props: Inventory2Props) => {
  const { description, title, warehouses, warnAt = 0.85 } = props
  const stored = warehouses.reduce((sum, warehouse) => sum + warehouse.stored, 0)
  const capacity = warehouses.reduce((sum, warehouse) => sum + warehouse.capacity, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex items-baseline gap-2'>
          <span className='text-3xl font-semibold tracking-tight tabular-nums'>
            {Math.round((stored / (capacity || 1)) * 100)}%
          </span>
          <span className='text-muted-foreground text-sm tabular-nums'>
            full across the network, {stored.toLocaleString()} of{' '}
            {capacity.toLocaleString()} units
          </span>
        </div>
        <ul className='flex flex-col gap-4'>
          {warehouses.map((warehouse) => {
            const used = warehouse.stored / (warehouse.capacity || 1)
            const after =
              (warehouse.stored + (warehouse.inbound ?? 0)) / (warehouse.capacity || 1)
            const full = after >= 1
            const warning = !full && after >= warnAt
            return (
              <li key={warehouse.name} className='flex flex-col gap-1.5'>
                <div className='flex items-baseline justify-between gap-3'>
                  <span className='text-sm'>
                    <span className='font-medium'>{warehouse.name}</span>{' '}
                    <span className='text-muted-foreground text-xs'>
                      {warehouse.location}
                    </span>
                  </span>
                  <span className='text-sm font-medium tabular-nums'>
                    {Math.round(used * 100)}%
                  </span>
                </div>
                <div
                  aria-hidden
                  className='bg-muted flex h-2.5 overflow-hidden rounded-full'
                >
                  <span
                    className='bg-primary h-full'
                    style={{ width: `${Math.min(1, used) * 100}%` }}
                  />
                  {warehouse.inbound ? (
                    <span
                      className={cn(
                        'h-full',
                        full ? 'bg-red-500' : warning ? 'bg-amber-500' : 'bg-primary/35',
                      )}
                      style={{
                        width: `${Math.max(0, Math.min(1, after) - used) * 100}%`,
                      }}
                    />
                  ) : null}
                </div>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    full
                      ? 'font-medium text-red-700 dark:text-red-400'
                      : warning
                        ? 'font-medium text-amber-700 dark:text-amber-400'
                        : 'text-muted-foreground',
                  )}
                >
                  {warehouse.inbound
                    ? `+${warehouse.inbound.toLocaleString()} inbound, ${Math.round(after * 100)}% after`
                    : 'Nothing inbound'}
                  {full ? ': over capacity' : warning ? ': nearly full' : ''}
                </span>
              </li>
            )
          })}
        </ul>
        <ul
          aria-hidden
          className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs'
        >
          <li className='flex items-center gap-1.5'>
            <span className='bg-primary size-2.5 rounded-[3px]' />
            Stored
          </li>
          <li className='flex items-center gap-1.5'>
            <span className='bg-primary/35 size-2.5 rounded-[3px]' />
            Inbound
          </li>
          <li className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-[3px] bg-amber-500' />
            Inbound, nearly full
          </li>
          <li className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-[3px] bg-red-500' />
            Inbound, over capacity
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  Inventory2,
  exampleProps as inventory2ExampleProps,
  type Inventory2Props,
  type Warehouse,
}
