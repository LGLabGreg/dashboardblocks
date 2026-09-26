'use client'

import {
  IntervalBar,
  compareProportions,
} from '@/registry/components/dashboardblocks/comparison'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Variant {
  conversions: number
  label: string
  visitors: number
}

interface Comparison2Props {
  control: Variant
  description: string
  /** The conversion the test measures, e.g. "Checkout conversion". */
  metric: string
  title: string
  variant: Variant
}

const exampleProps: Comparison2Props = {
  control: { conversions: 1_208, label: 'A · Current checkout', visitors: 24_150 },
  description: 'Running for 14 days, 50/50 split',
  metric: 'Checkout conversion',
  title: 'One-page checkout test',
  variant: { conversions: 1_342, label: 'B · One-page checkout', visitors: 24_080 },
}

const percent = (value: number, digits = 1) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value * 100).toFixed(digits)}%`

const Comparison2 = (props: Comparison2Props) => {
  const { control, description, metric, title, variant } = props
  const result = compareProportions(control, variant)
  const extent = Math.max(Math.abs(result.liftLow), Math.abs(result.liftHigh), 0.05) * 1.2

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
              result.significant
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {result.significant ? (
              <IconPlaceholder
                lucide='CircleCheckIcon'
                tabler='IconCircleCheck'
                hugeicons='CheckmarkCircle02Icon'
                phosphor='CheckCircleIcon'
                remixicon='RiCheckboxCircleLine'
                aria-hidden
                className='size-3.5'
              />
            ) : (
              <IconPlaceholder
                lucide='CircleDashedIcon'
                tabler='IconCircleDashed'
                hugeicons='DashedLineCircleIcon'
                phosphor='CircleDashedIcon'
                remixicon='RiLoaderLine'
                aria-hidden
                className='size-3.5'
              />
            )}
            {result.significant ? 'Significant' : 'Not significant yet'}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-col gap-1'>
          <span className='text-muted-foreground text-xs'>{metric}, B vs A</span>
          <span className='text-3xl font-semibold tracking-tight'>
            {percent(result.lift)} lift
          </span>
          <span className='text-muted-foreground text-sm'>
            95% confidence interval: {percent(result.liftLow)} to{' '}
            {percent(result.liftHigh)}
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
        <table className='w-full text-sm'>
          <caption className='sr-only'>Results by variant</caption>
          <thead>
            <tr className='text-muted-foreground border-b text-xs'>
              <th scope='col' className='py-2 text-left font-medium'>
                Variant
              </th>
              <th scope='col' className='py-2 text-right font-medium'>
                Visitors
              </th>
              <th scope='col' className='py-2 text-right font-medium'>
                Conversions
              </th>
              <th scope='col' className='py-2 text-right font-medium'>
                Rate
              </th>
            </tr>
          </thead>
          <tbody className='tabular-nums'>
            {[
              { ...control, rate: result.rateA },
              { ...variant, rate: result.rateB },
            ].map((row) => (
              <tr key={row.label} className='border-b last:border-b-0'>
                <th scope='row' className='py-2 pr-2 text-left font-medium'>
                  {row.label}
                </th>
                <td className='py-2 text-right'>{row.visitors.toLocaleString()}</td>
                <td className='py-2 text-right'>{row.conversions.toLocaleString()}</td>
                <td className='py-2 text-right font-medium'>
                  {(row.rate * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export { Comparison2, exampleProps as comparison2ExampleProps, type Comparison2Props }
