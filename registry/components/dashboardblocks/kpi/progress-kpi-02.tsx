'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  KPI,
  KPIContent,
  KPITitle,
  KPIValue,
} from '@/registry/components/dashboardblocks/kpi'
import { SegmentedProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

type TaskStatus = 'done' | 'in-progress' | 'todo'

interface TaskCount {
  count: number
  status: TaskStatus
}

interface ProgressKPI2Props {
  /** Leave out, or pass none, to show the empty state. */
  counts?: TaskCount[]
  status?: BlockStatus
  title: string
  unit: string
}

const statusConfig: Record<TaskStatus, { color: string; label: string }> = {
  done: { color: 'var(--color-chart-2)', label: 'Done' },
  'in-progress': {
    color: 'color-mix(in oklab, var(--color-chart-2) 40%, transparent)',
    label: 'In progress',
  },
  todo: { color: 'var(--color-muted)', label: 'Not started' },
}

const statusOrder: TaskStatus[] = ['done', 'in-progress', 'todo']

const exampleProps: ProgressKPI2Props = {
  counts: [
    { count: 51, status: 'done' },
    { count: 26, status: 'in-progress' },
    { count: 10, status: 'todo' },
  ],
  title: 'Sprint progress',
  unit: 'tasks',
}

const ProgressKPI2 = (props: ProgressKPI2Props) => {
  const { counts = [], status, title, unit } = props
  const state = getBlockState(status, counts)
  const sorted = statusOrder.flatMap((taskStatus) =>
    counts.filter((item) => item.status === taskStatus),
  )
  const total = counts.reduce((sum, item) => sum + item.count, 0)
  const done = counts.find((item) => item.status === 'done')?.count ?? 0
  const share = (count: number) => (total > 0 ? count / total : 0)

  return (
    <BlockStateProvider state={state}>
      <KPI>
        <KPIContent className='gap-1'>
          <KPITitle>{title}</KPITitle>
          <KPIValue value={Math.round(share(done) * 100)} format='percent' animated />
          {state === 'loading' ? (
            <BlockStateText className='text-sm' />
          ) : state ? null : (
            <p className='text-muted-foreground text-sm'>
              <span className='text-foreground font-medium tabular-nums'>
                {formatNumber(done)}
              </span>{' '}
              of <span className='tabular-nums'>{formatNumber(total)}</span> {unit} done
            </p>
          )}
          <SegmentedProgressBar
            className='mt-4 gap-0.5 bg-transparent'
            segments={sorted.map((item) => ({
              color: statusConfig[item.status].color,
              label: item.status,
              value: item.count,
            }))}
            total={total}
          />
          {state === 'loading' && (
            <ul aria-hidden className='mt-3 flex flex-col text-sm'>
              {statusOrder.map((taskStatus) => (
                <li
                  key={taskStatus}
                  className='flex items-center gap-2 border-b py-2 last:border-b-0'
                >
                  <span className='text-muted-foreground'>
                    {statusConfig[taskStatus].label}
                  </span>
                  <SkeletonText className='ml-auto w-12' />
                </li>
              ))}
            </ul>
          )}
          {!state && (
            <ul className='mt-3 flex flex-col text-sm'>
              {sorted.map((item) => {
                const config = statusConfig[item.status]
                return (
                  <li
                    key={item.status}
                    className='flex items-center gap-2 border-b py-2 last:border-b-0'
                  >
                    <span
                      aria-hidden
                      className='size-2.5 shrink-0 rounded-[3px] ring-1 ring-foreground/10 ring-inset'
                      style={{ backgroundColor: config.color }}
                    />
                    <span className='text-muted-foreground'>{config.label}</span>
                    <span className='ml-auto font-medium tabular-nums'>
                      {formatNumber(item.count)}
                    </span>
                    <span className='text-muted-foreground w-10 text-right text-xs tabular-nums'>
                      {formatPercent(share(item.count), {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </KPIContent>
      </KPI>
    </BlockStateProvider>
  )
}

export {
  ProgressKPI2,
  exampleProps as progressKpi2ExampleProps,
  type ProgressKPI2Props,
  type TaskCount,
  type TaskStatus,
}
