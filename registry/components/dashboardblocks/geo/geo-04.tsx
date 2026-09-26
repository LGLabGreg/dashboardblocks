'use client'

import {
  BreakdownBar,
  BreakdownKey,
  formatShare,
} from '@/registry/components/dashboardblocks/breakdown'
import { getDelta } from '@/registry/components/dashboardblocks/comparison'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Region {
  color: string
  current: number
  label: string
  previous: number
}

interface Geo4Props {
  description: string
  formatter?: (value: number) => string
  /** Names the previous period in the change column, e.g. "vs Q2". */
  previousLabel: string
  regions: Region[]
  title: string
}

const currency = (value: number) =>
  value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}M`
    : `$${Math.round(value / 1_000).toLocaleString('en-US')}K`

const exampleProps: Geo4Props = {
  description: 'Q3 2026',
  formatter: currency,
  previousLabel: 'vs Q2',
  regions: [
    {
      color: 'var(--chart-1)',
      current: 1_284_600,
      label: 'North America',
      previous: 1_196_300,
    },
    { color: 'var(--chart-2)', current: 912_400, label: 'Europe', previous: 861_900 },
    {
      color: 'var(--chart-3)',
      current: 538_700,
      label: 'Asia Pacific',
      previous: 462_100,
    },
    {
      color: 'var(--chart-4)',
      current: 186_300,
      label: 'Latin America',
      previous: 191_800,
    },
    {
      color: 'var(--chart-5)',
      current: 97_900,
      label: 'Middle East & Africa',
      previous: 84_600,
    },
  ],
  title: 'Revenue by region',
}

const Geo4 = (props: Geo4Props) => {
  const {
    description,
    formatter = (value: number) => value.toLocaleString('en-US'),
    previousLabel,
    regions,
    title,
  } = props
  const total = regions.reduce((sum, region) => sum + region.current, 0)
  const previousTotal = regions.reduce((sum, region) => sum + region.previous, 0)
  const totalChange = getDelta(total, previousTotal).percent

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className='flex flex-col items-end gap-0.5'>
          <span className='text-2xl font-semibold tracking-tight tabular-nums'>
            {formatter(total)}
          </span>
          <span className='flex items-center gap-1 text-xs'>
            <Trend
              className='text-xs [&_svg]:size-3.5'
              trend={totalChange}
              trendIcon='arrow'
            />
            <span className='text-muted-foreground'>{previousLabel}</span>
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <BreakdownBar
          segments={regions.map((region) => ({
            color: region.color,
            label: region.label,
            value: region.current,
          }))}
        />
        <table className='w-full text-sm'>
          <caption className='sr-only'>{`${title}, ${description}, with the change ${previousLabel}`}</caption>
          <thead className='text-muted-foreground text-xs'>
            <tr>
              <th scope='col' className='pb-2 text-left font-normal'>
                Region
              </th>
              <th scope='col' className='pb-2 text-right font-normal'>
                Revenue
              </th>
              <th scope='col' className='w-20 pb-2 text-right font-normal'>
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr key={region.label} className='border-t'>
                <th scope='row' className='py-2.5 pr-3 text-left font-normal'>
                  <span className='flex items-start gap-2'>
                    <BreakdownKey color={region.color} className='mt-1' />
                    <span className='flex min-w-0 flex-col @md:flex-row @md:gap-2'>
                      <span>{region.label}</span>
                      <span className='text-muted-foreground text-xs @md:text-sm'>
                        {formatShare(region.current, total, 1)}
                        <span className='sr-only'> of revenue</span>
                      </span>
                    </span>
                  </span>
                </th>
                <td className='py-2.5 text-right align-top font-medium tabular-nums'>
                  {formatter(region.current)}
                </td>
                <td className='py-2.5 pl-3 align-top'>
                  <Trend
                    className='justify-end text-xs [&_svg]:size-3.5'
                    trend={getDelta(region.current, region.previous).percent}
                    trendIcon='arrow'
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export { Geo4, exampleProps as geo4ExampleProps, type Geo4Props }
