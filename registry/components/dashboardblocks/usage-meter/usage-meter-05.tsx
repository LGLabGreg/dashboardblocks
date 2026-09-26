'use client'

import { SegmentedProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import {
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusBadge,
  formatUsage,
  getUsageStatus,
} from '@/registry/components/dashboardblocks/usage-meter'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface StorageCategory {
  label: string
  value: number
}

interface UsageMeter5Props {
  /** Largest first reads best. Each takes the next chart colour. */
  categories: StorageCategory[]
  limit: number
  title: string
  unit: string
}

const exampleProps: UsageMeter5Props = {
  categories: [
    { label: 'Images', value: 28.6 },
    { label: 'Videos', value: 18.2 },
    { label: 'Documents', value: 12.4 },
    { label: 'Other', value: 8.3 },
  ],
  limit: 100,
  title: 'Storage',
  unit: 'GB',
}

const colors = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

const percent = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  style: 'percent',
})

const UsageMeter5 = (props: UsageMeter5Props) => {
  const { categories, limit, title, unit } = props
  const used = categories.reduce((sum, category) => sum + category.value, 0)
  const status = getUsageStatus(used, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {formatUsage(Math.max(0, limit - used), unit)} free
        </CardDescription>
        <CardAction>
          <UsageStatusBadge status={status} />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-baseline justify-between gap-2'>
            <UsageMeterValue>{formatUsage(used, unit)}</UsageMeterValue>
            <UsageMeterLimit>of {formatUsage(limit, unit)}</UsageMeterLimit>
          </div>
          <div aria-hidden>
            <SegmentedProgressBar
              className='h-2.5 gap-0.5'
              segments={categories.map((category, index) => ({
                color: colors[index % colors.length],
                label: category.label,
                value: category.value,
              }))}
              total={limit}
            />
          </div>
        </div>
        <ul className='flex flex-col gap-2'>
          {categories.map((category, index) => (
            <li key={category.label} className='flex items-center gap-2 text-sm'>
              <span
                aria-hidden
                className='size-2.5 shrink-0 rounded-[3px]'
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className='text-muted-foreground truncate'>{category.label}</span>
              <span className='ml-auto font-medium tabular-nums'>
                {formatUsage(category.value, unit)}
              </span>
              <span className='text-muted-foreground w-9 text-right text-xs tabular-nums'>
                {percent.format(limit > 0 ? category.value / limit : 0)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  UsageMeter5,
  exampleProps as usageMeter5ExampleProps,
  type StorageCategory,
  type UsageMeter5Props,
}
