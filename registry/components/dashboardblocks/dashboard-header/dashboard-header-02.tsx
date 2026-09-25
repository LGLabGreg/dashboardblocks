'use client'

import {
  DashboardHeaderTitle,
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { useState } from 'react'

interface DashboardHeader2Props {
  defaultPreset?: DateRangePreset
  onExport?: (format: string) => void
  title: string
  /** The last day of every date range preset. */
  today: Date
}

const exampleProps: DashboardHeader2Props = {
  defaultPreset: '7d',
  title: 'Revenue',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const DashboardHeader2 = (props: DashboardHeader2Props) => {
  const { defaultPreset = '7d', onExport = () => {}, title, today } = props
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset)

  return (
    <header className='@container'>
      <div className='flex flex-col gap-3 @lg:flex-row @lg:items-center @lg:justify-between'>
        <DashboardHeaderTitle title={title} />
        <div className='flex items-center gap-2'>
          <DateRangePicker
            className='flex-1 @lg:flex-none'
            onValueChange={setPreset}
            today={today}
            value={preset}
          />
          <ExportMenu onExport={onExport} />
        </div>
      </div>
    </header>
  )
}

export {
  DashboardHeader2,
  exampleProps as dashboardHeader2ExampleProps,
  type DashboardHeader2Props,
}
