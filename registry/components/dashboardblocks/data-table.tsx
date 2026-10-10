'use client'

/* oxlint-disable jsx-a11y/no-redundant-roles, jsx-a11y/no-interactive-element-to-noninteractive-role -- the explicit roles keep table semantics when the stacked layout changes the display */

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type CellData,
  type Column,
  type ColumnDef,
  type Header,
  type ReactTable,
  type Row,
  type RowData,
  type Table,
  type TableOptions,
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  constructFilterFn,
  createColumnHelper,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  flexRender,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { type ComponentProps, type ReactNode, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

/*
 * Put the table inside an element with `@container/data-table`, usually the
 * card. Below 42rem the table restacks: each row becomes a two-column grid of
 * labelled values. Use `@2xl/data-table:` for controls that only apply to one
 * layout, such as `DataTableSortMenu`. Explicit ARIA roles keep the table
 * semantics when the display changes, which some browsers otherwise drop.
 */

function DataTable({ className, ...props }: ComponentProps<'table'>) {
  return (
    <table
      role='table'
      data-slot='data-table'
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
        'data-[state=selected]:bg-muted/50 border-b last:border-b-0 @max-2xl/data-table:grid @max-2xl/data-table:grid-cols-2 @max-2xl/data-table:gap-x-4 @max-2xl/data-table:gap-y-3 @max-2xl/data-table:px-6 @max-2xl/data-table:py-4',
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

interface DataTableCellProps extends Omit<ComponentProps<'td'>, 'align'> {
  align?: Align
  label?: string
  primary?: boolean
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
          'w-full max-w-0 truncate @max-2xl/data-table:w-auto @max-2xl/data-table:max-w-none @max-2xl/data-table:items-stretch @max-2xl/data-table:whitespace-normal',
        primary && 'font-medium @max-2xl/data-table:col-span-2',
        !primary &&
          label &&
          '@max-2xl/data-table:before:text-muted-foreground @max-2xl/data-table:before:text-xs @max-2xl/data-table:before:font-normal @max-2xl/data-table:before:content-[attr(data-label)]',
        className,
      )}
      {...props}
    />
  )
}

interface DataTableBarProps {
  className?: string
  /** @default 'var(--chart-2)' */
  color?: string
  max: number
  value: number
}

function DataTableBar({
  className,
  color = 'var(--chart-2)',
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

interface DataTableColumnMeta {
  /** @default 'start' */
  align?: Align
  cellClassName?: string
  headerClassName?: string
  hideLabelWhenStacked?: boolean
  label?: string
  primary?: boolean
  /**
   * Names each order in the sort menu, such as `{ asc: 'Oldest first', desc: 'Newest first' }` for dates.
   * @default Oldest first and Newest first for a `Date` or ISO date string (a date held as a timestamp number needs these), A to Z and Z to A for text, high to low and low to high otherwise
   */
  sortLabels?: { asc: string; desc: string }
  truncate?: boolean
}

const filterFn_oneOf = constructFilterFn({
  autoRemove: (value: unknown[] | undefined) => !value?.length,
  filter: (dataValue: unknown, filterValue: unknown[]) => {
    const wanted = new Set(filterValue.map(String))
    return Array.isArray(dataValue)
      ? dataValue.some((value) => wanted.has(String(value)))
      : wanted.has(String(dataValue))
  },
})

const dataTableFeatures = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
  columnVisibilityFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filterFns: { ...filterFns, oneOf: filterFn_oneOf },
  filteredRowModel: createFilteredRowModel(),
  globalFilteringFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  sortedRowModel: createSortedRowModel(),
})

type DataTableFeatures = typeof dataTableFeatures

type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>

type DataTableColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<DataTableFeatures, TData, TValue>

type DataTableColumn<TData extends RowData> = Column<DataTableFeatures, TData, CellData>

function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

type UseDataTableOptions<TData extends RowData> = Omit<
  TableOptions<DataTableFeatures, TData>,
  'features'
> & {
  pageSize?: number
}

function useDataTable<TData extends RowData>({
  initialState,
  pageSize,
  ...options
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const paginated =
    pageSize !== undefined ||
    initialState?.pagination !== undefined ||
    options.state?.pagination !== undefined

  return useTable({
    enableSortingRemoval: false,
    globalFilterFn: 'includesString',
    manualPagination: !paginated,
    ...options,
    defaultColumn: { filterFn: 'oneOf', ...options.defaultColumn },
    features: dataTableFeatures,
    initialState:
      pageSize === undefined
        ? initialState
        : {
            ...initialState,
            pagination: { pageIndex: 0, ...initialState?.pagination, pageSize },
          },
  })
}

function getColumnLabel<TData extends RowData>(column: DataTableColumn<TData>) {
  const { header, meta } = column.columnDef
  return meta?.label ?? (typeof header === 'string' ? header : column.id)
}

const SORT_DIRECTION = { asc: 'ascending', desc: 'descending' } as const

interface DataTableSortButtonProps<TData extends RowData> {
  className?: string
  column: DataTableColumn<TData>
}

function DataTableSortButton<TData extends RowData>({
  className,
  column,
}: DataTableSortButtonProps<TData>) {
  'use no memo'
  const sorted = column.getIsSorted()
  const iconClassName = cn('size-3.5', !sorted && 'opacity-50')

  return (
    <button
      type='button'
      onClick={column.getToggleSortingHandler()}
      className={cn(
        'hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 -mx-2 inline-flex h-7 items-center gap-1 rounded-md px-2 font-medium outline-none focus-visible:ring-3',
        sorted && 'text-foreground',
        column.columnDef.meta?.align === 'end' && 'flex-row-reverse',
        className,
      )}
    >
      {getColumnLabel(column)}
      {!sorted ? (
        <IconPlaceholder
          lucide='ArrowUpDownIcon'
          tabler='IconArrowsUpDown'
          hugeicons='ArrowUpDownIcon'
          phosphor='ArrowsDownUpIcon'
          remixicon='RiArrowUpDownLine'
          aria-hidden
          className={iconClassName}
        />
      ) : sorted === 'asc' ? (
        <IconPlaceholder
          lucide='ArrowUpIcon'
          tabler='IconArrowUp'
          hugeicons='ArrowUpIcon'
          phosphor='ArrowUpIcon'
          remixicon='RiArrowUpLine'
          aria-hidden
          className={iconClassName}
        />
      ) : (
        <IconPlaceholder
          lucide='ArrowDownIcon'
          tabler='IconArrowDown'
          hugeicons='ArrowDown01Icon'
          phosphor='ArrowDownIcon'
          remixicon='RiArrowDownLine'
          aria-hidden
          className={iconClassName}
        />
      )}
    </button>
  )
}

interface DataTableColumnHeadProps<TData extends RowData> extends Omit<
  DataTableHeadProps,
  'align' | 'children'
> {
  header: Header<DataTableFeatures, TData, CellData>
}

function DataTableColumnHead<TData extends RowData>({
  className,
  header,
  ...props
}: DataTableColumnHeadProps<TData>) {
  'use no memo'
  const { column } = header
  const { meta } = column.columnDef
  const canSort = column.getCanSort()
  const sorted = column.getIsSorted()
  const custom = typeof column.columnDef.header === 'function'

  return (
    <DataTableHead
      align={meta?.align}
      aria-sort={canSort ? (sorted ? SORT_DIRECTION[sorted] : 'none') : undefined}
      colSpan={header.colSpan}
      className={cn(meta?.headerClassName, className)}
      {...props}
    >
      {header.isPlaceholder ? null : canSort && !custom ? (
        <DataTableSortButton column={column} />
      ) : (
        flexRender(column.columnDef.header, header.getContext())
      )}
    </DataTableHead>
  )
}

const SELECT_COLUMN_ID = 'select'

interface DataTableContentProps<TData extends RowData> extends Omit<
  ComponentProps<'table'>,
  'children'
> {
  /** Read by screen readers only. */
  caption?: ReactNode
  empty?: ReactNode
  table: DataTableInstance<TData>
}

function DataTableContent<TData extends RowData>({
  caption,
  empty,
  table,
  ...props
}: DataTableContentProps<TData>) {
  'use no memo'
  const rows = table.getRowModel().rows
  const columns = table.getVisibleLeafColumns()
  const selectable = columns.some((column) => column.id === SELECT_COLUMN_ID)

  return (
    <DataTable
      {...props}
      className={cn(
        'focus-visible:ring-ring/50 outline-none focus-visible:ring-3 focus-visible:ring-inset',
        props.className,
      )}
    >
      {caption && <caption className='sr-only'>{caption}</caption>}
      <DataTableHeader>
        {table.getHeaderGroups().map((group) => (
          <DataTableRow key={group.id}>
            {group.headers.map((header) => (
              <DataTableColumnHead key={header.id} header={header} />
            ))}
          </DataTableRow>
        ))}
      </DataTableHeader>
      <DataTableBody>
        {rows.length > 0 ? (
          rows.map((row) => (
            <DataTableRow
              key={row.id}
              data-state={row.getIsSelected() ? 'selected' : undefined}
              className={cn(
                selectable && '@max-2xl/data-table:relative @max-2xl/data-table:pr-14',
              )}
            >
              {row.getVisibleCells().map((cell) => {
                const { meta } = cell.column.columnDef
                return (
                  <DataTableCell
                    key={cell.id}
                    align={meta?.align}
                    label={
                      meta?.primary ||
                      meta?.hideLabelWhenStacked ||
                      cell.column.id === SELECT_COLUMN_ID
                        ? undefined
                        : getColumnLabel(cell.column)
                    }
                    primary={meta?.primary}
                    truncate={meta?.truncate}
                    className={meta?.cellClassName}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </DataTableCell>
                )
              })}
            </DataTableRow>
          ))
        ) : (
          <DataTableRow>
            <DataTableCell
              colSpan={columns.length}
              className='text-muted-foreground h-24 text-center @max-2xl/data-table:col-span-2 @max-2xl/data-table:items-center @max-2xl/data-table:py-4'
            >
              {empty ?? <DataTableEmpty table={table} />}
            </DataTableCell>
          </DataTableRow>
        )}
      </DataTableBody>
    </DataTable>
  )
}

function getIsFiltered<TData extends RowData>(table: DataTableInstance<TData>) {
  return Boolean(table.state.globalFilter) || table.state.columnFilters.length > 0
}

function resetFilters<TData extends RowData>(table: DataTableInstance<TData>) {
  table.resetGlobalFilter(true)
  table.resetColumnFilters(true)
}

function focusTableNear(control: Element) {
  const card = control.closest("[data-slot='card']")
  for (let parent = control.parentElement; parent; parent = parent.parentElement) {
    const table = parent.querySelector<HTMLElement>("[data-slot='data-table']")
    if (table) {
      table.tabIndex = -1
      table.addEventListener('blur', () => table.removeAttribute('tabindex'), {
        once: true,
      })
      table.focus()
      return
    }
    if (parent === card) return
  }
}

function DataTableEmpty<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  'use no memo'
  if (!getIsFiltered(table)) return 'No rows yet.'
  return (
    <span className='inline-flex flex-col items-center gap-2'>
      No rows match your filters.
      <Button
        variant='outline'
        size='sm'
        // Not the primitive's colour: undoes the muted text the empty cell passes down
        className='text-foreground'
        onClick={(event) => {
          focusTableNear(event.currentTarget)
          resetFilters(table)
        }}
      >
        Clear filters
      </Button>
    </span>
  )
}

interface DataTableSearchProps<TData extends RowData> extends Omit<
  ComponentProps<typeof Input>,
  'onChange' | 'value'
> {
  table: DataTableInstance<TData>
}

function DataTableSearch<TData extends RowData>({
  className,
  placeholder = 'Search…',
  table,
  ...props
}: DataTableSearchProps<TData>) {
  'use no memo'
  return (
    <Input
      type='search'
      aria-label={placeholder}
      placeholder={placeholder}
      value={String(table.state.globalFilter ?? '')}
      onChange={(event) => table.setGlobalFilter(event.target.value)}
      className={cn('w-full @2xl/data-table:w-56', className)}
      {...props}
    />
  )
}

interface DataTableFacetOption {
  count?: number
  icon?: ReactNode
  label: string
  value: string
}

interface DataTableFacetFilterProps<TData extends RowData> {
  className?: string
  column: DataTableColumn<TData> | undefined
  /** Defaults to the column's distinct values, A to Z. */
  options?: DataTableFacetOption[]
  /** Defaults to the column's label. */
  title?: string
}

function DataTableFacetFilter<TData extends RowData>({
  className,
  column,
  options,
  title,
}: DataTableFacetFilterProps<TData>) {
  'use no memo'
  if (!column) return null
  const label = title ?? getColumnLabel(column)
  const counts = new Map<string, number>()
  for (const [value, count] of column.getFacetedUniqueValues()) {
    counts.set(String(value), count)
  }
  const items: DataTableFacetOption[] =
    options ??
    [...counts.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ label: value, value }))
  const selected = (column.getFilterValue() as string[] | undefined) ?? []

  const toggle = (value: string, checked: boolean) => {
    const next = checked
      ? [...selected, value]
      : selected.filter((item) => item !== value)
    column.setFilterValue(next.length > 0 ? next : undefined)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant='outline' size='sm' className={className} />}
      >
        <IconPlaceholder
          lucide='CirclePlusIcon'
          tabler='IconCirclePlus'
          hugeicons='AddCircleIcon'
          phosphor='PlusCircleIcon'
          remixicon='RiAddCircleLine'
          className='text-muted-foreground'
        />
        {label}
        {selected.length > 0 && (
          <span className='bg-muted text-foreground rounded-sm px-1 text-xs tabular-nums'>
            {selected.length}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-auto min-w-48'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {items.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.value}
              checked={selected.includes(item.value)}
              onCheckedChange={(checked) => toggle(item.value, checked)}
            >
              {item.icon}
              {item.label}
              <span className='text-muted-foreground ml-auto pl-4 text-xs tabular-nums'>
                {item.count ?? counts.get(item.value) ?? 0}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>
              Clear filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface DataTableResetProps<TData extends RowData> {
  className?: string
  table: DataTableInstance<TData>
}

function DataTableReset<TData extends RowData>({
  className,
  table,
}: DataTableResetProps<TData>) {
  'use no memo'
  if (!getIsFiltered(table)) return null
  return (
    <Button
      variant='ghost'
      size='sm'
      className={className}
      onClick={(event) => {
        focusTableNear(event.currentTarget)
        resetFilters(table)
      }}
    >
      Reset
      <IconPlaceholder
        lucide='XIcon'
        tabler='IconX'
        hugeicons='Cancel01Icon'
        phosphor='XIcon'
        remixicon='RiCloseLine'
      />
    </Button>
  )
}

interface DataTableViewOptionsProps<TData extends RowData> {
  className?: string
  table: DataTableInstance<TData>
}

function DataTableViewOptions<TData extends RowData>({
  className,
  table,
}: DataTableViewOptionsProps<TData>) {
  'use no memo'
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.accessorFn !== undefined && column.getCanHide())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant='outline' size='sm' className={className} />}
      >
        <IconPlaceholder
          lucide='Columns3Icon'
          tabler='IconColumns'
          hugeicons='LayoutThreeColumnIcon'
          phosphor='ColumnsIcon'
          remixicon='RiLayoutColumnLine'
          className='text-muted-foreground'
        />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-auto min-w-44'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(checked)}
            >
              {getColumnLabel(column)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/

function isDateColumn<TData extends RowData>(
  table: DataTableInstance<TData>,
  columnId: string,
) {
  for (const row of table.getCoreRowModel().rows) {
    const value: unknown = row.getValue(columnId)
    if (value == null || value === '') continue
    return value instanceof Date || (typeof value === 'string' && ISO_DATE.test(value))
  }
  return false
}

interface DataTableSortMenuProps<TData extends RowData> {
  className?: string
  table: DataTableInstance<TData>
}

function DataTableSortMenu<TData extends RowData>({
  className,
  table,
}: DataTableSortMenuProps<TData>) {
  'use no memo'
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanSort() && column.getIsVisible())
  const [sort] = table.state.sorting
  const current = columns.find((column) => column.id === sort?.id)
  const text = current?.getAutoSortDir() === 'asc'
  const customLabels = current?.columnDef.meta?.sortLabels
  const dates = current && isDateColumn(table, current.id)
  const labels =
    customLabels ??
    (dates
      ? { asc: 'Oldest first', desc: 'Newest first' }
      : text
        ? { asc: 'A to Z', desc: 'Z to A' }
        : { asc: 'Low to high', desc: 'High to low' })
  const first = customLabels || dates ? current.getFirstSortDir() : text ? 'asc' : 'desc'
  const second = first === 'asc' ? 'desc' : 'asc'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant='outline' size='sm' className={className} />}
      >
        <IconPlaceholder
          lucide='ListFilterIcon'
          tabler='IconFilter'
          hugeicons='FilterHorizontalIcon'
          phosphor='FunnelSimpleIcon'
          remixicon='RiFilter3Line'
          className='text-muted-foreground'
        />
        {current ? `Sort: ${getColumnLabel(current)}` : 'Sort'}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-auto min-w-44'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort?.id ?? ''}
            onValueChange={(id: string) => {
              const column = table.getColumn(id)
              const desc =
                id === sort?.id ? sort.desc : column?.getFirstSortDir() === 'desc'
              table.setSorting([{ desc, id }])
            }}
          >
            {columns.map((column) => (
              <DropdownMenuRadioItem key={column.id} value={column.id} closeOnClick>
                {getColumnLabel(column)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        {sort && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Order</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sort.desc ? 'desc' : 'asc'}
                onValueChange={(direction: string) =>
                  table.setSorting([{ desc: direction === 'desc', id: sort.id }])
                }
              >
                <DropdownMenuRadioItem value={first} closeOnClick>
                  {labels[first]}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={second} closeOnClick>
                  {labels[second]}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const countFormat = new Intl.NumberFormat('en-US')

interface DataTablePaginationProps<TData extends RowData> {
  className?: string
  pageSizeOptions?: number[]
  selectedCount?: number
  table: DataTableInstance<TData>
}

function DataTablePagination<TData extends RowData>({
  className,
  pageSizeOptions,
  selectedCount,
  table,
}: DataTablePaginationProps<TData>) {
  'use no memo'
  const { pageIndex, pageSize } = table.state.pagination
  const total = table.getRowCount()
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min(total, (pageIndex + 1) * pageSize)
  const selected = selectedCount ?? table.getSelectedRowModel().rows.length
  const pageCount = table.getPageCount()

  const previousRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const focusAfterRender = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    focusAfterRender.current?.focus()
    focusAfterRender.current = null
  })

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2',
        className,
      )}
    >
      <p
        className='text-muted-foreground text-xs whitespace-nowrap tabular-nums'
        aria-live='polite'
      >
        {countFormat.format(from)}–{countFormat.format(to)} of {countFormat.format(total)}
        {selected > 0 && ` · ${selected} selected`}
      </p>
      <div className='flex flex-wrap items-center gap-2'>
        {pageSizeOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant='ghost' size='sm' aria-label='Rows per page' />}
            >
              {pageSize} per page
              <IconPlaceholder
                lucide='ChevronDownIcon'
                tabler='IconChevronDown'
                hugeicons='ArrowDown01Icon'
                phosphor='CaretDownIcon'
                remixicon='RiArrowDownSLine'
                className='text-muted-foreground'
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-auto min-w-32'>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={String(pageSize)}
                  onValueChange={(value: string) => table.setPageSize(Number(value))}
                >
                  {pageSizeOptions.map((option) => (
                    <DropdownMenuRadioItem
                      key={option}
                      value={String(option)}
                      closeOnClick
                    >
                      {option}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            ref={previousRef}
            disabled={!table.getCanPreviousPage()}
            onClick={() => {
              if (pageIndex === 1) focusAfterRender.current = nextRef.current
              table.previousPage()
            }}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            ref={nextRef}
            disabled={!table.getCanNextPage()}
            onClick={() => {
              if (pageIndex + 2 === pageCount)
                focusAfterRender.current = previousRef.current
              table.nextPage()
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

interface DataTableSelectionBarProps<TData extends RowData> {
  children?: ReactNode
  className?: string
  table: DataTableInstance<TData>
}

function DataTableSelectionBar<TData extends RowData>({
  children,
  className,
  table,
}: DataTableSelectionBarProps<TData>) {
  'use no memo'
  const selected = table.getSelectedRowModel().rows.length
  if (selected === 0) return null
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <p className='text-sm font-medium tabular-nums' aria-live='polite'>
        {selected} selected
      </p>
      <Button
        variant='ghost'
        size='sm'
        onClick={(event) => {
          focusTableNear(event.currentTarget)
          table.resetRowSelection(true)
        }}
      >
        Clear
      </Button>
      <div className='ml-auto flex flex-wrap items-center gap-2'>{children}</div>
    </div>
  )
}

function DataTableSelectAll<TData extends RowData>({
  table,
}: {
  table: Table<DataTableFeatures, TData>
}) {
  'use no memo'
  return (
    <Checkbox
      aria-label='Select all rows on this page'
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
    />
  )
}

function DataTableSelectRow<TData extends RowData>({
  getRowLabel,
  row,
}: {
  getRowLabel?: (row: TData) => string
  row: Row<DataTableFeatures, TData>
}) {
  'use no memo'
  const label = getRowLabel?.(row.original)
  return (
    <Checkbox
      aria-label={label ? `Select ${label}` : 'Select row'}
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onCheckedChange={(checked) => row.toggleSelected(checked === true)}
    />
  )
}

function createDataTableSelectColumn<TData extends RowData>({
  getRowLabel,
}: {
  getRowLabel?: (row: TData) => string
} = {}): DataTableColumnDef<TData> {
  return {
    cell: ({ row }) => <DataTableSelectRow getRowLabel={getRowLabel} row={row} />,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => <DataTableSelectAll table={table} />,
    id: SELECT_COLUMN_ID,
    meta: {
      cellClassName:
        'w-px pr-0 @max-2xl/data-table:absolute @max-2xl/data-table:top-4 @max-2xl/data-table:right-6 @max-2xl/data-table:w-auto',
      headerClassName: 'w-px pr-0',
      label: 'Select',
    },
  }
}

export {
  createDataTableColumnHelper,
  createDataTableSelectColumn,
  DataTable,
  DataTableBar,
  DataTableBody,
  DataTableCell,
  DataTableColumnHead,
  DataTableContent,
  DataTableFacetFilter,
  dataTableFeatures,
  DataTableHead,
  DataTableHeader,
  DataTablePagination,
  DataTableReset,
  DataTableRow,
  DataTableSearch,
  DataTableSelectionBar,
  DataTableSortButton,
  DataTableSortMenu,
  DataTableViewOptions,
  getColumnLabel,
  useDataTable,
}

export type {
  DataTableBarProps,
  DataTableCellProps,
  DataTableColumn,
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableContentProps,
  DataTableFacetFilterProps,
  DataTableFacetOption,
  DataTableFeatures,
  DataTableHeadProps,
  DataTableInstance,
  DataTablePaginationProps,
  DataTableSearchProps,
  DataTableSelectionBarProps,
  DataTableSortMenuProps,
  DataTableViewOptionsProps,
  UseDataTableOptions,
}
