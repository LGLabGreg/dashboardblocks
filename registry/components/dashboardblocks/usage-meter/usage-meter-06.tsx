'use client'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'

interface PlanLimit {
  icon: React.ReactNode
  limit: number
  name: string
  used: number
}

interface UsageMeter6Props {
  limits: PlanLimit[]
  plan: string
}

const exampleProps: UsageMeter6Props = {
  limits: [
    {
      name: 'Team members',
      used: 4,
      limit: 5,
      icon: (
        <IconPlaceholder
          lucide='UsersIcon'
          tabler='IconUsers'
          hugeicons='UserGroupIcon'
          phosphor='UsersIcon'
          remixicon='RiTeamLine'
        />
      ),
    },
    {
      name: 'API calls',
      used: 8500,
      limit: 10000,
      icon: (
        <IconPlaceholder
          lucide='ZapIcon'
          tabler='IconBolt'
          hugeicons='FlashIcon'
          phosphor='LightningIcon'
          remixicon='RiFlashlightLine'
        />
      ),
    },
    {
      name: 'Storage',
      used: 4.9,
      limit: 5,
      icon: (
        <IconPlaceholder
          lucide='DatabaseIcon'
          tabler='IconDatabase'
          hugeicons='Database01Icon'
          phosphor='DatabaseIcon'
          remixicon='RiDatabase2Line'
        />
      ),
    },
    {
      name: 'Emails sent',
      used: 450,
      limit: 1000,
      icon: (
        <IconPlaceholder
          lucide='MailIcon'
          tabler='IconMail'
          hugeicons='MailIcon'
          phosphor='EnvelopeIcon'
          remixicon='RiMailLine'
        />
      ),
    },
  ],
  plan: 'Pro',
}

const UsageMeter6 = (props: UsageMeter6Props) => {
  const { limits, plan } = props
  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex items-center gap-2'>
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
          <CardTitle className='text-base font-medium'>{plan} Plan</CardTitle>
        </div>
        <div className='space-y-3'>
          {limits.map((item) => {
            const percentage = (item.used / item.limit) * 100
            const safePercentage = Number.isFinite(percentage) ? percentage : 0
            const normalized = Math.min(100, Math.max(0, safePercentage))
            const fillClassName =
              normalized >= 95
                ? 'bg-destructive'
                : normalized >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            const formattedLimit =
              item.limit >= 1000
                ? `${(item.limit / 1000).toFixed(0)}k`
                : item.limit.toString()

            return (
              <div key={item.name} className='space-y-1'>
                <div className='flex items-end justify-between text-sm'>
                  <div className='flex items-center gap-2 [&_svg]:size-3.5 [&_svg]:stroke-[1.5]'>
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {item.used.toLocaleString()} / {formattedLimit}
                  </span>
                </div>
                <ProgressBar
                  className='h-1.5'
                  percentage={percentage}
                  fillClassName={fillClassName}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className='border-t pt-4'>
        <Button variant='outline' className='w-full'>
          Upgrade Plan
        </Button>
      </CardFooter>
    </Card>
  )
}

export {
  UsageMeter6,
  exampleProps as usageMeter6ExampleProps,
  type UsageMeter6Props,
  type PlanLimit,
}
