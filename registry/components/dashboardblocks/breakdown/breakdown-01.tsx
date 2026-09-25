'use client'

import {
  BREAKDOWN_OTHER_COLOR,
  BreakdownBar,
  BreakdownKey,
  type BreakdownSegment,
  formatShare,
  getTotal,
} from '@/registry/components/dashboardblocks/breakdown'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Breakdown1Props {
  description: string
  formatter?: (value: number) => string
  segments: BreakdownSegment[]
  title: string
}

const exampleProps: Breakdown1Props = {
  description: 'Monthly recurring revenue by plan',
  formatter: (value) => `$${value.toLocaleString()}`,
  segments: [
    { color: 'var(--chart-1)', label: 'Enterprise', value: 28_400 },
    { color: 'var(--chart-2)', label: 'Pro', value: 19_750 },
    { color: 'var(--chart-3)', label: 'Starter', value: 8_320 },
    { color: BREAKDOWN_OTHER_COLOR, label: 'Add-ons', value: 2_930 },
  ],
  title: 'Revenue by plan',
}

const Breakdown1 = (props: Breakdown1Props) => {
  const {
    description,
    formatter = (value) => value.toLocaleString(),
    segments,
    title,
  } = props
  const total = getTotal(segments)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <span className='text-3xl font-semibold tracking-tight'>{formatter(total)}</span>
        <BreakdownBar segments={segments} />
        <table className='w-full text-sm'>
          <caption className='sr-only'>{`${title}: ${description}`}</caption>
          <thead className='sr-only'>
            <tr>
              <th scope='col'>Category</th>
              <th scope='col'>Value</th>
              <th scope='col'>Share</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => (
              <tr key={segment.label} className='border-b last:border-b-0'>
                <th scope='row' className='py-2 pr-3 text-left font-normal'>
                  <span className='flex items-center gap-2'>
                    <BreakdownKey color={segment.color} />
                    {segment.label}
                  </span>
                </th>
                <td className='py-2 pr-3 text-right font-medium tabular-nums'>
                  {formatter(segment.value)}
                </td>
                <td className='text-muted-foreground w-12 py-2 text-right tabular-nums'>
                  {formatShare(segment.value, total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export { Breakdown1, exampleProps as breakdown1ExampleProps, type Breakdown1Props }
