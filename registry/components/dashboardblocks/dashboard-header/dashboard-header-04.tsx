'use client'

import {
  CompareToggle,
  DashboardHeaderTitle,
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface DashboardHeader4Props {
  defaultPreset?: DateRangePreset
  description: string
  /** When the data was last updated, for example "5 min ago". */
  lastUpdated: string
  onExport?: (format: string) => void
  onRefresh?: () => Promise<void>
  title: string
  /** The last day of every date range preset. */
  today: Date
}

const exampleProps: DashboardHeader4Props = {
  defaultPreset: '30d',
  description: 'Subscriptions, revenue and churn across all plans.',
  lastUpdated: '5 min ago',
  onRefresh: () => new Promise((resolve) => setTimeout(resolve, 1200)),
  title: 'Subscriptions',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const DashboardHeader4 = (props: DashboardHeader4Props) => {
  const {
    defaultPreset = '30d',
    description,
    lastUpdated,
    onExport = () => {},
    onRefresh = async () => {},
    title,
    today,
  } = props
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset)
  const [compare, setCompare] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updated, setUpdated] = useState(lastUpdated)

  const refresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh()
      setUpdated('just now')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <header className='@container'>
      <div className='flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between'>
        <div className='flex flex-col gap-2'>
          <DashboardHeaderTitle title={title} description={description} />
          <div className='text-muted-foreground flex items-center gap-1 text-xs'>
            <span aria-live='polite'>
              {refreshing ? 'Refreshing…' : `Updated ${updated}`}
            </span>
            <Button
              className='text-muted-foreground'
              disabled={refreshing}
              onClick={refresh}
              size='xs'
              variant='ghost'
            >
              <RefreshCwIcon className={cn(refreshing && 'motion-safe:animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <CompareToggle
            checked={compare}
            onCheckedChange={setCompare}
            className='basis-full @md:mr-2 @md:basis-auto'
          />
          <DateRangePicker onValueChange={setPreset} today={today} value={preset} />
          <ExportMenu onExport={onExport} />
        </div>
      </div>
    </header>
  )
}

export {
  DashboardHeader4,
  exampleProps as dashboardHeader4ExampleProps,
  type DashboardHeader4Props,
}
