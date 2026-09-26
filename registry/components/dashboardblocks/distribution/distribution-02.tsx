'use client'

import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import {
  BoxPlot,
  DistributionAxis,
  DistributionKey,
  getNiceTicks,
  quantile,
} from '@/registry/components/dashboardblocks/distribution'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface DistributionGroup {
  /** How many values the summary covers. */
  count: number
  /** Upper whisker, e.g. the 95th percentile. */
  high: number
  label: string
  /** Lower whisker, e.g. the 5th percentile. */
  low: number
  median: number
  q1: number
  q3: number
}

interface Distribution2Props {
  description: string
  formatter?: (value: number) => string
  groups: DistributionGroup[]
  /** Formats the axis ticks, which are round numbers. Defaults to `formatter`. */
  tickFormatter?: (value: number) => string
  /** Names the whiskers. @default '5th–95th percentile' */
  whiskerLabel?: string
  title: string
  /** @default 'tickets' */
  unit?: string
}

/**
 * Deterministic, right-skewed sample values, like resolution times. Integer
 * hashing, not Math.sin, so the server and the browser get the same numbers.
 */
function sample(count: number, scale: number, seed: number) {
  return Array.from({ length: count }, (_, index) => {
    const u = ((index * 2_654_435_761 + seed * 40_503) % 4_294_967_296) / 4_294_967_296
    return scale * -Math.log(1 - u * 0.985)
  }).sort((a, b) => a - b)
}

const round = (value: number) => Math.round(value * 100) / 100

const exampleProps: Distribution2Props = {
  description: 'Hours from opened to resolved, last 30 days',
  formatter: (value) => `${value.toFixed(value < 10 ? 1 : 0)} h`,
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
  tickFormatter: (value) => `${value} h`,
  title: 'Resolution time by team',
  unit: 'tickets',
}

const Distribution2 = (props: Distribution2Props) => {
  const {
    description,
    formatter = (value) => value.toLocaleString(),
    groups,
    tickFormatter = formatter,
    title,
    unit = 'tickets',
    whiskerLabel = '5th–95th percentile',
  } = props
  const [active, setActive] = useState<number | null>(null)

  const ticks = getNiceTicks(0, Math.max(0, ...groups.map((group) => group.high)), 5)
  const domain: [number, number] = [ticks[0], ticks[ticks.length - 1]]
  const slowest = groups.reduce<DistributionGroup | undefined>(
    (best, group) => (best && best.median >= group.median ? best : group),
    undefined,
  )
  const describe = (group: DistributionGroup) =>
    `${group.label}: median ${formatter(group.median)}, middle half ${formatter(group.q1)}–${formatter(group.q3)}, ${whiskerLabel} ${formatter(group.low)}–${formatter(group.high)}, ${group.count.toLocaleString()} ${unit}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
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
        <div
          className='grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3'
          onPointerLeave={() => setActive(null)}
        >
          <span className='text-muted-foreground col-start-3 pb-1 text-right text-[11px]'>
            Median
          </span>
          {groups.map((group, index) => (
            <div
              key={group.label}
              aria-hidden
              className={cn(
                'col-span-full grid grid-cols-subgrid items-center rounded-md py-1.5',
                active === index && 'bg-muted/60',
              )}
              onPointerEnter={() => setActive(index)}
              onPointerDown={() => setActive(index)}
            >
              <span className='text-muted-foreground pl-1 text-sm whitespace-nowrap'>
                {group.label}
              </span>
              <BoxPlot
                domain={domain}
                high={group.high}
                low={group.low}
                median={group.median}
                q1={group.q1}
                q3={group.q3}
              />
              <span className='pr-1 text-right text-sm font-medium tabular-nums'>
                {formatter(group.median)}
              </span>
            </div>
          ))}
          <DistributionAxis
            className='col-start-2 mt-1'
            domain={domain}
            format={tickFormatter}
            ticks={ticks}
          />
        </div>
        <p className='text-muted-foreground min-h-5 text-sm'>
          {active !== null ? (
            <span className='text-foreground'>{describe(groups[active])}</span>
          ) : slowest ? (
            `${slowest.label} is slowest, with half its ${unit} taking over ${formatter(slowest.median)}`
          ) : null}
        </p>
        <ChartPanelTable
          caption={`${title}: ${description}.`}
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
      </CardContent>
    </Card>
  )
}

export {
  Distribution2,
  exampleProps as distribution2ExampleProps,
  type Distribution2Props,
  type DistributionGroup,
}
