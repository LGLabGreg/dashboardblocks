'use client'

import { FlowPathSteps } from '@/registry/components/dashboardblocks/flow'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface FlowPath {
  /** How many of them reached the goal. */
  converted: number
  /** How many took this path. */
  count: number
  steps: string[]
}

interface Flow4Props {
  description: string
  /** Names the goal, e.g. "Signed up". */
  goal: string
  paths: FlowPath[]
  title: string
  /** Everyone, including paths not listed, for the share of each path. */
  total: number
  /** @default 'sessions' */
  unit?: string
}

const exampleProps: Flow4Props = {
  description: 'The most common routes through the site, last 30 days',
  goal: 'Signed up',
  paths: [
    { converted: 1_020, count: 6_480, steps: ['Home', 'Pricing', 'Sign up'] },
    { converted: 140, count: 5_910, steps: ['Blog', 'Home'] },
    { converted: 610, count: 4_270, steps: ['Home', 'Features', 'Pricing'] },
    { converted: 380, count: 3_150, steps: ['Docs', 'Quickstart', 'API reference'] },
    { converted: 540, count: 2_640, steps: ['Pricing', 'Compare plans', 'Sign up'] },
    { converted: 90, count: 1_980, steps: ['Home', 'Customers', 'Case study'] },
  ],
  title: 'Top paths',
  total: 62_300,
  unit: 'sessions',
}

const Flow4 = (props: Flow4Props) => {
  const { description, goal, paths, title, total, unit = 'sessions' } = props
  const listed = paths.reduce((sum, path) => sum + path.count, 0)
  const widest = Math.max(1, ...paths.map((path) => path.count))
  const bestIndex = paths.reduce(
    (best, path, index) =>
      path.converted / (path.count || 1) >
      paths[best].converted / (paths[best].count || 1)
        ? index
        : best,
    0,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='text-muted-foreground flex justify-between gap-4 text-xs'>
          <span>Path</span>
          <span>{goal}</span>
        </div>
        <ol className='-mt-2 flex flex-col divide-y'>
          {paths.map((path, index) => {
            const rate = path.converted / (path.count || 1)
            return (
              <li key={path.steps.join('>')} className='flex flex-col gap-2 py-3'>
                <div className='flex items-start justify-between gap-4'>
                  <FlowPathSteps steps={path.steps.map((label) => ({ label }))} />
                  <span className='text-sm font-medium tabular-nums'>
                    {(rate * 100).toFixed(1)}%
                    {index === bestIndex && (
                      <span className='sr-only'>, the highest</span>
                    )}
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <span
                    aria-hidden
                    className='bg-muted h-1.5 flex-1 overflow-hidden rounded-full'
                  >
                    <span
                      className='block h-full rounded-full'
                      style={{
                        backgroundColor: 'var(--chart-1)',
                        width: `${(path.count / widest) * 100}%`,
                      }}
                    />
                  </span>
                  <span className='text-muted-foreground w-28 shrink-0 text-right text-xs tabular-nums'>
                    {path.count.toLocaleString()} {unit}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
        <p className='text-muted-foreground border-t pt-3 text-sm'>
          {`These ${paths.length} paths cover ${Math.round((listed / (total || 1)) * 100)}% of ${total.toLocaleString()} ${unit}. `}
          {paths[bestIndex] && `${paths[bestIndex].steps.join(' → ')} converts best.`}
        </p>
      </CardContent>
    </Card>
  )
}

export { Flow4, exampleProps as flow4ExampleProps, type Flow4Props, type FlowPath }
