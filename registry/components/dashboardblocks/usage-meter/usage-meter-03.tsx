import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

interface ResourceUsage {
  limit: number
  name: string
  unit: string
  used: number
}

export const UsageMeter3 = ({
  resources = [
    { name: 'CPU', used: 45, limit: 100, unit: '%' },
    { name: 'Memory', used: 6.2, limit: 8, unit: 'GB' },
    { name: 'Bandwidth', used: 847, limit: 1000, unit: 'GB' },
  ],
  title = 'Resource Usage',
}: {
  resources?: ResourceUsage[]
  title?: string
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-4'>
        <CardTitle className='text-base font-medium'>{title}</CardTitle>
        <div className='space-y-4'>
          {resources.map((resource) => {
            const percentage = (resource.used / resource.limit) * 100
            const safePercentage = Number.isFinite(percentage) ? percentage : 0
            const normalized = Math.min(100, Math.max(0, safePercentage))
            const fillClassName =
              normalized >= 95
                ? 'bg-destructive'
                : normalized >= 80
                  ? 'bg-amber-500'
                  : undefined
            return (
              <div key={resource.name} className='space-y-1'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium'>{resource.name}</span>
                  <span className='text-muted-foreground'>
                    {resource.used.toLocaleString()} / {resource.limit.toLocaleString()}{' '}
                    {resource.unit}
                  </span>
                </div>
                <ProgressBar percentage={percentage} fillClassName={fillClassName} />
              </div>
            )
          })}
        </div>
        <CardDescription className='text-xs'>Updated just now</CardDescription>
      </CardContent>
    </Card>
  )
}
