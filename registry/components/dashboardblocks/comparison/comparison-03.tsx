'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { DivergingBar, getDelta } from '@/registry/components/dashboardblocks/comparison'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface Segment {
  current: number
  label: string
  previous: number
}

interface Comparison3Props {
  /** Defaults to a sentence naming the biggest gain and drop. */
  description?: string
  formatter?: (value: number) => string
  /** Leave out, or pass none, to show the empty state. */
  segments?: Segment[]
  status?: BlockStatus
  title: string
}

const exampleProps: Comparison3Props = {
  formatter: (value) => formatCurrency(value),
  segments: [
    { current: 18_498, label: 'Organic search', previous: 15_240 },
    { current: 13_144, label: 'Paid search', previous: 12_880 },
    { current: 8_276, label: 'Email', previous: 6_310 },
    { current: 4_120, label: 'Social', previous: 4_980 },
    { current: 2_410, label: 'Referral', previous: 2_150 },
    { current: 1_762, label: 'Affiliates', previous: 2_330 },
  ],
  title: 'What changed',
}

const Comparison3 = (props: Comparison3Props) => {
  const {
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    segments = [],
    status,
    title,
  } = props
  const state = getBlockState(status, segments.length === 0)
  const rows = segments
    .map((segment) => ({ ...segment, ...getDelta(segment.current, segment.previous) }))
    .sort((a, b) => b.difference - a.difference)
  const max = Math.max(...rows.map((row) => Math.abs(row.difference)), 0)
  const net = rows.reduce((sum, row) => sum + row.difference, 0)
  const before = rows.reduce((sum, row) => sum + row.previous, 0)
  const signed = (value: number) => formatSigned(value, formatter)
  const gain = rows[0]
  const drop = rows[rows.length - 1]
  const sentences = [
    gain &&
      gain.difference > 0 &&
      `${gain.label} added the most, ${signed(gain.difference)}.`,
    drop &&
      drop.difference < 0 &&
      `${drop.label} fell the most, ${signed(drop.difference)}.`,
  ].filter(Boolean)
  const {
    description = sentences.length > 0 ? sentences.join(' ') : 'No segment changed.',
  } = props

  return (
    <BlockStateProvider status={status} empty={segments.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <span className='text-muted-foreground text-sm'>Net change</span>
          <KPIValue value={net} format={signed} />
          {(state || before !== 0) && (
            <KPIChange
              comparison='before'
              format={formatter}
              previous={before}
              value={before + net}
            />
          )}
        </div>
        {state === 'loading' && <BlockStateRows rows={5} />}
        {!state && (
          <ul className='flex flex-col'>
            {rows.map((row) => (
              <li
                key={row.label}
                className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 border-b py-2.5 last:border-b-0 @md:grid-cols-[8rem_minmax(0,1fr)_9rem]'
              >
                <span className='truncate text-sm'>{row.label}</span>
                <span className='text-right text-sm whitespace-nowrap tabular-nums @md:order-last'>
                  <span
                    className={cn(
                      'font-medium',
                      row.difference > 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : row.difference < 0
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-muted-foreground',
                    )}
                  >
                    {signed(row.difference)}
                  </span>{' '}
                  <span className='text-muted-foreground text-xs'>
                    {formatSigned(row.percent, (value) => formatPercent(value / 100))}
                  </span>
                </span>
                <DivergingBar
                  className='col-span-2 @md:col-span-1'
                  color={
                    row.difference < 0
                      ? 'color-mix(in oklab, var(--color-chart-2) 30%, transparent)'
                      : 'var(--color-chart-2)'
                  }
                  max={max}
                  value={row.difference}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Comparison3, exampleProps as comparison3ExampleProps, type Comparison3Props }
