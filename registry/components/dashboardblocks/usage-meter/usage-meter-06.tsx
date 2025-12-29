'use client'
import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
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
  limits = [
    { name: 'Team members', used: 4, limit: 5, icon: Users },
    { name: 'API calls', used: 8500, limit: 10000, icon: Zap },
    { name: 'Storage', used: 4.9, limit: 5, icon: Database },
    { name: 'Emails sent', used: 450, limit: 1000, icon: Mail },
  ],
  plan = 'Pro',
}: {
  limits?: PlanLimit[]
  plan?: string
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-6'>
        <div className='flex items-center gap-2'>
          <Icon icon={Crown} size='md' />
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
                  <div className='flex items-center gap-2'>
                    <item.icon className='h-3.5 w-3.5' />
                    <span>{item.name}</span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    <AnimatedNumber
                      value={item.used}
                      formatter={(value) => value.toLocaleString()}
                    />{' '}
                    / {formattedLimit}
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
