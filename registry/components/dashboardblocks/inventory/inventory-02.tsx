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
  GoalProgress,
  GoalProgressKey,
} from '@/registry/components/dashboardblocks/goals'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import {
  formatNumber,
  formatPercent,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'

interface Warehouse {
  capacity: number
  /** Units arriving in the next 7 days. */
  inbound?: number
  location: string
  name: string
  stored: number
}

interface Inventory2Props {
  /** Defaults to a sentence with the units stored and the warehouses filling up. */
  description?: string
  status?: BlockStatus
  title: string
  /** Leave out, or pass none, to show the empty state. */
  warehouses?: Warehouse[]
  /** Utilisation at which a warehouse is getting full, 0–1. */
  warnAt?: number
}

const exampleProps: Inventory2Props = {
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

type Fill = 'full' | 'warning' | 'ok'

const FILL: Record<Fill, { color: string; label: string; tone: StatusTone }> = {
  full: { color: 'var(--color-red-500)', label: 'Over capacity', tone: 'bad' },
  ok: { color: 'var(--color-chart-2)', label: 'Room to spare', tone: 'neutral' },
  warning: { color: 'var(--color-amber-500)', label: 'Nearly full', tone: 'warning' },
}

const percent = (ratio: number) => formatPercent(ratio, { maximumFractionDigits: 0 })

const Inventory2 = (props: Inventory2Props) => {
  const { status, title, warehouses = [], warnAt = 0.85 } = props
  const state = getBlockState(status, warehouses)
  const stored = warehouses.reduce((sum, warehouse) => sum + warehouse.stored, 0)
  const capacity = warehouses.reduce((sum, warehouse) => sum + warehouse.capacity, 0)
  const rows = warehouses.map((warehouse) => {
    const after = warehouse.stored + (warehouse.inbound ?? 0)
    const ratio = after / (warehouse.capacity || 1)
    const fill: Fill = ratio >= 1 ? 'full' : ratio >= warnAt ? 'warning' : 'ok'
    return { ...warehouse, after, fill, ratio }
  })
  const filling = rows.filter((row) => row.fill !== 'ok')
  const {
    description = filling.length > 0
      ? `${formatNumber(stored)} of ${formatNumber(capacity)} units stored; ${filling.map((row) => row.name).join(' and ')} ${filling.length === 1 ? 'fills' : 'fill'} up once this week’s stock arrives.`
      : `${formatNumber(stored)} of ${formatNumber(capacity)} units stored, with room for everything arriving this week.`,
  } = props

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <p className='flex flex-wrap items-baseline gap-x-2 border-t pt-4'>
          <span className='text-4xl font-light tracking-tight tabular-nums'>
            {state ? (
              <BlockStateText variant='short' />
            ) : (
              percent(stored / (capacity || 1))
            )}
          </span>
          {(state === undefined || state === 'loading') && (
            <span className='text-muted-foreground text-sm'>full across the network</span>
          )}
        </p>
        {state === 'loading' && <BlockStateRows rows={warehouses.length || 4} />}
        {!state && (
          <ul className='flex flex-col'>
            {rows.map((row) => {
              const fill = FILL[row.fill]
              return (
                <li
                  key={row.name}
                  className='flex flex-col gap-2 border-b py-3 first:pt-0'
                >
                  <div className='flex items-baseline justify-between gap-3'>
                    <span className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-medium'>{row.name}</span>
                      <span className='text-muted-foreground truncate text-xs'>
                        {row.location}
                      </span>
                    </span>
                    <span className='text-sm tabular-nums'>
                      {percent(row.stored / (row.capacity || 1))}
                    </span>
                  </div>
                  <GoalProgress
                    color={fill.color}
                    current={row.stored}
                    expected={row.capacity * warnAt}
                    projected={row.after}
                    target={row.capacity}
                  />
                  <p className='text-muted-foreground flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs tabular-nums'>
                    <span>
                      {joinDetails(
                        `${formatNumber(row.stored)} of ${formatNumber(row.capacity)} units`,
                        row.inbound
                          ? `${formatNumber(row.inbound)} arriving takes it to ${percent(row.ratio)}`
                          : 'nothing arriving',
                      )}
                    </span>
                    {row.fill !== 'ok' && (
                      <StatusLabel className='text-xs' tone={fill.tone}>
                        {fill.label}
                      </StatusLabel>
                    )}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
        {(state === undefined || state === 'loading') && (
          <div className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'>
            <GoalProgressKey label='Stored' shape='progress' />
            <GoalProgressKey label='Arriving this week' shape='projected' />
            <GoalProgressKey label={`Nearly full, ${percent(warnAt)}`} />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Inventory2,
  exampleProps as inventory2ExampleProps,
  type Inventory2Props,
  type Warehouse,
}
