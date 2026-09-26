// Override of registry/components/dashboardblocks/dashboard-header.tsx for React Aria
// source-hash: c84bd12f41c2

'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { Fragment, type ReactNode, useId } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'

import { cn } from '@/lib/utils'

type DateRangePreset = 'today' | '7d' | '30d' | '90d'

interface DateRange {
  end: Date
  start: Date
}

const DATE_RANGE_PRESETS: { days: number; label: string; value: DateRangePreset }[] = [
  { days: 1, label: 'Today', value: 'today' },
  { days: 7, label: 'Last 7 days', value: '7d' },
  { days: 30, label: 'Last 30 days', value: '30d' },
  { days: 90, label: 'Last 90 days', value: '90d' },
]

const DAY = 86_400_000

function getPreset(preset: DateRangePreset) {
  return DATE_RANGE_PRESETS.find((item) => item.value === preset) ?? DATE_RANGE_PRESETS[0]
}

/** The preset's range, ending on (and including) `today`. */
function getDateRange(preset: DateRangePreset, today: Date): DateRange {
  const { days } = getPreset(preset)
  return { end: today, start: new Date(today.getTime() - (days - 1) * DAY) }
}

/** The range of the same length that ends the day before `range` starts. */
function getPreviousRange(range: DateRange): DateRange {
  const length = range.end.getTime() - range.start.getTime()
  const end = new Date(range.start.getTime() - DAY)
  return { end, start: new Date(end.getTime() - length) }
}

const rangeFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

/** "Sep 19 – 25" or "Aug 27 – Sep 25". */
function formatDateRange(range: DateRange) {
  return rangeFormatter.formatRange(range.start, range.end)
}

interface DateRangePickerProps {
  className?: string
  onValueChange: (value: DateRangePreset) => void
  /** The last day of every preset. */
  today: Date
  value: DateRangePreset
}

/** A menu of date range presets. Each row shows the dates it covers. */
function DateRangePicker({
  className,
  onValueChange,
  today,
  value,
}: DateRangePickerProps) {
  return (
    <DropdownMenuTrigger>
      <Button
        variant='outline'
        className={cn('justify-start', className)}
        aria-label={`Date range: ${getPreset(value).label}`}
      >
        <IconPlaceholder
          lucide='CalendarIcon'
          tabler='IconCalendar'
          hugeicons='CalendarIcon'
          phosphor='CalendarBlankIcon'
          remixicon='RiCalendarLine'
          className='text-muted-foreground'
        />
        {getPreset(value).label}
        <IconPlaceholder
          lucide='ChevronDownIcon'
          tabler='IconChevronDown'
          hugeicons='ArrowDownIcon'
          phosphor='CaretDownIcon'
          remixicon='RiArrowDownSLine'
          className='text-muted-foreground ml-auto'
        />
      </Button>
      <DropdownMenu
        className='w-auto min-w-56'
        selectionMode='single'
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys) => {
          const [next] = keys === 'all' ? [] : [...keys]
          if (next !== undefined) onValueChange(next as DateRangePreset)
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Date range</DropdownMenuLabel>
          {DATE_RANGE_PRESETS.map((preset) => (
            <DropdownMenuItem
              key={preset.value}
              id={preset.value}
              textValue={preset.label}
            >
              <span className='flex flex-1 items-center justify-between gap-4'>
                {preset.label}
                <span className='text-muted-foreground text-xs'>
                  {formatDateRange(getDateRange(preset.value, today))}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

interface CompareToggleProps {
  checked: boolean
  className?: string
  /** @default 'Compare' */
  label?: string
  onCheckedChange: (checked: boolean) => void
}

/** A switch with a visible label for comparing against the previous period. */
function CompareToggle({
  checked,
  className,
  label = 'Compare',
  onCheckedChange,
}: CompareToggleProps) {
  const labelId = useId()
  return (
    <div
      className={cn(
        'flex min-h-9 items-center gap-2 text-sm font-medium whitespace-nowrap',
        className,
      )}
    >
      <Switch aria-labelledby={labelId} isSelected={checked} onChange={onCheckedChange} />
      <span id={labelId}>{label}</span>
    </div>
  )
}

interface FilterChipProps {
  className?: string
  field: string
  onRemove: () => void
  value: string
}

/** An active filter, such as "Region: Europe", with a button to remove it. */
function FilterChip({ className, field, onRemove, value }: FilterChipProps) {
  return (
    <span
      className={cn(
        'bg-muted inline-flex h-7 items-center gap-1 rounded-full pr-0.5 pl-3 text-xs',
        className,
      )}
    >
      <span className='text-muted-foreground'>{field}:</span>
      <span className='font-medium'>{value}</span>
      <button
        type='button'
        onClick={onRemove}
        aria-label={`Remove filter ${field}: ${value}`}
        className='text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-ring/50 flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-3'
      >
        <IconPlaceholder
          lucide='XIcon'
          tabler='IconX'
          hugeicons='Cancel01Icon'
          phosphor='XIcon'
          remixicon='RiCloseLine'
          className='size-3.5'
        />
      </button>
    </span>
  )
}

interface Filter {
  field: string
  value: string
}

interface FilterField {
  field: string
  values: string[]
}

/** The value of the option that clears a `FilterMenu`. */
const ALL_OPTIONS = '__all__'

interface FilterMenuProps {
  /** The option that clears the filter, such as "All regions". */
  allLabel: string
  /** The trigger's content. */
  children: ReactNode
  className?: string
  /** The heading above the options. */
  label: string
  onValueChange: (value: string | null) => void
  options: string[]
  /** The selected option, or `null` for all. */
  value: string | null
}

/** A menu that filters by one field, with an option to clear it. */
function FilterMenu({
  allLabel,
  children,
  className,
  label,
  onValueChange,
  options,
  value,
}: FilterMenuProps) {
  return (
    <DropdownMenuTrigger>
      <Button variant='ghost' size='sm' className={className}>
        {children}
      </Button>
      <DropdownMenu
        className='w-auto min-w-48'
        selectionMode='single'
        disallowEmptySelection
        selectedKeys={[value ?? ALL_OPTIONS]}
        onSelectionChange={(keys) => {
          const [next] = keys === 'all' ? [] : [...keys]
          if (next !== undefined)
            onValueChange(next === ALL_OPTIONS ? null : String(next))
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuItem id={ALL_OPTIONS}>{allLabel}</DropdownMenuItem>
          {options.map((option) => (
            <DropdownMenuItem key={option} id={option}>
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

interface AddFilterMenuProps {
  /** The trigger's content. */
  children: ReactNode
  className?: string
  fields: FilterField[]
  onFilterChange: (filter: Filter, active: boolean) => void
  /** The active filters. */
  value: Filter[]
}

const isSameFilter = (a: Filter, b: Filter) => a.field === b.field && a.value === b.value

/** A menu key for a filter. Keys must be unique across every field. */
const filterKey = (filter: Filter) => JSON.stringify([filter.field, filter.value])

/** A menu of every field and its values. Each value toggles a filter. */
function AddFilterMenu({
  children,
  className,
  fields,
  onFilterChange,
  value,
}: AddFilterMenuProps) {
  const selected = new Set(value.map(filterKey))
  return (
    <DropdownMenuTrigger>
      <Button variant='ghost' size='sm' className={className}>
        {children}
      </Button>
      <DropdownMenu
        className='w-auto min-w-48'
        selectionMode='multiple'
        selectedKeys={selected}
        onSelectionChange={(keys) => {
          for (const { field, values } of fields) {
            for (const option of values) {
              const filter = { field, value: option }
              const key = filterKey(filter)
              const active = keys === 'all' || keys.has(key)
              if (active !== selected.has(key)) onFilterChange(filter, active)
            }
          }
        }}
      >
        {fields.map(({ field, values }, index) => (
          <Fragment key={field}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel>{field}</DropdownMenuLabel>
              {values.map((option) => (
                <DropdownMenuItem key={option} id={filterKey({ field, value: option })}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </Fragment>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

interface ExportFormat {
  label: string
  value: string
}

interface ExportMenuProps {
  className?: string
  /** @default CSV and PNG */
  formats?: ExportFormat[]
  onExport: (format: string) => void
}

const DEFAULT_EXPORT_FORMATS: ExportFormat[] = [
  { label: 'Export as CSV', value: 'csv' },
  { label: 'Export as PNG', value: 'png' },
]

function ExportMenu({
  className,
  formats = DEFAULT_EXPORT_FORMATS,
  onExport,
}: ExportMenuProps) {
  return (
    <DropdownMenuTrigger>
      <Button variant='outline' className={className}>
        <IconPlaceholder
          lucide='DownloadIcon'
          tabler='IconDownload'
          hugeicons='Download01Icon'
          phosphor='DownloadIcon'
          remixicon='RiDownloadLine'
          className='text-muted-foreground'
        />
        Export
        <IconPlaceholder
          lucide='ChevronDownIcon'
          tabler='IconChevronDown'
          hugeicons='ArrowDownIcon'
          phosphor='CaretDownIcon'
          remixicon='RiArrowDownSLine'
          className='text-muted-foreground'
        />
      </Button>
      <DropdownMenu
        placement='bottom end'
        className='w-auto min-w-40'
        onAction={(key) => onExport(String(key))}
      >
        {formats.map((format) => (
          <DropdownMenuItem key={format.value} id={format.value}>
            {format.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

interface DashboardHeaderTitleProps {
  className?: string
  description?: ReactNode
  title: string
}

function DashboardHeaderTitle({
  className,
  description,
  title,
}: DashboardHeaderTitleProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      <h2 className='text-xl font-semibold tracking-tight'>{title}</h2>
      {description && <p className='text-muted-foreground text-sm'>{description}</p>}
    </div>
  )
}

export {
  AddFilterMenu,
  CompareToggle,
  DATE_RANGE_PRESETS,
  DashboardHeaderTitle,
  DateRangePicker,
  ExportMenu,
  FilterChip,
  FilterMenu,
  formatDateRange,
  getDateRange,
  getPreset,
  getPreviousRange,
  isSameFilter,
}

export type {
  AddFilterMenuProps,
  CompareToggleProps,
  DateRange,
  DateRangePickerProps,
  DateRangePreset,
  ExportFormat,
  ExportMenuProps,
  Filter,
  FilterChipProps,
  FilterField,
  FilterMenuProps,
}
