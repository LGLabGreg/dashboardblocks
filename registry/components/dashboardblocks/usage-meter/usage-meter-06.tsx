'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  UsageBar,
  UsageStatusLabel,
  formatUsage,
  getUsageStatus,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface PlanLimit {
  icon: ReactNode
  limit: number
  name: string
  unit?: string
  used: number
}

interface UsageMeter6Props {
  /** Leave out, or pass none, to show the empty state. */
  limits?: PlanLimit[]
  onUpgrade?: () => void
  plan: string
  status?: BlockStatus
}

const exampleProps: UsageMeter6Props = {
  limits: [
    {
      icon: (
        <IconPlaceholder
          lucide='UsersIcon'
          tabler='IconUsers'
          hugeicons='UserGroupIcon'
          phosphor='UsersIcon'
          remixicon='RiTeamLine'
        />
      ),
      limit: 5,
      name: 'Team members',
      used: 4,
    },
    {
      icon: (
        <IconPlaceholder
          lucide='ZapIcon'
          tabler='IconBolt'
          hugeicons='FlashIcon'
          phosphor='LightningIcon'
          remixicon='RiFlashlightLine'
        />
      ),
      limit: 10_000,
      name: 'API calls',
      used: 6_120,
    },
    {
      icon: (
        <IconPlaceholder
          lucide='DatabaseIcon'
          tabler='IconDatabase'
          hugeicons='Database01Icon'
          phosphor='DatabaseIcon'
          remixicon='RiDatabase2Line'
        />
      ),
      limit: 5,
      name: 'Storage',
      unit: 'GB',
      used: 4.9,
    },
    {
      icon: (
        <IconPlaceholder
          lucide='MailIcon'
          tabler='IconMail'
          hugeicons='MailIcon'
          phosphor='EnvelopeIcon'
          remixicon='RiMailLine'
        />
      ),
      limit: 1_000,
      name: 'Emails sent',
      used: 450,
    },
  ],
  onUpgrade: () => {},
  plan: 'Pro',
}

const UsageMeter6 = (props: UsageMeter6Props) => {
  const { limits = [], onUpgrade, plan, status: blockStatus } = props
  const state = getBlockState(blockStatus, limits.length === 0)
  const nearLimit = limits.filter(
    (item) => getUsageStatus(item.used, item.limit) !== 'ok',
  )

  return (
    <BlockStateProvider status={blockStatus} empty={limits.length === 0}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{plan} plan</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>
                {nearLimit.length === 0
                  ? 'Every limit has room this month.'
                  : nearLimit.length === 1
                    ? `${nearLimit[0].name} is nearly at its limit this month.`
                    : `${nearLimit.length} of ${limits.length} limits are nearly reached this month.`}
              </p>
            </BlockReady>
          </div>
          {onUpgrade && (
            <Button
              className='shrink-0'
              onClick={onUpgrade}
              size='sm'
              variant={nearLimit.length > 0 ? 'default' : 'outline'}
            >
              Upgrade
            </Button>
          )}
        </header>
        {state && <BlockStateRows className='border-t' rows={4} />}
        {!state && (
          <ul className='flex flex-col border-t'>
            {limits.map((item) => {
              const status = getUsageStatus(item.used, item.limit)
              return (
                <li key={item.name} className='flex flex-col gap-2 border-b py-2.5'>
                  <div className='flex items-center justify-between gap-3 text-sm'>
                    <span className='text-muted-foreground flex min-w-0 items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0'>
                      {item.icon}
                      <span className='text-foreground truncate'>{item.name}</span>
                    </span>
                    <span className='flex shrink-0 items-baseline gap-3 text-xs'>
                      {status !== 'ok' && (
                        <UsageStatusLabel className='text-xs' status={status} />
                      )}
                      <span className='text-muted-foreground tabular-nums'>
                        <span className='text-foreground font-medium'>
                          {formatUsage(item.used)}
                        </span>{' '}
                        of {formatUsage(item.limit, item.unit, { compact: true })}
                      </span>
                    </span>
                  </div>
                  <UsageBar limit={item.limit} size='sm' used={item.used} />
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  UsageMeter6,
  exampleProps as usageMeter6ExampleProps,
  type PlanLimit,
  type UsageMeter6Props,
}
