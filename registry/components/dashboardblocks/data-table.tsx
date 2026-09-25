'use client'

/* oxlint-disable jsx-a11y/no-redundant-roles, jsx-a11y/no-interactive-element-to-noninteractive-role -- the explicit roles keep table semantics when the stacked layout changes the display */

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ListFilterIcon } from 'lucide-react'
import { type ComponentProps, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

/*
 * Put the table inside an element with `@container/data-table`, usually the
 * card. Below 42rem the table restacks: each row becomes a two-column grid of
 * labelled values. Use `@2xl/data-table:` for controls that only apply to one
 * layout, such as `DataTableSortMenu`. Explicit ARIA roles keep the table
 * semantics when the display changes, which some browsers otherwise drop.
 */

type SortDirection = 'ascending' | 'descending'

interface SortState<K extends string = string> {
  direction: SortDirection
  key: K
}

type SortAccessors<T, K extends string> = Record<K, (row: T) => number | string>

/** Sorts rows by one column. A new column starts high to low for numbers, A to Z for text. */
function useTableSort<T, K extends string>(
  rows: T[],
  accessors: SortAccessors<T, K>,
  initial: SortState<K>,
) {
  const [sort, setSort] = useState<SortState<K>>(initial)

  const accessor = accessors[sort.key]
  const sorted = [...rows].sort((a, b) => {
    const left = accessor(a)
    const right = accessor(b)
    const compared =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right))
    return sort.direction === 'ascending' ? compared : -compared
  })

  const toggleSort = (key: K) =>
    setSort((current) => {
      if (current.key === key) {
        return {
          direction: current.direction === 'ascending' ? 'descending' : 'ascending',
          key,
        }
      }
      const numeric = rows.length > 0 && typeof accessors[key](rows[0]) === 'number'
      return { direction: numeric ? 'descending' : 'ascending', key }
    })

  return { setSort, sort, sorted, toggleSort }
}

function DataTable({ className, ...props }: ComponentProps<'table'>) {
  return (
    <table
      role='table'
      className={cn(
        'w-full border-collapse text-sm @max-2xl/data-table:block',
        className,
      )}
      {...props}
    />
  )
}

function DataTableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      role='rowgroup'
      className={cn('border-b @max-2xl/data-table:sr-only', className)}
      {...props}
    />
  )
}

function DataTableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody
      role='rowgroup'
      className={cn('@max-2xl/data-table:block', className)}
      {...props}
    />
  )
}

function DataTableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      role='row'
      className={cn(
        'border-b last:border-b-0 @max-2xl/data-table:grid @max-2xl/data-table:grid-cols-2 @max-2xl/data-table:gap-x-4 @max-2xl/data-table:gap-y-3 @max-2xl/data-table:px-6 @max-2xl/data-table:py-4',
        className,
      )}
      {...props}
    />
  )
}

type Align = 'start' | 'end'

interface DataTableHeadProps extends Omit<ComponentProps<'th'>, 'align'> {
  align?: Align
}

function DataTableHead({ align = 'start', className, ...props }: DataTableHeadProps) {
  return (
    <th
      role='columnheader'
      scope='col'
      className={cn(
        'text-muted-foreground h-10 px-3 text-xs font-medium whitespace-nowrap first:pl-6 last:pr-6',
        align === 'end' ? 'text-right' : 'text-left',
        className,
      )}
      {...props}
    />
  )
}

interface DataTableSortHeadProps<K extends string> extends Omit<
  DataTableHeadProps,
  'onClick'
> {
  label: string
  onSort: (key: K) => void
  sort: SortState<K>
  sortKey: K
}

/** A column header that sorts the table. Announces its direction through `aria-sort`. */
function DataTableSortHead<K extends string>({
  align = 'start',
  label,
  onSort,
  sort,
  sortKey,
  ...props
}: DataTableSortHeadProps<K>) {
  const active = sort.key === sortKey
  const Icon = !active
    ? ArrowUpDownIcon
    : sort.direction === 'ascending'
      ? ArrowUpIcon
      : ArrowDownIcon

  return (
    <DataTableHead align={align} aria-sort={active ? sort.direction : 'none'} {...props}>
      <button
        type='button'
        onClick={() => onSort(sortKey)}
        className={cn(
          'hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 -mx-2 inline-flex h-7 items-center gap-1 rounded-md px-2 font-medium outline-none focus-visible:ring-3',
          active && 'text-foreground',
          align === 'end' && 'flex-row-reverse',
        )}
      >
        {label}
        <Icon aria-hidden className={cn('size-3.5', !active && 'opacity-50')} />
      </button>
    </DataTableHead>
  )
}

interface DataTableCellProps extends Omit<ComponentProps<'td'>, 'align'> {
  align?: Align
  /** Shown above the value when the table is stacked. */
  label?: string
  /** The row's title cell: spans the full width when stacked, without a label. */
  primary?: boolean
  /** Fills the spare width and truncates long text, in the table layout only. */
  truncate?: boolean
}

function DataTableCell({
  align = 'start',
  className,
  label,
  primary = false,
  truncate = false,
  ...props
}: DataTableCellProps) {
  return (
    <td
      role='cell'
      data-label={label}
      className={cn(
        'h-12 px-3 py-2 align-middle first:pl-6 last:pr-6 @max-2xl/data-table:flex @max-2xl/data-table:h-auto @max-2xl/data-table:min-w-0 @max-2xl/data-table:flex-col @max-2xl/data-table:items-start @max-2xl/data-table:gap-1 @max-2xl/data-table:p-0 @max-2xl/data-table:text-left @max-2xl/data-table:first:pl-0 @max-2xl/data-table:last:pr-0',
        align === 'end' && 'text-right whitespace-nowrap tabular-nums',
        truncate &&
          'w-full max-w-0 truncate @max-2xl/data-table:w-auto @max-2xl/data-table:max-w-none @max-2xl/data-table:whitespace-normal',
        primary
          ? 'font-medium @max-2xl/data-table:col-span-2'
          : '@max-2xl/data-table:before:text-muted-foreground @max-2xl/data-table:before:text-xs @max-2xl/data-table:before:font-normal @max-2xl/data-table:before:content-[attr(data-label)]',
        className,
      )}
      {...props}
    />
  )
}

interface DataTableBarProps {
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  max: number
  value: number
}

/** A thin bar showing a value relative to the column's largest. Decorative: keep the value as text. */
function DataTableBar({
  className,
  color = 'var(--chart-1)',
  max,
  value,
}: DataTableBarProps) {
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  return (
    <span
      aria-hidden
      className={cn(
        'bg-muted block h-1.5 w-full overflow-hidden rounded-full',
        className,
      )}
    >
      <span
        className='block h-full rounded-full'
        style={{ backgroundColor: color, width: `${share * 100}%` }}
      />
    </span>
  )
}

interface DataTableSortMenuProps<K extends string> {
  className?: string
  columns: { key: K; label: string }[]
  onSortChange: (sort: SortState<K>) => void
  sort: SortState<K>
}

/** Sort controls for the stacked layout, where column headers are hidden. */
function DataTableSortMenu<K extends string>({
  className,
  columns,
  onSortChange,
  sort,
}: DataTableSortMenuProps<K>) {
  const current = columns.find((column) => column.key === sort.key)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant='outline' size='sm' className={className} />}
      >
        <ListFilterIcon className='text-muted-foreground' />
        Sort: {current?.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-auto min-w-44'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort.key}
            onValueChange={(key) => onSortChange({ ...sort, key: key as K })}
          >
            {columns.map((column) => (
              <DropdownMenuRadioItem key={column.key} value={column.key} closeOnClick>
                {column.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Order</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort.direction}
            onValueChange={(direction) =>
              onSortChange({ ...sort, direction: direction as SortDirection })
            }
          >
            <DropdownMenuRadioItem value='descending' closeOnClick>
              High to low
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='ascending' closeOnClick>
              Low to high
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface DataTablePaginationProps {
  className?: string
  onPageChange: (page: number) => void
  /** Zero-based. */
  page: number
  pageSize: number
  total: number
}

function DataTablePagination({
  className,
  onPageChange,
  page,
  pageSize,
  total,
}: DataTablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : page * pageSize + 1
  const to = Math.min(total, (page + 1) * pageSize)

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <p className='text-muted-foreground text-xs tabular-nums' aria-live='polite'>
        {from}–{to} of {total}
      </p>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={page >= pageCount - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export {
  DataTable,
  DataTableBar,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTablePagination,
  DataTableRow,
  DataTableSortHead,
  DataTableSortMenu,
  useTableSort,
}

export type {
  DataTableBarProps,
  DataTableCellProps,
  DataTablePaginationProps,
  DataTableSortMenuProps,
  SortAccessors,
  SortDirection,
  SortState,
}
