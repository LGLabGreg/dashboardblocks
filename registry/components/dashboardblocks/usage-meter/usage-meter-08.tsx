'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { AnimatedWave } from '@/registry/components/dashboardblocks/animated-wave'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import {
  type UsageStatus,
  formatUsage,
  getUsageShare,
  getUsageStatus,
  usageStatusConfig,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface UsageMeter8Props {
  /** Days until the quota resets. */
  daysLeft?: number
  icon: ReactNode
  limit: number
  onUpgrade?: () => void
  title: string
  unit: string
  used: number
}

const exampleProps: UsageMeter8Props = {
  daysLeft: 27,
  icon: (
    <IconPlaceholder
      lucide='DatabaseIcon'
      tabler='IconDatabase'
      hugeicons='Database01Icon'
      phosphor='DatabaseIcon'
      remixicon='RiDatabase2Line'
    />
  ),
  limit: 1_500,
  onUpgrade: () => {},
  title: 'Storage',
  unit: 'MB',
  used: 430,
}

/** The liquid is what's left, so it drains as usage grows and turns amber, then red. */
const waveColors: Record<UsageStatus, string> = {
  critical: 'text-red-300 dark:text-red-900',
  ok: 'text-sky-200 dark:text-sky-900',
  over: 'text-red-300 dark:text-red-900',
  warning: 'text-amber-200 dark:text-amber-900',
}

const percent = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  style: 'percent',
})

const UsageMeter8 = (props: UsageMeter8Props) => {
  const { daysLeft, icon, limit, onUpgrade, title, unit, used } = props
  const remaining = Math.max(0, limit - used)
  const share = getUsageShare(used, limit)
  const status = getUsageStatus(used, limit)
  const stats = [
    { label: 'Used', value: formatUsage(used, unit) },
    { label: 'Available', value: percent.format(remaining / (limit || 1)) },
    ...(daysLeft !== undefined
      ? [{ label: 'Resets in', value: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` }]
      : []),
  ]

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Icon icon={icon} size='sm' variant='secondary' />
          <CardTitle>{title}</CardTitle>
        </div>
        {onUpgrade && (
          <CardAction>
            <Button variant='outline' size='sm' onClick={onUpgrade}>
              Upgrade
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-6'>
        <div
          role='meter'
          aria-label={title}
          aria-valuemax={limit}
          aria-valuemin={0}
          aria-valuenow={Math.min(used, limit)}
          aria-valuetext={`${formatUsage(used, unit)} of ${formatUsage(limit, unit)} used, ${usageStatusConfig[status].label.toLowerCase()}`}
          className='bg-muted/60 ring-border relative size-48 overflow-hidden rounded-full ring-1'
        >
          <AnimatedWave
            percentage={100 - Math.min(100, share)}
            className={waveColors[status]}
          />
          <div
            aria-hidden
            className='text-foreground absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center'
          >
            <span className='text-muted-foreground text-xs font-medium'>Remaining</span>
            <span className='flex items-start gap-1 text-4xl leading-none font-semibold tracking-tight tabular-nums'>
              <AnimatedNumber
                value={remaining}
                formatter={(value) => formatUsage(Math.round(value))}
              />
              <span className='text-sm font-medium'>{unit}</span>
            </span>
            <span className='text-xs tabular-nums'>of {formatUsage(limit, unit)}</span>
          </div>
        </div>
        <dl
          className={cn(
            'grid w-full divide-x text-center',
            stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
          )}
        >
          {stats.map((stat) => (
            <div key={stat.label} className='flex flex-col gap-1 px-2'>
              <dt className='text-muted-foreground text-xs'>{stat.label}</dt>
              <dd className='text-lg font-semibold tracking-tight tabular-nums'>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

export { UsageMeter8, exampleProps as usageMeter8ExampleProps, type UsageMeter8Props }
