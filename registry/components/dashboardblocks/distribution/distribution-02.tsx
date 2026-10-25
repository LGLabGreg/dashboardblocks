'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import {
  BoxPlot,
  DistributionKey,
  getNiceTicks,
  quantile,
} from '@/registry/components/dashboardblocks/distribution'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'

interface DistributionGroup {
  count: number
  high: number
  label: string
  low: number
  median: number
  q1: number
  q3: number
}

interface Distribution2Props extends BlockStateProps {
  description: string
  formatter?: (value: number) => string
  /** Leave out, or pass none, to show the empty state. */
  groups?: DistributionGroup[]
  tickFormatter?: (value: number) => string
  whiskerLabel?: string
  title: string
  /** @default 'tickets' */
  unit?: string
}

function sample(count: number, scale: number, seed: number) {
  return Array.from({ length: count }, (_, index) => {
    const u = ((index * 2_654_435_761 + seed * 40_503) % 4_294_967_296) / 4_294_967_296
    return scale * -Math.log(1 - u * 0.985)
  }).sort((a, b) => a - b)
}

const round = (value: number) => Math.round(value * 100) / 100

const exampleProps: Distribution2Props = {
  description: 'Hours from opened to resolved for each team over the last 30 days.',
  formatter: (value) => {
    const digits = value < 10 ? 1 : 0
    return `${formatNumber(value, { maximumFractionDigits: digits, minimumFractionDigits: digits })} h`
  },
  groups: [
    { count: 386, label: 'Billing', scale: 3.1 },
    { count: 512, label: 'Account', scale: 4.6 },
    { count: 274, label: 'Onboarding', scale: 6.2 },
    { count: 628, label: 'Technical', scale: 9.8 },
  ].map(({ count, label, scale }, seed) => {
    const values = sample(count, scale, seed + 1)
    return {
      count,
      high: round(quantile(values, 0.95)),
      label,
      low: round(quantile(values, 0.05)),
      median: round(quantile(values, 0.5)),
      q1: round(quantile(values, 0.25)),
      q3: round(quantile(values, 0.75)),
    }
  }),
  tickFormatter: (value) => `${formatNumber(value)} h`,
  title: 'Resolution time by team',
  unit: 'tickets',
}

const Distribution2 = (props: Distribution2Props) => {
  const {
    description,
    formatter = (value) => formatNumber(value),
    groups = [],
    errorMessage,
    status,
    tickFormatter = formatter,
    title,
    unit = 'tickets',
    whiskerLabel = '5th–95th percentile',
  } = props
  const state = getBlockState(status, groups)
  const ticks = getNiceTicks(0, Math.max(0, ...groups.map((group) => group.high)), 5)
  const domain: [number, number] = [ticks[0], ticks[ticks.length - 1]]
  const slowest = groups.reduce<DistributionGroup | undefined>(
    (best, group) => (best && best.median >= group.median ? best : group),
    undefined,
  )
  const fastest = groups.reduce<DistributionGroup | undefined>(
    (best, group) => (best && best.median <= group.median ? best : group),
    undefined,
  )

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col gap-3 border-t pt-4'>
          {state ? (
            <BlockStateText className='text-sm' />
          ) : (
            slowest &&
            fastest &&
            slowest !== fastest && (
              <p className='text-muted-foreground text-sm'>
                <span className='text-foreground font-medium'>{slowest.label}</span> is
                slowest, with half its {unit} taking over {formatter(slowest.median)}.{' '}
                {fastest.label} is quickest, at {formatter(fastest.median)}.
              </p>
            )
          )}
          {state !== 'empty' && state !== 'error' && (
            <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
              <li className='flex items-center gap-1.5'>
                <DistributionKey shape='box' />
                Middle half
              </li>
              <li className='flex items-center gap-1.5'>
                <DistributionKey shape='median' />
                Median
              </li>
              <li className='flex items-center gap-1.5'>
                <DistributionKey shape='whisker' />
                {whiskerLabel}
              </li>
            </ul>
          )}
        </div>
        <BoxPlot
          aria-label={`${title} chart`}
          domain={domain}
          format={formatter}
          rows={groups}
          tickFormat={tickFormatter}
          ticks={ticks}
          unit={unit}
          whiskerLabel={whiskerLabel}
        />
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'label', label: 'Group' },
            { format: formatter, key: 'low', label: 'Low' },
            { format: formatter, key: 'q1', label: '25th percentile' },
            { format: formatter, key: 'median', label: 'Median' },
            { format: formatter, key: 'q3', label: '75th percentile' },
            { format: formatter, key: 'high', label: 'High' },
            { key: 'count', label: unit.charAt(0).toUpperCase() + unit.slice(1) },
          ]}
          rows={groups}
        />
      </section>
    </BlockStateProvider>
  )
}

export {
  Distribution2,
  exampleProps as distribution2ExampleProps,
  type Distribution2Props,
  type DistributionGroup,
}
