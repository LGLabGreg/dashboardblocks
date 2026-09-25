'use client'

import {
  CompareToggle,
  DashboardHeaderTitle,
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
  FilterChip,
  formatDateRange,
  getDateRange,
  getPreviousRange,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Filter {
  field: string
  value: string
}

interface FilterField {
  field: string
  values: string[]
}

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

const isSameFilter = (a: Filter, b: Filter) => a.field === b.field && a.value === b.value

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
    <header className='@container'>
      <div className='flex flex-wrap items-center gap-x-3 gap-y-4'>
        <DashboardHeaderTitle
          className='order-1 flex-1 @4xl:flex-none'
          title={title}
          description={
            <span aria-live='polite'>
              {formatDateRange(range)}
              {compare && ` vs ${formatDateRange(getPreviousRange(range))}`}
            </span>
          }
        />
        <div className='order-3 flex basis-full flex-wrap items-center gap-2 @4xl:order-2 @4xl:flex-1 @4xl:basis-auto @4xl:justify-end'>
          <DateRangePicker onValueChange={setPreset} today={today} value={preset} />
          <CompareToggle
            checked={compare}
            onCheckedChange={setCompare}
            className='px-1'
          />
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
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant='ghost' size='sm' />}>
              <PlusIcon />
              Add filter
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-auto min-w-48'>
              {filterFields.map(({ field, values }, index) => (
                <DropdownMenuGroup key={field}>
                  {index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel>{field}</DropdownMenuLabel>
                  {values.map((value) => (
                    <DropdownMenuCheckboxItem
                      key={value}
                      checked={filters.some((item) =>
                        isSameFilter(item, { field, value }),
                      )}
                      onCheckedChange={(checked) =>
                        toggleFilter({ field, value }, checked)
                      }
                    >
                      {value}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ExportMenu className='order-2 @4xl:order-3' onExport={onExport} />
      </div>
    </header>
  )
}

export {
  DashboardHeader1,
  exampleProps as dashboardHeader1ExampleProps,
  type DashboardHeader1Props,
}
