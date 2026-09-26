'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { AnimatedWave } from '@/registry/components/dashboardblocks/animated-wave'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import {
  UsageStatusBadge,
  type UsageStatus,
  formatUsage,
  getUsageShare,
  getUsageStatus,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card'

interface UsageMeter7Props {
  icon: ReactNode
  limit: number
  onUpgrade?: () => void
  title: string
  unit: string
  used: number
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

/** The liquid is what's left, so it drains as usage grows and turns amber, then red. */
const waveColors: Record<UsageStatus, string> = {
  critical: 'text-red-300 dark:text-red-900',
  ok: 'text-sky-200 dark:text-sky-900',
  over: 'text-red-300 dark:text-red-900',
  warning: 'text-amber-200 dark:text-amber-900',
}

const UsageMeter7 = (props: UsageMeter7Props) => {
  const { icon, limit, onUpgrade, title, unit, used } = props
  const remaining = Math.max(0, limit - used)
  const share = getUsageShare(used, limit)
  const status = getUsageStatus(used, limit)

  return (
    <Card className='overflow-hidden pb-0'>
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
      <div
        role='meter'
        aria-label={title}
        aria-valuemax={limit}
        aria-valuemin={0}
        aria-valuenow={Math.min(used, limit)}
        aria-valuetext={`${formatUsage(used, unit)} of ${formatUsage(limit, unit)} used`}
        className='bg-muted/50 relative h-40 border-t'
      >
        <AnimatedWave
          percentage={100 - Math.min(100, share)}
          className={waveColors[status]}
        />
        <div
          aria-hidden
          className='text-foreground absolute inset-0 flex flex-col items-center justify-center gap-2 text-center'
        >
          <span className='text-muted-foreground text-sm font-medium'>Remaining</span>
          <span className='flex items-start gap-1 text-4xl leading-none font-semibold tracking-tight tabular-nums'>
            <AnimatedNumber
              value={remaining}
              formatter={(value) => formatUsage(Math.round(value))}
            />
            <span className='text-sm font-medium'>{unit}</span>
          </span>
          <span className='text-sm tabular-nums'>
            {formatUsage(used, unit)} of {formatUsage(limit, unit)} used
          </span>
        </div>
        {status !== 'ok' && (
          <UsageStatusBadge className='absolute top-3 right-3' status={status} />
        )}
      </div>
    </Card>
  )
}

export { UsageMeter7, exampleProps as usageMeter7ExampleProps, type UsageMeter7Props }
