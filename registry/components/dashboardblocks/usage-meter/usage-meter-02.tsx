'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import { Ring } from '@/registry/components/dashboardblocks/ring'
import {
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusLabel,
  formatUsage,
  getUsageShare,
  getUsageStatus,
  usageStatusConfig,
} from '@/registry/components/dashboardblocks/usage-meter'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

interface UsageMeter2Props {
  limit: number
  status?: BlockStatus
  title: string
  unit: string
  /** Leave out to show the empty state. */
  used?: number
}

const exampleProps: UsageMeter2Props = {
  limit: 120,
  title: 'Storage',
  unit: 'GB',
  used: 78.4,
}

const UsageMeter2 = (props: UsageMeter2Props) => {
  const { limit, status: blockStatus, title, unit, used = 0 } = props
  const share = getUsageShare(used, limit)
  const status = getUsageStatus(used, limit)
  const free = Math.max(0, limit - used)

  return (
    <BlockStateProvider state={getBlockState(blockStatus, props.used)}>
      <section className='@container flex items-center gap-6 border-t pt-4'>
        <Ring
          ariaLabel={`${formatPercent(share / 100, { maximumFractionDigits: 0 })} of ${title.toLowerCase()} used`}
          className='size-24'
          percentage={Math.min(100, share)}
          ringColor={usageStatusConfig[status].color}
          strokeWidth={8}
        >
          <AnimatedNumber
            className='text-2xl font-light tracking-tight tabular-nums'
            value={Math.round(share)}
            formatter={(value) =>
              formatPercent(value / 100, { maximumFractionDigits: 0 })
            }
          />
        </Ring>
        <div className='flex min-w-0 flex-col gap-1'>
          <p className='text-muted-foreground text-sm'>{title}</p>
          <div className='flex flex-wrap items-baseline gap-x-1.5'>
            <UsageMeterValue>{formatUsage(used, unit)}</UsageMeterValue>
            <UsageMeterLimit>of {formatUsage(limit, unit)}</UsageMeterLimit>
          </div>
          <BlockReady className='text-sm'>
            <Details className='text-muted-foreground block text-sm'>
              <span>
                <span className='tabular-nums'>{formatUsage(free, unit)}</span> free
              </span>
              {status !== 'ok' && <UsageStatusLabel variant='text' status={status} />}
            </Details>
          </BlockReady>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { UsageMeter2, exampleProps as usageMeter2ExampleProps, type UsageMeter2Props }
