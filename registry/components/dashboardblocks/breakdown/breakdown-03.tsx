'use client'

import {
  BREAKDOWN_OTHER_COLOR,
  BreakdownKey,
  type BreakdownSegment,
  formatShare,
  getTotal,
  useReveal,
} from '@/registry/components/dashboardblocks/breakdown'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Breakdown3Props {
  description: string
  segments: BreakdownSegment[]
  title: string
}

const exampleProps: Breakdown3Props = {
  description: 'Active workspaces by plan',
  segments: [
    { color: 'var(--chart-1)', label: 'Free', value: 5_840 },
    { color: 'var(--chart-2)', label: 'Pro', value: 2_310 },
    { color: 'var(--chart-3)', label: 'Team', value: 1_120 },
    { color: BREAKDOWN_OTHER_COLOR, label: 'Enterprise', value: 430 },
  ],
  title: 'Plan distribution',
}

const CELLS = 100

/** Splits 100 cells across segments with the largest-remainder method. */
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
  const { description, segments, title } = props
  const { ref, revealed } = useReveal<HTMLDivElement>(true)
  const total = getTotal(segments)
  const cells = toCells(segments).flatMap((count, index) =>
    Array.from({ length: count }, () => segments[index].color),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-6 sm:flex-row sm:items-start'>
        <div ref={ref} aria-hidden className='grid w-40 shrink-0 grid-cols-10 gap-0.5'>
          {cells.map((color, index) => (
            <span
              key={index}
              className='aspect-square rounded-[3px] transition-[opacity,scale] duration-300 ease-out motion-reduce:transition-none'
              style={{
                backgroundColor: color,
                opacity: revealed ? 1 : 0,
                scale: revealed ? '1' : '0.6',
                transitionDelay: revealed ? `${index * 6}ms` : undefined,
              }}
            />
          ))}
        </div>
        <div className='flex w-full flex-col gap-4'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-3xl font-semibold tracking-tight'>
              {total.toLocaleString()}
            </span>
            <span className='text-muted-foreground text-xs'>
              Each square is 1% of the total
            </span>
          </div>
          <ul className='flex flex-col gap-2 text-sm'>
            {segments.map((segment) => (
              <li key={segment.label} className='flex items-center gap-2'>
                <BreakdownKey color={segment.color} />
                <span className='flex-1'>{segment.label}</span>
                <span className='font-medium tabular-nums'>
                  {segment.value.toLocaleString()}
                </span>
                <span className='text-muted-foreground w-10 text-right tabular-nums'>
                  {formatShare(segment.value, total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export { Breakdown3, exampleProps as breakdown3ExampleProps, type Breakdown3Props }
