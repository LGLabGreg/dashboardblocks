'use client'

import { Icon } from '@/registry/components/dashboardblocks/icon'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  Progress,
  type ProgressProps,
} from '@/registry/components/dashboardblocks/progress'
import { ClipboardList } from 'lucide-react'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface ProgressKPI2Props {
  title?: string
  value?: string
  progressBars?: ProgressProps[]
}

export const ProgressKPI2 = ({
  title = 'Task Completion',
  value = '87/100',
  progressBars = [
    {
      label: 'completed',
      target: '51 tasks',
      percentage: 59,
      progressClassName: '[&>div]:bg-green-600',
    },
    {
      label: 'in progress',
      target: '26 tasks',
      percentage: 30,
      progressClassName: '[&>div]:bg-blue-600',
    },
    {
      label: 'not started',
      target: '10 tasks',
      percentage: 11,
      progressClassName: '[&>div]:bg-red-600',
    },
  ],
}: ProgressKPI2Props) => {
  return (
    <Card>
      <CardContent className='space-y-1'>
        <div className='flex items-center justify-between'>
          <CardDescription>{title}</CardDescription>
          <Icon icon={ClipboardList} />
        </div>
        <KPIValue>{value}</KPIValue>
        <div className='space-y-3 mt-5'>
          {progressBars.map((bar) => (
            <Progress key={bar.label} {...bar} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
