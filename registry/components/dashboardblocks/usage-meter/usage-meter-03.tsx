import { UsageMeterBar } from '@/registry/components/dashboardblocks/usage-meter'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

interface ResourceUsage {
  limit: number
  name: string
  unit: string
  used: number
}

export const UsageMeter3 = ({
  className = '',
  resources = [
    { name: 'CPU', used: 45, limit: 100, unit: '%' },
    { name: 'Memory', used: 6.2, limit: 8, unit: 'GB' },
    { name: 'Bandwidth', used: 847, limit: 1000, unit: 'GB' },
  ],
  title = 'Resource Usage',
}: {
  className?: string
  resources?: ResourceUsage[]
  title?: string
} = {}) => {
  return (
    <Card className={className}>
      <CardContent className='space-y-4'>
        <CardTitle className='text-base font-medium'>{title}</CardTitle>
        <div className='space-y-4'>
          {resources.map((resource) => {
            const percentage = (resource.used / resource.limit) * 100
            return (
              <div key={resource.name} className='space-y-1.5'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium'>{resource.name}</span>
                  <span className='text-muted-foreground'>
                    {resource.used.toLocaleString()} / {resource.limit.toLocaleString()}{' '}
                    {resource.unit}
                  </span>
                </div>
                <UsageMeterBar percentage={percentage} />
              </div>
            )
          })}
        </div>
        <CardDescription>Updated just now</CardDescription>
      </CardContent>
    </Card>
  )
}
