'use client'

import { Icon } from '@/registry/components/dashboardblocks/icon'
import {
  UsageBar,
  formatUsage,
  getUsageStatus,
  usageStatusConfig,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface PlanLimit {
  icon: ReactNode
  limit: number
  name: string
  /** Shown after the numbers, e.g. "GB". */
  unit?: string
  used: number
}

interface UsageMeter6Props {
  limits: PlanLimit[]
  onUpgrade?: () => void
  plan: string
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
  plan: 'Pro',
}

const UsageMeter6 = (props: UsageMeter6Props) => {
  const { limits, onUpgrade, plan } = props
  const nearLimit = limits.filter(
    (item) => getUsageStatus(item.used, item.limit) !== 'ok',
  )

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <Icon
            icon={
              <IconPlaceholder
                lucide='CrownIcon'
                tabler='IconCrown'
                hugeicons='CrownIcon'
                phosphor='CrownIcon'
                remixicon='RiVipCrownLine'
              />
            }
            size='md'
          />
          <div className='flex flex-col gap-0.5'>
            <CardTitle>{plan} plan</CardTitle>
            <CardDescription>Usage this month</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col gap-4'>
          {limits.map((item) => {
            const status = getUsageStatus(item.used, item.limit)
            const config = usageStatusConfig[status]
            return (
              <li key={item.name} className='flex flex-col gap-1.5'>
                <div className='flex items-center justify-between gap-3 text-sm'>
                  <span className='text-muted-foreground flex items-center gap-2 [&_svg]:size-4'>
                    {item.icon}
                    <span className='text-foreground'>{item.name}</span>
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs tabular-nums [&_svg]:size-3.5',
                      status === 'ok'
                        ? 'text-muted-foreground'
                        : cn('font-medium', config.text),
                    )}
                  >
                    {status !== 'ok' && config.icon}
                    {formatUsage(item.used)} /{' '}
                    {formatUsage(item.limit, item.unit, { compact: true })}
                    {status !== 'ok' && <span className='sr-only'>, {config.label}</span>}
                  </span>
                </div>
                <UsageBar limit={item.limit} size='sm' used={item.used} />
              </li>
            )
          })}
        </ul>
      </CardContent>
      <CardFooter className='flex-col items-stretch gap-3 border-t'>
        {nearLimit.length > 0 && (
          <p className='text-muted-foreground text-xs'>
            {nearLimit.length === 1
              ? `${nearLimit[0].name} is nearly at its limit.`
              : `${nearLimit.length} limits are nearly reached.`}{' '}
            Upgrade for more room.
          </p>
        )}
        <Button
          className='w-full'
          onClick={onUpgrade}
          variant={nearLimit.length > 0 ? 'default' : 'outline'}
        >
          Upgrade plan
        </Button>
      </CardFooter>
    </Card>
  )
}

export {
  UsageMeter6,
  exampleProps as usageMeter6ExampleProps,
  type PlanLimit,
  type UsageMeter6Props,
}
