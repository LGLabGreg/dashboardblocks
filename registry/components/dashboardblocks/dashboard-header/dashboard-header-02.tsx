'use client'

import {
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
  getDateRange,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { formatDateRange } from '@/registry/lib/dashboardblocks/format'
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
    <header className='@container flex flex-col gap-1 border-b pb-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 flex-wrap items-baseline gap-x-2'>
          <h2 className='text-2xl font-semibold tracking-tight'>{title}</h2>
          <DateRangePicker
            className='text-muted-foreground hover:text-foreground text-2xl font-light tracking-tight underline-offset-[6px] [&_svg]:size-5'
            onValueChange={setPreset}
            today={today}
            value={preset}
            variant='inline'
          />
        </div>
        <ExportMenu onExport={onExport} />
      </div>
      <p aria-live='polite' className='text-muted-foreground text-sm tabular-nums'>
        {formatDateRange(getDateRange(preset, today))}
      </p>
    </header>
  )
}

export {
  DashboardHeader2,
  exampleProps as dashboardHeader2ExampleProps,
  type DashboardHeader2Props,
}
