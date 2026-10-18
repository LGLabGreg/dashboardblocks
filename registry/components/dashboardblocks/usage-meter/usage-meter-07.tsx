'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { AnimatedWave } from '@/registry/components/dashboardblocks/animated-wave'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  UsageMeterValue,
  UsageStatusLabel,
  type UsageStatus,
  formatUsage,
  getUsageShare,
  getUsageStatus,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface UsageMeter7Props {
  icon: ReactNode
  limit: number
  onUpgrade?: () => void
  status?: BlockStatus
  title: string
  unit: string
  /** Leave out to show the empty state. */
  used?: number
}

const exampleProps: UsageMeter7Props = {
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
  warning: 'text-amber-200 dark:text-amber-900',
}

const UsageMeter7 = (props: UsageMeter7Props) => {
  const { icon, limit, onUpgrade, status: blockStatus, title, unit, used = 0 } = props
  const state = getBlockState(blockStatus, props.used === undefined)
  const remaining = Math.max(0, limit - used)
  const share = getUsageShare(used, limit)
  const status = getUsageStatus(used, limit)

  return (
    <BlockStateProvider status={blockStatus} empty={props.used === undefined}>
      <section className='@container flex flex-col gap-3 border-t pt-3'>
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
                'aria-valuetext': `${formatUsage(used, unit)} of ${formatUsage(limit, unit)} used`,
              })}
          className={cn(
            'bg-muted/50 relative h-40 overflow-hidden rounded-lg',
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
              <UsageMeterValue className='leading-none' />
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
              <span className='text-muted-foreground text-sm'>left</span>
            </div>
          )}
        </div>
        <BlockReady className='text-sm'>
          <p className='text-muted-foreground flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm'>
            <span className='tabular-nums'>
              {formatUsage(used, unit)} of {formatUsage(limit, unit)} used
            </span>
            {status !== 'ok' && <UsageStatusLabel status={status} />}
          </p>
        </BlockReady>
      </section>
    </BlockStateProvider>
  )
}

export { UsageMeter7, exampleProps as usageMeter7ExampleProps, type UsageMeter7Props }
