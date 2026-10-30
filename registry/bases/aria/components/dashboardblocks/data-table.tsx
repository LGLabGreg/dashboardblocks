// Override of registry/components/dashboardblocks/data-table.tsx for React Aria
// source-hash: 7fbc6ec14902

'use client'

import {
  BlockStateText,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  type DataTableCellProps,
  DataTableHead,
  type DataTableHeadProps,
  DataTableHeader,
  DataTablePager,
  DataTableRow,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import { Tag } from '@/registry/components/dashboardblocks/tag'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
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
import type { ComponentProps, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

function useDataTableUnavailable() {
  const state = useBlockState()
  return state === 'loading' || state === 'error'
}

interface DataTableColumnMeta {
  /** @default 'start' */
  align?: DataTableCellProps['align']
  cellClassName?: string
  headerClassName?: string
  label?: string
  primary?: boolean
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
  /** Shown when there are no rows, in the block's empty state too. */
  empty?: ReactNode
  /** The id of a row to highlight, such as the one hovered in a chart beside the table. */
  highlightedRowId?: string | null
  /** How many rows to sketch while loading. @default 5 */
  loadingRows?: number
  table: DataTableInstance<TData>
}

function DataTableContent<TData extends RowData>({
  caption,
  empty,
  highlightedRowId,
  loadingRows,
  table,
  ...props
}: DataTableContentProps<TData>) {
  'use no memo'
  const blockState = useBlockState()
  const state = blockState === 'empty' && empty !== undefined ? undefined : blockState
  const rows = table.getRowModel().rows
  const columns = table.getVisibleLeafColumns()

  return (
    <DataTable
      {...props}
      caption={caption}
      className={cn(
        'focus-visible:ring-ring/50 outline-none focus-visible:ring-3 focus-visible:ring-inset',
        props.className,
      )}
    >
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
        {state ? (
          <DataTableStateRows colSpan={columns.length} rows={loadingRows} />
        ) : rows.length > 0 ? (
          rows.map((row) => (
            <DataTableRow
              key={row.id}
              data-row-id={row.id}
              data-state={row.getIsSelected() ? 'selected' : undefined}
              highlighted={row.id === highlightedRowId}
            >
              {row.getVisibleCells().map((cell) => {
                const { meta } = cell.column.columnDef
                return (
                  <DataTableCell
                    key={cell.id}
                    align={meta?.align}
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
              className='text-muted-foreground h-24 text-center'
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
  const block = control.closest("[data-slot='card'], section")
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
    if (parent === block) return
  }
}

function DataTableEmpty<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  'use no memo'
  if (!getIsFiltered(table)) return <BlockStateText state='empty' />
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
  'className' | 'onChange' | 'value'
> {
  className?: string
  table: DataTableInstance<TData>
}

function DataTableSearch<TData extends RowData>({
  className,
  placeholder = 'Search',
  table,
  ...props
}: DataTableSearchProps<TData>) {
  'use no memo'
  const unavailable = useDataTableUnavailable()
  return (
    <Input
      type='search'
      aria-label={placeholder}
      placeholder={placeholder}
      value={String(table.state.globalFilter ?? '')}
      onChange={(event) => table.setGlobalFilter(event.target.value)}
      className={cn('w-full @2xl/data-table:w-56', className)}
      {...props}
      disabled={props.disabled || unavailable}
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
  columnId: string
  /** Defaults to the column's distinct values, A to Z. */
  options?: DataTableFacetOption[]
  table: DataTableInstance<TData>
  /** Defaults to the column's label. */
  title?: string
}

function DataTableFacetFilter<TData extends RowData>({
  className,
  columnId,
  options,
  table,
  title,
}: DataTableFacetFilterProps<TData>) {
  'use no memo'
  const unavailable = useDataTableUnavailable()
  const column = table.getColumn(columnId)
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

  return (
    <DropdownMenuTrigger>
      <Button variant='outline' size='sm' className={className} isDisabled={unavailable}>
        <IconPlaceholder
          lucide='CirclePlusIcon'
          tabler='IconCirclePlus'
          hugeicons='AddCircleIcon'
          phosphor='PlusCircleIcon'
          remixicon='RiAddCircleLine'
          className='text-muted-foreground'
        />
        {label}
        {selected.length > 0 && <Tag>{formatNumber(selected.length)}</Tag>}
      </Button>
      <DropdownMenu className='w-auto min-w-48'>
        <DropdownMenuGroup
          selectionMode='multiple'
          selectedKeys={selected}
          onSelectionChange={(keys) => {
            const next =
              keys === 'all' ? items.map((item) => item.value) : [...keys].map(String)
            column.setFilterValue(next.length > 0 ? next : undefined)
          }}
        >
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {items.map((item) => (
            <DropdownMenuItem key={item.value} id={item.value} textValue={item.label}>
              {item.icon}
              {item.label}
              <span className='text-muted-foreground ml-auto pl-4 text-xs tabular-nums'>
                {formatNumber(item.count ?? counts.get(item.value) ?? 0)}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onAction={() => column.setFilterValue(undefined)}>
              Clear filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenu>
    </DropdownMenuTrigger>
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
  const unavailable = useDataTableUnavailable()
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.accessorFn !== undefined && column.getCanHide())

  return (
    <DropdownMenuTrigger>
      <Button variant='outline' size='sm' className={className} isDisabled={unavailable}>
        <IconPlaceholder
          lucide='Columns3Icon'
          tabler='IconColumns'
          hugeicons='LayoutThreeColumnIcon'
          phosphor='ColumnsIcon'
          remixicon='RiLayoutColumnLine'
          className='text-muted-foreground'
        />
        Columns
      </Button>
      <DropdownMenu placement='bottom end' className='w-auto min-w-44'>
        <DropdownMenuGroup
          selectionMode='multiple'
          selectedKeys={columns
            .filter((column) => column.getIsVisible())
            .map((column) => column.id)}
          onSelectionChange={(keys) => {
            table.setColumnVisibility((visibility) => ({
              ...visibility,
              ...Object.fromEntries(
                columns.map((column) => [
                  column.id,
                  keys === 'all' || keys.has(column.id),
                ]),
              ),
            }))
          }}
        >
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          {columns.map((column) => (
            <DropdownMenuItem key={column.id} id={column.id}>
              {getColumnLabel(column)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

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
  const selected = selectedCount ?? table.getSelectedRowModel().rows.length

  return (
    <DataTablePager
      className={className}
      detail={selected > 0 && `${formatNumber(selected)} selected`}
      from={pageIndex * pageSize + 1}
      to={Math.min(total, (pageIndex + 1) * pageSize)}
      total={total}
      onNext={() => table.nextPage()}
      onPrevious={() => table.previousPage()}
    >
      {pageSizeOptions && (
        <DropdownMenuTrigger>
          <Button variant='ghost' size='sm'>
            {pageSize} per page
            <IconPlaceholder
              lucide='ChevronDownIcon'
              tabler='IconChevronDown'
              hugeicons='ArrowDown01Icon'
              phosphor='CaretDownIcon'
              remixicon='RiArrowDownSLine'
              className='text-muted-foreground'
            />
          </Button>
          <DropdownMenu
            placement='bottom end'
            className='w-auto min-w-32'
            selectionMode='single'
            disallowEmptySelection
            selectedKeys={[String(pageSize)]}
            onSelectionChange={(keys) => {
              const [value] = keys === 'all' ? [] : [...keys]
              if (value !== undefined) table.setPageSize(Number(value))
            }}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
              {pageSizeOptions.map((option) => (
                <DropdownMenuItem key={option} id={String(option)}>
                  {String(option)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenu>
        </DropdownMenuTrigger>
      )}
    </DataTablePager>
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
  const unavailable = useBlockState() !== undefined
  return (
    <Checkbox
      aria-label='Select all rows on this page'
      isSelected={table.getIsAllPageRowsSelected()}
      isIndeterminate={
        table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
      }
      isDisabled={unavailable}
      onChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
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
      isSelected={row.getIsSelected()}
      isDisabled={!row.getCanSelect()}
      onChange={(checked) => row.toggleSelected(checked === true)}
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
      cellClassName: 'w-px pe-0',
      headerClassName: 'w-px pe-0',
      label: 'Select',
    },
  }
}

export {
  createDataTableColumnHelper,
  createDataTableSelectColumn,
  DataTableColumnHead,
  DataTableContent,
  DataTableFacetFilter,
  dataTableFeatures,
  DataTablePagination,
  DataTableReset,
  DataTableSearch,
  DataTableSelectionBar,
  DataTableSortButton,
  DataTableViewOptions,
  getColumnLabel,
  useDataTable,
}

export type {
  DataTableColumn,
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableContentProps,
  DataTableFacetFilterProps,
  DataTableFacetOption,
  DataTableFeatures,
  DataTableInstance,
  DataTablePaginationProps,
  DataTableSearchProps,
  DataTableSelectionBarProps,
  DataTableViewOptionsProps,
  UseDataTableOptions,
}
