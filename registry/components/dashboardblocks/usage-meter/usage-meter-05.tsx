'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { SegmentedProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import {
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusLabel,
  formatUsage,
  getUsageStatus,
} from '@/registry/components/dashboardblocks/usage-meter'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

interface StorageCategory {
  label: string
  value: number
}

interface UsageMeter5Props {
  /** Leave out, or pass none, to show the empty state. */
  categories?: StorageCategory[]
  limit: number
  status?: BlockStatus
  title: string
  unit: string
}

const exampleProps: UsageMeter5Props = {
  categories: [
    { label: 'Images', value: 28.6 },
    { label: 'Videos', value: 18.2 },
    { label: 'Documents', value: 12.4 },
    { label: 'Other', value: 8.3 },
  ],
  limit: 100,
  title: 'Storage',
  unit: 'GB',
}

const colors = [
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-1)',
]

const UsageMeter5 = (props: UsageMeter5Props) => {
  const { categories = [], limit, status: blockStatus, title, unit } = props
  const state = getBlockState(blockStatus, categories.length === 0)
  const used = categories.reduce((sum, category) => sum + category.value, 0)
  const free = Math.max(0, limit - used)
  const status = getUsageStatus(used, limit)
  const largest = categories.reduce<StorageCategory | undefined>(
    (top, category) => (top && top.value >= category.value ? top : category),
    undefined,
  )
  const share = (value: number) =>
    formatPercent(limit > 0 ? value / limit : 0, { maximumFractionDigits: 0 })
  const rows = [
    ...categories.map((category, index) => ({
      color: colors[index % colors.length],
      ...category,
    })),
    { color: 'var(--color-muted)', label: 'Free', value: free },
  ]

  return (
    <BlockStateProvider status={blockStatus} empty={categories.length === 0}>
      <section className='@container flex flex-col gap-1 border-t pt-3'>
        <header className='flex items-baseline justify-between gap-3'>
          <p className='text-muted-foreground text-sm'>{title}</p>
          {status !== 'ok' && <UsageStatusLabel status={status} />}
        </header>
        <div className='flex flex-wrap items-baseline gap-x-2'>
          <UsageMeterValue>{formatUsage(used, unit)}</UsageMeterValue>
          <UsageMeterLimit>of {formatUsage(limit, unit)}</UsageMeterLimit>
        </div>
        {state === 'loading' ? (
          <BlockStateText className='text-sm' />
        ) : (
          !state &&
          largest && (
            <p className='text-muted-foreground text-sm'>
              {largest.label} use the most space, and{' '}
              <span className='tabular-nums'>{formatUsage(free, unit)}</span> is free.
            </p>
          )
        )}
        <div aria-hidden className='mt-3'>
          <SegmentedProgressBar
            className='h-2.5 gap-0.5 bg-transparent'
            segments={rows.map((row) => ({
              color: row.color,
              label: row.label,
              value: row.value,
            }))}
            total={Math.max(limit, used)}
          />
        </div>
        {state === 'loading' && <BlockStateRows className='mt-2' rows={5} />}
        {!state && (
          <ul className='mt-2 flex flex-col text-sm'>
            {rows.map((row) => (
              <li
                key={row.label}
                className='flex items-center gap-2 border-b py-2 last:border-b-0'
              >
                <span
                  aria-hidden
                  className='ring-foreground/10 size-2.5 shrink-0 rounded-[3px] ring-1 ring-inset'
                  style={{ backgroundColor: row.color }}
                />
                <span className='text-muted-foreground truncate'>{row.label}</span>
                <span className='ml-auto font-medium tabular-nums'>
                  {formatUsage(row.value, unit)}
                </span>
                <span className='text-muted-foreground w-10 text-right text-xs tabular-nums'>
                  {share(row.value)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  UsageMeter5,
  exampleProps as usageMeter5ExampleProps,
  type StorageCategory,
  type UsageMeter5Props,
}
