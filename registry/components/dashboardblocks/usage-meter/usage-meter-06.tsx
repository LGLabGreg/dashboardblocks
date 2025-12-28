import { Icon } from '@/registry/components/dashboardblocks/icon'
import { UsageMeterBar } from '@/registry/components/dashboardblocks/usage-meter'
import { Crown, Database, Mail, Users, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'

interface PlanLimit {
  icon: LucideIcon
  limit: number
  name: string
  used: number
}

export const UsageMeter6 = ({
  className = '',
  limits = [
    { name: 'Team members', used: 4, limit: 5, icon: Users },
    { name: 'API calls', used: 8500, limit: 10000, icon: Zap },
    { name: 'Storage', used: 4.2, limit: 5, icon: Database },
    { name: 'Emails sent', used: 450, limit: 1000, icon: Mail },
  ],
  plan = 'Pro',
}: {
  className?: string
  limits?: PlanLimit[]
  plan?: string
} = {}) => {
  return (
    <Card className={className}>
      <CardContent className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Icon icon={Crown} variant='warning' />
          <CardTitle className='text-base font-medium'>{plan} Plan</CardTitle>
        </div>
        <div className='space-y-3'>
          {limits.map((item) => {
            const percentage = (item.used / item.limit) * 100
            const formattedUsed =
              item.used >= 1000
                ? `${(item.used / 1000).toFixed(1)}k`
                : item.used.toString()
            const formattedLimit =
              item.limit >= 1000
                ? `${(item.limit / 1000).toFixed(0)}k`
                : item.limit.toString()

            return (
              <div key={item.name} className='space-y-1'>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2'>
                    <item.icon className='h-3.5 w-3.5 text-muted-foreground' />
                    <span>{item.name}</span>
                  </div>
                  <span className='text-muted-foreground'>
                    {formattedUsed} / {formattedLimit}
                  </span>
                </div>
                <UsageMeterBar className='h-1.5' percentage={percentage} />
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
