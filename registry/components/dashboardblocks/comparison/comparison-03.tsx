'use client'

import { DivergingBar, getDelta } from '@/registry/components/dashboardblocks/comparison'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Segment {
  current: number
  label: string
  previous: number
}

interface Comparison3Props {
  description: string
  formatter?: (value: number) => string
  segments: Segment[]
  title: string
}

const exampleProps: Comparison3Props = {
  description: 'Revenue change by channel, September vs August',
  formatter: (value) => `$${Math.round(value).toLocaleString('en-US')}`,
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
    description,
    formatter = (value) => Math.round(value).toLocaleString(),
    segments,
    title,
  } = props
  const rows = segments
    .map((segment) => ({ ...segment, ...getDelta(segment.current, segment.previous) }))
    .sort((a, b) => b.difference - a.difference)
  const max = Math.max(...rows.map((row) => Math.abs(row.difference)), 0)
  const net = rows.reduce((sum, row) => sum + row.difference, 0)
  const signed = (value: number) =>
    `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatter(Math.abs(value))}`

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <p className='flex flex-wrap items-baseline gap-x-2'>
          <span className='text-3xl font-semibold tracking-tight'>{signed(net)}</span>
          <span className='text-muted-foreground text-sm'>net change</span>
        </p>
        <ul className='flex flex-col gap-3'>
          {rows.map((row) => (
            <li
              key={row.label}
              className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 @md:grid-cols-[8rem_minmax(0,1fr)_9rem]'
            >
              <span className='truncate text-sm'>{row.label}</span>
              <span className='text-right text-sm whitespace-nowrap tabular-nums @md:order-last'>
                <span className='font-medium'>{signed(row.difference)}</span>{' '}
                <span className='text-muted-foreground text-xs'>
                  ({row.percent > 0 ? '+' : ''}
                  {row.percent}%)
                </span>
              </span>
              <DivergingBar
                className='col-span-2 @md:col-span-1'
                max={max}
                value={row.difference}
              />
            </li>
          ))}
        </ul>
        <div
          aria-hidden
          className='text-muted-foreground hidden grid-cols-[8rem_minmax(0,1fr)_9rem] gap-x-4 text-xs @md:grid'
        >
          <span />
          <span className='flex justify-between'>
            <span>Decrease</span>
            <span>Increase</span>
          </span>
          <span />
        </div>
      </CardContent>
    </Card>
  )
}

export { Comparison3, exampleProps as comparison3ExampleProps, type Comparison3Props }
