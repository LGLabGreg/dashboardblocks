'use client'

import {
  CompareToggle,
  DashboardHeaderTitle,
  type DateRangePreset,
  ExportMenu,
  FilterChip,
  formatDateRange,
  getDateRange,
  getPreviousRange,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

interface Filter {
  field: string
  value: string
}

interface DashboardHeader3Props {
  defaultFilters?: Filter[]
  defaultPreset?: DateRangePreset
  onExport?: (format: string) => void
  title: string
  /** The last day of every date range preset. */
  today: Date
}

const exampleProps: DashboardHeader3Props = {
  defaultFilters: [{ field: 'Channel', value: 'Paid search' }],
  defaultPreset: '7d',
  title: 'Acquisition',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const SEGMENTS: { label: string; value: DateRangePreset }[] = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
]

const DashboardHeader3 = (props: DashboardHeader3Props) => {
  const {
    defaultFilters = [],
    defaultPreset = '7d',
    onExport = () => {},
    title,
    today,
  } = props
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset)
  const [compare, setCompare] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)

  const range = getDateRange(preset, today)

  return (
    <header className='@container flex flex-col gap-4'>
      <div className='flex items-start justify-between gap-3'>
        <DashboardHeaderTitle
          title={title}
          description={
            <span aria-live='polite'>
              {formatDateRange(range)}
              {compare && ` vs ${formatDateRange(getPreviousRange(range))}`}
            </span>
          }
        />
        <ExportMenu onExport={onExport} />
      </div>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-3'>
        <ButtonGroup aria-label='Date range' className='w-full @md:w-fit'>
          {SEGMENTS.map((segment) => (
            <Button
              key={segment.value}
              aria-pressed={preset === segment.value}
              className='aria-pressed:bg-muted aria-pressed:text-foreground text-muted-foreground flex-1 @md:flex-none'
              onClick={() => setPreset(segment.value)}
              variant='outline'
            >
              {segment.label}
            </Button>
          ))}
        </ButtonGroup>
        <CompareToggle
          checked={compare}
          label='Compare to previous period'
          onCheckedChange={setCompare}
        />
        {filters.length > 0 && (
          <ul aria-label='Active filters' className='flex flex-wrap items-center gap-2'>
            {filters.map((filter) => (
              <li key={`${filter.field}-${filter.value}`} className='flex'>
                <FilterChip
                  field={filter.field}
                  value={filter.value}
                  onRemove={() =>
                    setFilters((current) => current.filter((item) => item !== filter))
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}

export {
  DashboardHeader3,
  exampleProps as dashboardHeader3ExampleProps,
  type DashboardHeader3Props,
}
