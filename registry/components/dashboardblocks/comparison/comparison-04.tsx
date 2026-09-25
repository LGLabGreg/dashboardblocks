'use client'

import {
  Dumbbell,
  DumbbellLegend,
  getDelta,
} from '@/registry/components/dashboardblocks/comparison'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface BeforeAfterRow {
  after: number
  before: number
  label: string
}

interface Comparison4Props {
  afterLabel: string
  beforeLabel: string
  description: string
  formatter?: (value: number) => string
  /** Use `down` when a decrease is an improvement, such as load time. */
  goodDirection?: 'up' | 'down'
  rows: BeforeAfterRow[]
  title: string
}

const exampleProps: Comparison4Props = {
  afterLabel: 'After, Sep 15–24',
  beforeLabel: 'Before, Sep 1–10',
  description: 'p75 largest contentful paint by page, before and after the CDN migration',
  formatter: (value) => `${value.toFixed(1)} s`,
  goodDirection: 'down',
  rows: [
    { after: 1.6, before: 2.9, label: 'Home' },
    { after: 2.1, before: 3.8, label: 'Product' },
    { after: 1.9, before: 2.6, label: 'Search' },
    { after: 2.4, before: 2.7, label: 'Checkout' },
    { after: 1.5, before: 1.4, label: 'Account' },
  ],
  title: 'Page speed',
}

const Comparison4 = (props: Comparison4Props) => {
  const {
    afterLabel,
    beforeLabel,
    description,
    formatter = (value) => value.toLocaleString(),
    goodDirection = 'up',
    rows,
    title,
  } = props
  const max = Math.max(...rows.flatMap((row) => [row.before, row.after]), 0) * 1.1

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <DumbbellLegend afterLabel={afterLabel} beforeLabel={beforeLabel} />
        <ul className='flex flex-col gap-4'>
          {rows.map((row) => (
            <li
              key={row.label}
              className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 @md:grid-cols-[6rem_minmax(0,1fr)_12rem]'
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
                <Trend
                  className='text-xs [&_svg]:size-3.5'
                  goodDirection={goodDirection}
                  trend={getDelta(row.after, row.before).percent}
                  trendIcon='arrow'
                  formatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(0)}%`}
                />
              </span>
              <Dumbbell
                after={row.after}
                before={row.before}
                className='col-span-2 @md:col-span-1'
                max={max}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export { Comparison4, exampleProps as comparison4ExampleProps, type Comparison4Props }
