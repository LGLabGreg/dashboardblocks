'use client'

import { CalendarIcon, ChevronDownIcon, DownloadIcon, XIcon } from 'lucide-react'
import { type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            className={cn('justify-start', className)}
            aria-label={`Date range: ${getPreset(value).label}`}
          />
        }
      >
        <CalendarIcon className='text-muted-foreground' />
        {getPreset(value).label}
        <ChevronDownIcon className='text-muted-foreground ml-auto' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-auto min-w-56'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Date range</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onValueChange(next as DateRangePreset)}
          >
            {DATE_RANGE_PRESETS.map((preset) => (
              <DropdownMenuRadioItem key={preset.value} closeOnClick value={preset.value}>
                <span className='flex flex-1 items-center justify-between gap-4'>
                  {preset.label}
                  <span className='text-muted-foreground text-xs'>
                    {formatDateRange(getDateRange(preset.value, today))}
                  </span>
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
  return (
    <label
      className={cn(
        'flex min-h-9 cursor-pointer items-center gap-2 text-sm font-medium whitespace-nowrap',
        className,
      )}
    >
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
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
        <XIcon className='size-3.5' />
      </button>
    </span>
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
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant='outline' className={className} />}>
        <DownloadIcon className='text-muted-foreground' />
        Export
        <ChevronDownIcon className='text-muted-foreground' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-auto min-w-40'>
        {formats.map((format) => (
          <DropdownMenuItem key={format.value} onClick={() => onExport(format.value)}>
            {format.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
  CompareToggle,
  DATE_RANGE_PRESETS,
  DashboardHeaderTitle,
  DateRangePicker,
  ExportMenu,
  FilterChip,
  formatDateRange,
  getDateRange,
  getPreset,
  getPreviousRange,
}

export type {
  CompareToggleProps,
  DateRange,
  DateRangePickerProps,
  DateRangePreset,
  ExportFormat,
  ExportMenuProps,
  FilterChipProps,
}
