'use client'

import {
  AddFilterMenu,
  CompareToggle,
  DashboardHeaderTitle,
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
  type Filter,
  FilterChip,
  type FilterField,
  getDateRange,
  getPreviousRange,
  isSameFilter,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatDateRange } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'

interface DashboardHeader1Props {
  defaultFilters?: Filter[]
  defaultPreset?: DateRangePreset
  filterFields: FilterField[]
  onExport?: (format: string) => void
  title: string
  /** The last day of every date range preset. */
  today: Date
}

const exampleProps: DashboardHeader1Props = {
  defaultFilters: [
    { field: 'Region', value: 'Europe' },
    { field: 'Plan', value: 'Pro' },
  ],
  defaultPreset: '30d',
  filterFields: [
    { field: 'Region', values: ['North America', 'Europe', 'Asia Pacific'] },
    { field: 'Plan', values: ['Free', 'Pro', 'Enterprise'] },
    { field: 'Channel', values: ['Organic', 'Paid search', 'Referral'] },
  ],
  title: 'Overview',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const DashboardHeader1 = (props: DashboardHeader1Props) => {
  const {
    defaultFilters = [],
    defaultPreset = '30d',
    filterFields,
    onExport = () => {},
    title,
    today,
  } = props
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset)
  const [compare, setCompare] = useState(true)
  const [filters, setFilters] = useState<Filter[]>(defaultFilters)

  const range = getDateRange(preset, today)
  const toggleFilter = (filter: Filter, checked: boolean) =>
    setFilters((current) =>
      checked
        ? [...current, filter]
        : current.filter((item) => !isSameFilter(item, filter)),
    )

  return (
    <header className='@container flex flex-col gap-3'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <DashboardHeaderTitle title={title} />
          <div className='flex items-center gap-3'>
            <CompareToggle checked={compare} onCheckedChange={setCompare} />
            <ExportMenu onExport={onExport} />
          </div>
        </div>
        <p className='text-muted-foreground leading-relaxed'>
          Showing{' '}
          <DateRangePicker
            onValueChange={setPreset}
            today={today}
            value={preset}
            variant='inline'
          />
          <span aria-live='polite'>
            , {formatDateRange(range)}
            {compare && `, compared with ${formatDateRange(getPreviousRange(range))}`}.
          </span>
        </p>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        {filters.length > 0 && (
          <ul aria-label='Active filters' className='flex flex-wrap items-center gap-2'>
            {filters.map((filter) => (
              <li key={`${filter.field}-${filter.value}`} className='flex'>
                <FilterChip
                  field={filter.field}
                  value={filter.value}
                  onRemove={() => toggleFilter(filter, false)}
                />
              </li>
            ))}
          </ul>
        )}
        <AddFilterMenu
          fields={filterFields}
          onFilterChange={toggleFilter}
          value={filters}
        >
          <IconPlaceholder
            lucide='PlusIcon'
            tabler='IconPlus'
            hugeicons='PlusSignIcon'
            phosphor='PlusIcon'
            remixicon='RiAddLine'
          />
          Add filter
        </AddFilterMenu>
      </div>
    </header>
  )
}

export {
  DashboardHeader1,
  exampleProps as dashboardHeader1ExampleProps,
  type DashboardHeader1Props,
}
