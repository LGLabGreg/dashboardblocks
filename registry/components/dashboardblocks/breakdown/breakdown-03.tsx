'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  BREAKDOWN_OTHER_COLOR,
  BreakdownKey,
  type BreakdownSegment,
  formatShare,
  getTotal,
} from '@/registry/components/dashboardblocks/breakdown'
import {
  ChartPlaceholder,
  ChartTooltipFrame,
  ChartTooltipItem,
} from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber, joinDetails } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'
import { Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'

import { cn } from '@/lib/utils'

interface Breakdown3Props extends BlockStateProps {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  segments?: BreakdownSegment[]
  title: string
}

const exampleProps: Breakdown3Props = {
  description: 'Active workspaces on each plan.',
  segments: [
    { color: 'var(--color-chart-2)', label: 'Free', value: 5_840 },
    { color: 'var(--color-chart-3)', label: 'Pro', value: 2_310 },
    { color: 'var(--color-chart-4)', label: 'Team', value: 1_120 },
    { color: BREAKDOWN_OTHER_COLOR, label: 'Enterprise', value: 430 },
  ],
  title: 'Plan distribution',
}

const SIDE = 10
const CELLS = SIDE * SIDE
const GRID_PX = 176
const CELL_PX = GRID_PX / SIDE
const GAP_PX = 2

interface Square {
  segment: number
  x: number
  y: number
}

function toCells(segments: BreakdownSegment[]) {
  const total = getTotal(segments)
  if (total === 0) return segments.map(() => 0)
  const exact = segments.map((segment) => (Math.max(0, segment.value) / total) * CELLS)
  const counts = exact.map(Math.floor)
  let remaining = CELLS - counts.reduce((sum, count) => sum + count, 0)
  const order = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder)
  for (const { index } of order) {
    if (remaining <= 0) break
    counts[index] += 1
    remaining -= 1
  }
  return counts
}

const Breakdown3 = (props: Breakdown3Props) => {
  const { description, segments = [], errorMessage, status, title } = props
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const state = getBlockState(status, segments)
  const total = getTotal(segments)
  const squares: Square[] = toCells(segments)
    .flatMap((count, segment) => Array.from({ length: count }, () => segment))
    .map((segment, cell) => ({ segment, x: cell % SIDE, y: Math.floor(cell / SIDE) }))

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col items-center gap-6 border-t pt-4 @sm:flex-row @sm:items-start'>
          {state ? (
            <ChartPlaceholder className='w-44 shrink-0' height={GRID_PX} />
          ) : (
            <div
              role='img'
              aria-label={`${title}: ${segments
                .map((segment) => `${segment.label} ${formatShare(segment.value, total)}`)
                .join(', ')}`}
              className='shrink-0'
              onPointerLeave={() => setActiveIndex(null)}
            >
              <ScatterChart
                accessibilityLayer={false}
                height={GRID_PX}
                margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
                width={GRID_PX}
              >
                <XAxis dataKey='x' domain={[-0.5, SIDE - 0.5]} hide type='number' />
                <YAxis
                  dataKey='y'
                  domain={[-0.5, SIDE - 0.5]}
                  hide
                  reversed
                  type='number'
                />
                <Tooltip
                  content={({ active: shown, payload }) => {
                    const square = payload?.[0]?.payload as Square | undefined
                    const segment = square ? segments[square.segment] : undefined
                    if (!shown || !segment) return null
                    return (
                      <ChartTooltipFrame>
                        <span className='font-medium'>{segment.label}</span>
                        <ChartTooltipItem
                          color={segment.color}
                          value={joinDetails(
                            formatNumber(segment.value),
                            formatShare(segment.value, total),
                          )}
                        />
                      </ChartTooltipFrame>
                    )
                  }}
                  cursor={false}
                />
                {segments.map((segment, index) => (
                  <Scatter
                    key={segment.label}
                    data={squares.filter((square) => square.segment === index)}
                    fill={segment.color}
                    onMouseEnter={() => setActiveIndex(index)}
                    shape={({ cx = 0, cy = 0 }: { cx?: number; cy?: number }) => (
                      <g>
                        <rect
                          x={cx - CELL_PX / 2}
                          y={cy - CELL_PX / 2}
                          width={CELL_PX}
                          height={CELL_PX}
                          fill='transparent'
                        />
                        <rect
                          x={cx - CELL_PX / 2 + GAP_PX / 2}
                          y={cy - CELL_PX / 2 + GAP_PX / 2}
                          width={CELL_PX - GAP_PX}
                          height={CELL_PX - GAP_PX}
                          rx={3}
                          fill={segment.color}
                          opacity={
                            activeIndex === null || activeIndex === index ? 1 : 0.35
                          }
                        />
                      </g>
                    )}
                  />
                ))}
              </ScatterChart>
            </div>
          )}
          <div className='flex w-full min-w-0 flex-col gap-3'>
            <div className='flex flex-col gap-1'>
              <KPIValue value={total} format={(value) => formatNumber(value)} />
              <BlockReady className='text-sm'>
                <p className='text-muted-foreground text-sm'>
                  Each square is 1% of the total.
                </p>
              </BlockReady>
            </div>
            {state === 'loading' && <BlockStateRows rows={4} />}
            {!state && (
              <ul className='flex flex-col text-sm'>
                {segments.map((segment, index) => (
                  <li
                    key={segment.label}
                    className={cn(
                      'flex items-center gap-2 border-b py-2.5 transition-colors last:border-b-0',
                      activeIndex === index && 'bg-muted/50',
                    )}
                  >
                    <BreakdownKey color={segment.color} />
                    <span className='min-w-0 flex-1 truncate'>{segment.label}</span>
                    <span className='tabular-nums'>{formatNumber(segment.value)}</span>
                    <span className='text-muted-foreground w-10 text-right tabular-nums'>
                      {formatShare(segment.value, total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Breakdown3, exampleProps as breakdown3ExampleProps, type Breakdown3Props }
