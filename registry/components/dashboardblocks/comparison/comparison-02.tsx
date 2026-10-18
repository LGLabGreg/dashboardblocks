'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  IntervalBar,
  compareProportions,
} from '@/registry/components/dashboardblocks/comparison'
import { Details } from '@/registry/components/dashboardblocks/details'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatNumber,
  formatPercent,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface Variant {
  conversions: number
  label: string
  /** The short name the test uses, such as `A`. */
  name: string
  visitors: number
}

interface Comparison2Props {
  /** Leave out, with `variant`, to show the empty state. */
  control?: Variant
  description: string
  metric: string
  status?: BlockStatus
  title: string
  variant?: Variant
}

const exampleProps: Comparison2Props = {
  control: {
    conversions: 1_208,
    label: 'Current checkout',
    name: 'A',
    visitors: 24_150,
  },
  description: 'Day 14 of a 50/50 split test',
  metric: 'Checkout conversion',
  title: 'One-page checkout test',
  variant: {
    conversions: 1_342,
    label: 'One-page checkout',
    name: 'B',
    visitors: 24_080,
  },
}

const percent = (value: number, digits = 1) =>
  formatSigned(value, (magnitude) =>
    formatPercent(magnitude, {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }),
  )

const rate = (value: number) =>
  formatPercent(value, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

function verdict(result: ReturnType<typeof compareProportions>, variant: Variant) {
  const { name } = variant
  if (!result.significant) {
    return `The interval still crosses zero, so ${name}'s lift could be chance. Keep the test running.`
  }
  return result.lift > 0
    ? `The whole interval is above zero, so ${name} is very likely better.`
    : `The whole interval is below zero, so ${name} is very likely worse.`
}

const Comparison2 = (props: Comparison2Props) => {
  const { control, description, metric, status, title, variant } = props
  const state = getBlockState(status, control && variant)

  if (state || !control || !variant) {
    return (
      <BlockStateProvider state={state}>
        <section className='@container flex flex-col gap-4'>
          <header className='flex flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </header>
          <div className='flex flex-col gap-1 border-t pt-4'>
            <span className='text-muted-foreground text-sm'>{metric}, B against A</span>
            <KPIValue />
            {state === 'loading' && <BlockStateText className='text-sm' />}
          </div>
          {state === 'loading' && <BlockStateRows rows={2} />}
        </section>
      </BlockStateProvider>
    )
  }

  const result = compareProportions(control, variant)
  const extent = Math.max(Math.abs(result.liftLow), Math.abs(result.liftHigh), 0.05) * 1.2

  return (
    <section className='@container flex flex-col gap-4'>
      <header className='flex flex-col gap-0.5'>
        <h2 className='font-semibold tracking-tight'>{title}</h2>
        <p className='text-muted-foreground text-sm'>
          <Details>
            {description}
            <span
              className={cn(
                'font-medium',
                result.significant
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-foreground',
              )}
            >
              {result.significant ? 'Significant' : 'Not significant yet'}
            </span>
          </Details>
        </p>
      </header>
      <div className='flex flex-col gap-1 border-t pt-4'>
        <span className='text-muted-foreground text-sm'>{metric}, B against A</span>
        <span className='text-4xl font-light tracking-tight tabular-nums'>
          {percent(result.lift)}
          <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
            lift
          </span>
        </span>
        <span className='text-muted-foreground text-sm'>
          95% confidence interval{' '}
          <span className='text-foreground tabular-nums'>
            {percent(result.liftLow)} to {percent(result.liftHigh)}
          </span>
        </span>
      </div>
      <div className='flex flex-col gap-1.5'>
        <IntervalBar
          estimate={result.lift}
          extent={extent}
          high={result.liftHigh}
          low={result.liftLow}
        />
        <div
          aria-hidden
          className='text-muted-foreground flex justify-between text-xs tabular-nums'
        >
          <span>{percent(-extent, 0)}</span>
          <span>0%</span>
          <span>{percent(extent, 0)}</span>
        </div>
      </div>
      <p className='text-muted-foreground text-sm'>{verdict(result, variant)}</p>
      <table className='w-full text-sm'>
        <caption className='sr-only'>Results by variant</caption>
        <thead>
          <tr className='text-muted-foreground border-b text-xs'>
            <th scope='col' className='py-2 text-left font-normal'>
              Variant
            </th>
            <th scope='col' className='hidden py-2 text-right font-normal @sm:table-cell'>
              Visitors
            </th>
            <th scope='col' className='py-2 text-right font-normal'>
              Conversions
            </th>
            <th scope='col' className='py-2 text-right font-normal'>
              Rate
            </th>
          </tr>
        </thead>
        <tbody className='tabular-nums'>
          {[
            { ...control, rate: result.rateA },
            { ...variant, rate: result.rateB },
          ].map((row) => (
            <tr key={row.name} className='border-b last:border-b-0'>
              <th scope='row' className='py-2.5 pr-2 text-left font-medium'>
                <span className='text-muted-foreground mr-2 font-normal'>{row.name}</span>
                {row.label}
              </th>
              <td className='text-muted-foreground hidden py-2.5 text-right @sm:table-cell'>
                {formatNumber(row.visitors)}
              </td>
              <td className='text-muted-foreground py-2.5 text-right'>
                {formatNumber(row.conversions)}
              </td>
              <td className='py-2.5 text-right font-medium'>{rate(row.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export { Comparison2, exampleProps as comparison2ExampleProps, type Comparison2Props }
