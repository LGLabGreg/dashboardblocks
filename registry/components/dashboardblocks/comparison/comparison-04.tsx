'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Dumbbell,
  DumbbellLegend,
  getDelta,
} from '@/registry/components/dashboardblocks/comparison'
import { KPIChange } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'

interface BeforeAfterRow {
  after: number
  before: number
  label: string
}

interface Comparison4Props {
  afterLabel: string
  beforeLabel: string
  /** Defaults to a sentence saying how many rows improved and which most. */
  description?: string
  formatter?: (value: number) => string
  /** Use `down` when a decrease is an improvement, such as load time. */
  goodDirection?: 'up' | 'down'
  /** Leave out, or pass none, to show the empty state. */
  rows?: BeforeAfterRow[]
  status?: BlockStatus
  title: string
  /** Names what each row measures, under the title. */
  unitLabel?: string
}

const exampleProps: Comparison4Props = {
  afterLabel: 'After, Sep 15–24',
  beforeLabel: 'Before, Sep 1–10',
  formatter: (value) => `${formatNumber(value, { minimumFractionDigits: 1 })} s`,
  goodDirection: 'down',
  rows: [
    { after: 1.6, before: 2.9, label: 'Home' },
    { after: 2.1, before: 3.8, label: 'Product' },
    { after: 1.9, before: 2.6, label: 'Search' },
    { after: 2.4, before: 2.7, label: 'Checkout' },
    { after: 1.5, before: 1.4, label: 'Account' },
  ],
  title: 'Page speed after the CDN migration',
  unitLabel: 'p75 largest contentful paint',
}

const Comparison4 = (props: Comparison4Props) => {
  const {
    afterLabel,
    beforeLabel,
    formatter = (value) => formatNumber(value),
    goodDirection = 'up',
    rows = [],
    status,
    title,
    unitLabel,
  } = props
  const max = Math.max(...rows.flatMap((row) => [row.before, row.after]), 0) * 1.1
  const isGood = (row: BeforeAfterRow) =>
    goodDirection === 'down' ? row.after < row.before : row.after > row.before
  const improved = rows.filter(isGood)
  const best = improved.reduce<BeforeAfterRow | undefined>(
    (top, row) =>
      !top ||
      Math.abs(getDelta(row.after, row.before).percent) >
        Math.abs(getDelta(top.after, top.before).percent)
        ? row
        : top,
    undefined,
  )
  const {
    description = `${improved.length} of ${rows.length} improved${
      best
        ? `, ${best.label} the most, from ${formatter(best.before)} to ${formatter(best.after)}`
        : ''
    }.`,
  } = props

  return (
    <BlockStateProvider state={getBlockState(status, rows)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {unitLabel && `${unitLabel.charAt(0).toUpperCase()}${unitLabel.slice(1)}. `}
            <BlockReady>{description}</BlockReady>
          </p>
        </header>
        <div className='flex flex-col border-t pt-3'>
          <DumbbellLegend afterLabel={afterLabel} beforeLabel={beforeLabel} />
          <BlockStateRows className='mt-1' rows={4} />
          <ul className='mt-1 flex flex-col empty:hidden'>
            {!status &&
              rows.map((row) => {
                const good = isGood(row)
                return (
                  <li
                    key={row.label}
                    className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b py-2.5 last:border-b-0 @md:grid-cols-[6rem_minmax(0,1fr)_12rem]'
                  >
                    <span className='truncate text-sm font-medium'>{row.label}</span>
                    <span className='flex items-center justify-end gap-2 text-sm whitespace-nowrap tabular-nums @md:order-last'>
                      <span className='text-muted-foreground'>
                        <span className='sr-only'>{beforeLabel}: </span>
                        {formatter(row.before)}
                      </span>
                      <span aria-hidden className='text-muted-foreground'>
                        →
                      </span>
                      <span className='font-medium'>
                        <span className='sr-only'>{afterLabel}: </span>
                        {formatter(row.after)}
                      </span>
                      <KPIChange
                        className='w-20 text-right text-xs'
                        comparison={beforeLabel}
                        format={formatter}
                        goodDirection={goodDirection}
                        inline
                        previous={row.before}
                        value={row.after}
                        variant='short'
                      />
                    </span>
                    <Dumbbell
                      after={row.after}
                      before={row.before}
                      className='col-span-2 @md:col-span-1'
                      color={
                        good ? 'var(--color-chart-2)' : 'var(--color-muted-foreground)'
                      }
                      max={max}
                    />
                  </li>
                )
              })}
          </ul>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Comparison4, exampleProps as comparison4ExampleProps, type Comparison4Props }
