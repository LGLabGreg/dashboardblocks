'use client'

import { Icon } from '@/registry/components/dashboardblocks/icon'
import { KPI, KPIContent, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { CardDescription, CardTitle } from '@/components/ui/card'

type TaskStatus = 'done' | 'in-progress' | 'todo'

interface TaskCount {
  count: number
  status: TaskStatus
}

interface ProgressKPI2Props {
  counts: TaskCount[]
  title: string
  /** Counted items, e.g. "tasks". */
  unit: string
}

const statusConfig: Record<TaskStatus, { fill: string; label: string }> = {
  done: { fill: 'bg-emerald-600 dark:bg-emerald-500', label: 'Done' },
  'in-progress': { fill: 'bg-sky-600 dark:bg-sky-500', label: 'In progress' },
  todo: { fill: 'bg-muted-foreground/40', label: 'Not started' },
}

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
  const { counts, title, unit } = props
  const total = counts.reduce((sum, item) => sum + item.count, 0)
  const done = counts.find((item) => item.status === 'done')?.count ?? 0
  const share = (count: number) => (total > 0 ? (count / total) * 100 : 0)

  return (
    <KPI>
      <KPIContent className='gap-1'>
        <div className='flex items-center justify-between gap-2'>
          <CardTitle>{title}</CardTitle>
          <Icon
            icon={
              <IconPlaceholder
                lucide='ClipboardListIcon'
                tabler='IconClipboardList'
                hugeicons='Task01Icon'
                phosphor='ClipboardTextIcon'
                remixicon='RiClipboardLine'
              />
            }
            size='sm'
            variant='secondary'
          />
        </div>
        <KPIValue value={Math.round(share(done))} format='percent' animated />
        <CardDescription>
          {done.toLocaleString('en-US')} of {total.toLocaleString('en-US')} {unit} done
        </CardDescription>
        <ul className='mt-4 flex flex-col gap-3'>
          {counts.map((item) => {
            const config = statusConfig[item.status]
            return (
              <li key={item.status} className='flex flex-col gap-1.5 text-sm'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-muted-foreground'>{config.label}</span>
                  <span className='tabular-nums'>
                    <span className='font-medium'>
                      {item.count.toLocaleString('en-US')}
                    </span>{' '}
                    <span className='text-muted-foreground'>
                      ({Math.round(share(item.count))}%)
                    </span>
                  </span>
                </div>
                <ProgressBar
                  className='h-1.5'
                  fillClassName={config.fill}
                  percentage={share(item.count)}
                />
              </li>
            )
          })}
        </ul>
      </KPIContent>
    </KPI>
  )
}

export {
  ProgressKPI2,
  exampleProps as progressKpi2ExampleProps,
  type ProgressKPI2Props,
  type TaskCount,
  type TaskStatus,
}
