'use client'

import { FunnelBar, formatRate } from '@/registry/components/dashboardblocks/funnel'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface FunnelSegment {
  color: string
  key: string
  label: string
}

interface ComparedStage {
  label: string
  values: Record<string, number>
}

interface Funnel4Props {
  description: string
  segments: FunnelSegment[]
  stages: ComparedStage[]
  title: string
}

const exampleProps: Funnel4Props = {
  description: 'Share of visitors reaching each step, by device',
  segments: [
    { color: 'var(--chart-1)', key: 'desktop', label: 'Desktop' },
    { color: 'var(--chart-2)', key: 'mobile', label: 'Mobile' },
  ],
  stages: [
    { label: 'Viewed product', values: { desktop: 18_400, mobile: 26_900 } },
    { label: 'Added to cart', values: { desktop: 5_890, mobile: 6_190 } },
    { label: 'Started checkout', values: { desktop: 3_310, mobile: 2_690 } },
    { label: 'Purchased', values: { desktop: 2_020, mobile: 1_210 } },
  ],
  title: 'Conversion by device',
}

const Funnel4 = (props: Funnel4Props) => {
  const { description, segments, stages, title } = props
  const first = stages[0]
  const rate = (stage: ComparedStage, key: string) => {
    const start = first?.values[key] ?? 0
    return start > 0 ? (stage.values[key] ?? 0) / start : 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
          {segments.map((segment) => (
            <li key={segment.key} className='flex items-center gap-1.5'>
              <span
                aria-hidden
                className='size-2.5 rounded-[3px]'
                style={{ backgroundColor: segment.color }}
              />
              {segment.label}
            </li>
          ))}
        </ul>
        <table className='w-full text-sm'>
          <caption className='sr-only'>{`${title}: ${description}`}</caption>
          <thead className='sr-only'>
            <tr>
              <th scope='col'>Stage</th>
              <th scope='col'>Share of first step</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, stageIndex) => (
              <tr key={stage.label}>
                <th
                  scope='row'
                  className='w-36 py-2.5 pr-4 text-left align-top font-normal'
                >
                  {stage.label}
                </th>
                <td className='py-2.5'>
                  <div className='flex flex-col gap-1.5'>
                    {segments.map((segment, segmentIndex) => (
                      <div key={segment.key} className='flex items-center gap-3'>
                        <FunnelBar
                          className='h-2'
                          color={segment.color}
                          delay={stageIndex * 80 + segmentIndex * 40}
                          track={false}
                          value={rate(stage, segment.key) * 100}
                        />
                        <span className='text-muted-foreground w-10 shrink-0 text-right text-xs tabular-nums'>
                          <span className='sr-only'>{segment.label} </span>
                          {formatRate(rate(stage, segment.key), 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export { Funnel4, exampleProps as funnel4ExampleProps, type Funnel4Props }
