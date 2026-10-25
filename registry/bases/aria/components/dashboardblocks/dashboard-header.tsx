// Override of registry/components/dashboardblocks/dashboard-header.tsx for React Aria
// source-hash: 54a70a5ccc21

'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatDateRange } from '@/registry/lib/dashboardblocks/format'
import { Fragment, type ReactNode, useId } from 'react'
import { Button as AriaButton } from 'react-aria-components'

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

const DATE_RANGE_PRESETS: {
  days: number
  label: string
  value: DateRangePreset
}[] = [
  { days: 1, label: 'Today', value: 'today' },
  { days: 7, label: 'Last 7 days', value: '7d' },
  { days: 30, label: 'Last 30 days', value: '30d' },
  { days: 90, label: 'Last 90 days', value: '90d' },
]

const DAY = 86_400_000

function getPreset(preset: DateRangePreset) {
  return DATE_RANGE_PRESETS.find((item) => item.value === preset) ?? DATE_RANGE_PRESETS[0]
}

function getDateRange(preset: DateRangePreset, today: Date): DateRange {
  const { days } = getPreset(preset)
  return { end: today, start: new Date(today.getTime() - (days - 1) * DAY) }
}

function getPreviousRange(range: DateRange): DateRange {
  const length = range.end.getTime() - range.start.getTime()
  const end = new Date(range.start.getTime() - DAY)
  return { end, start: new Date(end.getTime() - length) }
}

interface DateRangePickerProps {
  className?: string
  onValueChange: (value: DateRangePreset) => void
  /** The ranges to offer, in order. @default every preset */
  presets?: DateRangePreset[]
  /** `sm` lines the button up with small buttons beside it, such as filters. @default 'default' */
  size?: 'default' | 'sm'
  today: Date
  value: DateRangePreset
  /** `inline` draws the trigger as underlined text, to sit inside a sentence. */
  variant?: 'button' | 'inline'
}

const inlineTrigger =
  'text-foreground decoration-muted-foreground/60 hover:decoration-foreground focus-visible:ring-ring/50 inline-flex items-center gap-0.5 rounded-sm font-medium underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-3 [&_svg]:size-3.5 [&_svg]:opacity-60'

function DateRangePicker({
  className,
  onValueChange,
  presets,
  size = 'default',
  today,
  value,
  variant = 'button',
}: DateRangePickerProps) {
  const options = presets
    ? DATE_RANGE_PRESETS.filter((preset) => presets.includes(preset.value))
    : DATE_RANGE_PRESETS
  const chevron = (
    <IconPlaceholder
      lucide='ChevronDownIcon'
      tabler='IconChevronDown'
      hugeicons='ArrowDownIcon'
      phosphor='CaretDownIcon'
      remixicon='RiArrowDownSLine'
      className='text-muted-foreground ml-auto'
    />
  )
  const label = getPreset(value).label
  return (
    <DropdownMenuTrigger>
      {variant === 'inline' ? (
        <AriaButton
          className={cn(inlineTrigger, className)}
          aria-label={`Date range: ${label}`}
        >
          {label.toLowerCase()}
          {chevron}
        </AriaButton>
      ) : (
        <Button
          variant='outline'
          size={size}
          className={cn('justify-start', className)}
          aria-label={`Date range: ${label}`}
        >
          <IconPlaceholder
            lucide='CalendarIcon'
            tabler='IconCalendar'
            hugeicons='CalendarIcon'
            phosphor='CalendarBlankIcon'
            remixicon='RiCalendarLine'
            className='text-muted-foreground'
          />
          {label}
          {chevron}
        </Button>
      )}
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
          {options.map((preset) => (
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
  /** `inline` reads as words, such as "region Europe", to sit inside a sentence. */
  variant?: 'chip' | 'inline'
}

function FilterChip({
  className,
  field,
  onRemove,
  value,
  variant = 'chip',
}: FilterChipProps) {
  if (variant === 'inline')
    return (
      <span className={cn('whitespace-nowrap', className)}>
        {field.toLowerCase()} <span className='text-foreground font-medium'>{value}</span>
        <button
          type='button'
          onClick={onRemove}
          aria-label={`Remove filter ${field}: ${value}`}
          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 ml-0.5 inline-flex size-5 translate-y-0.5 items-center justify-center rounded-sm outline-none focus-visible:ring-3'
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

  return (
    <span
      className={cn(
        'bg-muted inline-flex h-7 items-center gap-1 rounded-full pr-0.5 pl-3 text-xs',
        className,
      )}
    >
      <span>{field}:</span>
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

const ALL_OPTIONS = '__all__'

interface FilterMenuProps {
  allLabel: string
  children: ReactNode
  className?: string
  label: string
  onValueChange: (value: string | null) => void
  options: string[]
  value: string | null
}

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
  children: ReactNode
  className?: string
  fields: FilterField[]
  onFilterChange: (filter: Filter, active: boolean) => void
  value: Filter[]
}

const isSameFilter = (a: Filter, b: Filter) => a.field === b.field && a.value === b.value

const filterKey = (filter: Filter) => JSON.stringify([filter.field, filter.value])

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
  /** Set while there's no data to export, such as when it's loading. */
  disabled?: boolean
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
  disabled = false,
  formats = DEFAULT_EXPORT_FORMATS,
  onExport,
}: ExportMenuProps) {
  return (
    <DropdownMenuTrigger>
      <Button variant='outline' className={className} isDisabled={disabled}>
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
      <h2 className='text-2xl font-semibold tracking-tight'>{title}</h2>
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
