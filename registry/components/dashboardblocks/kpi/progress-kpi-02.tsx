'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { ClipboardList } from 'lucide-react'

import { Card, CardContent, CardTitle } from '@/components/ui/card'

interface ProgressKPIBar {
  label: string
  target: string
  percentage: number
  fillClassName?: string
  trackClassName?: string
}

interface ProgressKPI2Props {
  title?: string
  value?: number
  progressBars?: ProgressKPIBar[]
}

export const ProgressKPI2 = ({
  title = 'Task Completion',
  value = 87,
  progressBars = [
    {
      label: 'completed',
      target: '51 tasks',
      percentage: 59,
      fillClassName: 'bg-green-600',
    },
    {
      label: 'in progress',
      target: '26 tasks',
      percentage: 30,
      fillClassName: 'bg-blue-600',
    },
    {
      label: 'not started',
      target: '10 tasks',
      percentage: 11,
      fillClassName: 'bg-red-600',
    },
  ],
}: ProgressKPI2Props) => {
  return (
    <Card>
      <CardContent className='space-y-1'>
        <div className='flex items-center justify-between'>
          <CardTitle>{title}</CardTitle>
          <Icon icon={ClipboardList} variant='secondary' />
        </div>
        <KPIValue>
          <AnimatedNumber
            value={value}
            formatter={(value) => `${value.toLocaleString()}/100`}
          />
        </KPIValue>
        <div className='mt-5 space-y-3'>
          {progressBars.map((bar) => {
            const safePercentage = Number.isFinite(bar.percentage) ? bar.percentage : 0
            const normalized = Math.min(100, Math.max(0, safePercentage))

            return (
              <div key={bar.label} className='space-y-1.5 text-sm text-muted-foreground'>
                <div className='flex items-center justify-between'>
                  <span>
                    <span className='font-semibold text-foreground'>
                      {Math.round(normalized)}%
                    </span>{' '}
                    {bar.label}
                  </span>
                  <span className='font-semibold text-foreground'>{bar.target}</span>
                </div>
                <ProgressBar
                  className={bar.trackClassName}
                  fillClassName={bar.fillClassName}
                  percentage={bar.percentage}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
