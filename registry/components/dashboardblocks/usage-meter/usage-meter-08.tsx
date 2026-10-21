'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { AnimatedWave } from '@/registry/components/dashboardblocks/animated-wave'
import {
  BlockStateProvider,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type UsageStatus,
  formatUsage,
  getUsageShare,
  getUsageStatus,
  UsageMeterValue,
  UsageStatusLabel,
  usageStatusConfig,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface UsageMeter8Props {
  daysLeft?: number
  icon: ReactNode
  limit: number
  onUpgrade?: () => void
  status?: BlockStatus
  title: string
  unit: string
  /** Leave out to show the empty state. */
  used?: number
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

const waveColors: Record<UsageStatus, string> = {
  critical: 'text-red-300 dark:text-red-900',
  ok: 'text-[color-mix(in_oklab,var(--color-chart-2)_25%,var(--color-background))]',
  over: 'text-red-300 dark:text-red-900',
  warning: 'text-orange-200 dark:text-orange-900',
}

const UsageMeter8 = (props: UsageMeter8Props) => {
  const {
    daysLeft,
    icon,
    limit,
    onUpgrade,
    status: blockStatus,
    title,
    unit,
    used = 0,
  } = props
  const state = getBlockState(blockStatus, props.used)
  const remaining = Math.max(0, limit - used)
  const share = getUsageShare(used, limit)
  const status = getUsageStatus(used, limit)
  const stats = [
    { label: 'Used', value: formatUsage(used, unit) },
    {
      label: 'Free',
      value: formatPercent(remaining / (limit || 1), { maximumFractionDigits: 0 }),
    },
    ...(daysLeft !== undefined
      ? [{ label: 'Resets in', value: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` }]
      : []),
  ]

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4 border-t pt-3'>
        <header className='flex min-h-8 items-center justify-between gap-3'>
          <p className='text-muted-foreground flex min-w-0 items-center gap-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0'>
            {icon}
            <span className='truncate'>{title}</span>
          </p>
          {onUpgrade && (
            <Button variant='outline' size='sm' onClick={onUpgrade}>
              Upgrade
            </Button>
          )}
        </header>
        <div
          {...(state
            ? {}
            : {
                role: 'meter',
                'aria-label': title,
                'aria-valuemax': limit,
                'aria-valuemin': 0,
                'aria-valuenow': Math.min(used, limit),
                'aria-valuetext': `${formatUsage(used, unit)} of ${formatUsage(limit, unit)} used, ${usageStatusConfig[status].label.toLowerCase()}`,
              })}
          className={cn(
            'bg-muted/50 relative size-48 self-center overflow-hidden rounded-full',
            state === 'loading' && 'animate-pulse motion-reduce:animate-none',
          )}
        >
          {!state && (
            <AnimatedWave
              percentage={100 - Math.min(100, share)}
              className={waveColors[status]}
            />
          )}
          {state ? (
            <div className='absolute inset-0 flex items-center justify-center'>
              <UsageMeterValue className='px-4 text-center text-2xl leading-tight' />
            </div>
          ) : (
            <div
              aria-hidden
              className='text-foreground absolute inset-0 flex flex-col items-center justify-center gap-1 text-center'
            >
              <span className='text-4xl leading-none font-light tracking-tight tabular-nums'>
                <AnimatedNumber
                  value={remaining}
                  formatter={(value) => formatUsage(Math.round(value))}
                />
                <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                  {unit}
                </span>
              </span>
              <span className='text-muted-foreground text-xs tabular-nums'>
                left of {formatUsage(limit, unit)}
              </span>
              {status !== 'ok' && (
                <UsageStatusLabel className='text-xs' status={status} />
              )}
            </div>
          )}
        </div>
        {state !== 'empty' && state !== 'error' && (
          <dl
            className={cn(
              'grid w-full gap-4 border-t pt-3',
              stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
            )}
          >
            {stats.map((stat) => (
              <div key={stat.label} className='flex min-w-0 flex-col gap-0.5'>
                <dt className='text-muted-foreground text-xs'>{stat.label}</dt>
                <dd className='text-xl font-light tracking-tight whitespace-nowrap tabular-nums'>
                  {state === 'loading' ? (
                    <SkeletonText className='w-[3em]' />
                  ) : (
                    stat.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { UsageMeter8, exampleProps as usageMeter8ExampleProps, type UsageMeter8Props }
