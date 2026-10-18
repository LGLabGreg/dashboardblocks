'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { FlowPathSteps } from '@/registry/components/dashboardblocks/flow'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface FlowPath {
  converted: number
  count: number
  steps: string[]
}

interface Flow4Props {
  description: string
  goal: string
  /** Leave out, or pass none, to show the empty state. */
  paths?: FlowPath[]
  status?: BlockStatus
  title: string
  /** Everyone, including paths not listed. @default the listed paths' total */
  total?: number
  /** @default 'sessions' */
  unit?: string
}

const exampleProps: Flow4Props = {
  description: 'The most common routes through the site, last 30 days.',
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
  const { description, goal, paths = [], status, title, unit = 'sessions' } = props
  const listed = paths.reduce((sum, path) => sum + path.count, 0)
  const { total = listed } = props
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
    <BlockStateProvider state={getBlockState(status, paths)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col border-t'>
          <div className='text-muted-foreground flex justify-between gap-4 pt-3 text-xs'>
            <span>Path</span>
            <span>{goal}</span>
          </div>
          <BlockStateRows rows={6} />
          <ol className='flex flex-col divide-y empty:hidden'>
            {!status &&
              paths.map((path, index) => {
                const rate = path.converted / (path.count || 1)
                return (
                  <li key={path.steps.join('>')} className='flex flex-col gap-2 py-2.5'>
                    <div className='flex items-start justify-between gap-4'>
                      <FlowPathSteps steps={path.steps.map((label) => ({ label }))} />
                      <span className='text-sm font-medium tabular-nums'>
                        {formatPercent(rate)}
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
                          className='bg-chart-2 block h-full rounded-full'
                          style={{ width: `${(path.count / widest) * 100}%` }}
                        />
                      </span>
                      <span className='text-muted-foreground w-28 shrink-0 text-right text-xs tabular-nums'>
                        {formatNumber(path.count)} {unit}
                      </span>
                    </div>
                  </li>
                )
              })}
          </ol>
        </div>
        <BlockReady className='border-t pt-3 text-sm'>
          <p className='text-muted-foreground border-t pt-3 text-sm'>
            {`These ${paths.length} paths cover ${formatPercent(listed / (total || 1), { maximumFractionDigits: 0 })} of ${formatNumber(total)} ${unit}. `}
            {paths[bestIndex] && (
              <span className='text-foreground'>
                {`${paths[bestIndex].steps.join(' → ')} converts best.`}
              </span>
            )}
          </p>
        </BlockReady>
      </section>
    </BlockStateProvider>
  )
}

export { Flow4, exampleProps as flow4ExampleProps, type Flow4Props, type FlowPath }
