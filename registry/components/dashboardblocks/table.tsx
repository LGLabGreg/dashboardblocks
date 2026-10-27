'use client'

/* oxlint-disable jsx-a11y/no-redundant-roles, jsx-a11y/no-interactive-element-to-noninteractive-role -- explicit roles keep the table's semantics when a class changes its display */

import {
  BlockStateText,
  SkeletonText,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import { Link, type LinkProps } from '@/registry/components/dashboardblocks/link'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

type DataTableDensity = 'default' | 'compact'

interface DataTableProps extends ComponentProps<'table'> {
  /** Read by screen readers only, and names the table's scrolling region. */
  caption?: ReactNode
  /** `'compact'` fits a small table inside a headline block: rows `py-2.5`, no fixed row height. @default 'default' */
  density?: DataTableDensity
  /** `false` leaves out the scrolling wrapper, for a parent that scrolls the table itself (a virtual list). @default true */
  scroll?: boolean
}

function useOverflows() {
  const ref = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      container.style.setProperty(
        '--data-table-visible-width',
        `${container.clientWidth}px`,
      )
      setOverflows(container.scrollWidth > container.clientWidth)
    })
    observer.observe(container)
    if (container.firstElementChild) observer.observe(container.firstElementChild)
    return () => observer.disconnect()
  }, [])

  return [ref, overflows] as const
}

function DataTable({
  caption,
  children,
  className,
  density = 'default',
  scroll = true,
  ...props
}: DataTableProps) {
  const captionId = useId()
  const [containerRef, overflows] = useOverflows()

  const table = (
    <table
      role='table'
      data-slot='data-table'
      className={cn(
        'w-full border-collapse text-sm',
        density === 'compact' &&
          '[--data-table-cell-height:auto] [--data-table-cell-py:0.625rem] [--data-table-head-height:2rem]',
        className,
      )}
      {...props}
    >
      {caption && (
        <caption id={captionId} className='sr-only'>
          {caption}
        </caption>
      )}
      {children}
    </table>
  )

  if (!scroll) return table

  return (
    <div
      ref={containerRef}
      data-slot='data-table-container'
      role={overflows && caption ? 'region' : undefined}
      aria-labelledby={overflows && caption ? captionId : undefined}
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a table wider than its box scrolls, and keyboard users need to reach the columns that don't fit
      tabIndex={overflows ? 0 : undefined}
      className='focus-visible:ring-ring/50 relative isolate w-full overflow-x-auto outline-none focus-visible:ring-3 focus-visible:ring-inset'
    >
      {table}
    </div>
  )
}

function DataTableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead role='rowgroup' className={cn('border-b', className)} {...props} />
}

function DataTableBody(props: ComponentProps<'tbody'>) {
  return <tbody role='rowgroup' {...props} />
}

function DataTableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot role='rowgroup' className={cn('border-t font-medium', className)} {...props} />
  )
}

interface DataTableRowProps extends ComponentProps<'tr'> {
  highlighted?: boolean
}

const ROW_HOST =
  'has-data-[slot=data-table-row-trigger]:hover:bg-muted/50 has-data-[slot=data-table-row-trigger]:relative has-data-[slot=data-table-row-trigger]:[&_:is(a,button,input,select,textarea,[role=checkbox]):not([data-slot=data-table-row-trigger])]:relative has-data-[slot=data-table-row-trigger]:[&_:is(a,button,input,select,textarea,[role=checkbox]):not([data-slot=data-table-row-trigger])]:z-10 transition-colors'

function DataTableRow({ className, highlighted, ...props }: DataTableRowProps) {
  return (
    <tr
      role='row'
      data-highlighted={highlighted || undefined}
      className={cn(
        'group/data-table-row data-[state=selected]:bg-muted/50 data-highlighted:bg-muted/50 border-b last:border-b-0',
        ROW_HOST,
        className,
      )}
      {...props}
    />
  )
}

/** A list row that a `DataTableRowLink` or `DataTableRowTrigger` inside it opens as a whole. */
function DataTableListItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot='data-table-list-item'
      className={cn('px-[var(--data-table-inset,0.75rem)]', ROW_HOST, className)}
      {...props}
    />
  )
}

const ROW_TRIGGER =
  'focus-visible:after:ring-ring/50 block max-w-full cursor-pointer text-start font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-inset'

interface RowTriggerOptions {
  /**
   * Cuts a long name with an ellipsis. Pass `false` to let it wrap.
   * @default true
   */
  truncate?: boolean
}

/** Makes the whole row open what this button opens. Other controls in the row stay above it. */
function DataTableRowTrigger({
  className,
  truncate = true,
  ...props
}: ComponentProps<'button'> & RowTriggerOptions) {
  return (
    <button
      data-slot='data-table-row-trigger'
      type='button'
      className={cn(ROW_TRIGGER, truncate && 'truncate', className)}
      {...props}
    />
  )
}

/** Makes the whole row go where this link goes. Other controls in the row stay above it. */
function DataTableRowLink({
  className,
  truncate = true,
  ...props
}: LinkProps & RowTriggerOptions) {
  return (
    <Link
      data-slot='data-table-row-trigger'
      className={cn(ROW_TRIGGER, truncate && 'truncate', className)}
      {...props}
    />
  )
}

type Align = 'start' | 'center' | 'end'

const EDGES =
  'first:ps-[var(--data-table-inset,0.75rem)] last:pe-[var(--data-table-inset,0.75rem)]'

const STICKY =
  'sticky start-0 z-10 bg-[var(--data-table-surface,var(--color-background))] transition-colors group-data-highlighted/data-table-row:bg-[color-mix(in_oklab,var(--color-muted)_50%,var(--data-table-surface,var(--color-background)))] group-data-[state=selected]/data-table-row:bg-[color-mix(in_oklab,var(--color-muted)_50%,var(--data-table-surface,var(--color-background)))] group-has-data-[slot=data-table-row-trigger]/data-table-row:group-hover/data-table-row:bg-[color-mix(in_oklab,var(--color-muted)_50%,var(--data-table-surface,var(--color-background)))]'

const ALIGN: Record<Align, string> = {
  center: 'text-center',
  end: 'text-end',
  start: 'text-start',
}

interface DataTableHeadProps extends Omit<ComponentProps<'th'>, 'align'> {
  /** @default 'start' */
  align?: Align
  /** Keeps the column in view while the table scrolls sideways. */
  sticky?: boolean
}

function DataTableHead({
  align = 'start',
  className,
  sticky = false,
  ...props
}: DataTableHeadProps) {
  return (
    <th
      role='columnheader'
      scope='col'
      className={cn(
        'text-muted-foreground h-[var(--data-table-head-height,2.5rem)] px-3 align-middle text-xs font-medium whitespace-nowrap',
        EDGES,
        ALIGN[align],
        sticky && STICKY,
        className,
      )}
      {...props}
    />
  )
}

interface DataTableCellProps extends Omit<ComponentProps<'td'>, 'align'> {
  /** @default 'start' */
  align?: Align
  primary?: boolean
  /** Cuts long text with an ellipsis and gives the column the room the others leave. */
  truncate?: boolean
}

function cellClassName({
  align = 'start',
  primary = false,
  truncate = false,
}: Pick<DataTableCellProps, 'align' | 'primary' | 'truncate'>) {
  return cn(
    'h-[var(--data-table-cell-height,3rem)] px-3 py-[var(--data-table-cell-py,0.5rem)] align-middle',
    EDGES,
    ALIGN[align],
    align === 'end' && 'whitespace-nowrap tabular-nums',
    truncate && 'w-full max-w-0 min-w-32 truncate',
    primary && 'font-medium',
  )
}

function DataTableCell({
  align,
  className,
  primary,
  truncate,
  ...props
}: DataTableCellProps) {
  return (
    <td
      role='cell'
      className={cn(cellClassName({ align, primary, truncate }), className)}
      {...props}
    />
  )
}

interface DataTableRowHeadProps extends Omit<ComponentProps<'th'>, 'align' | 'scope'> {
  /** @default 'start' */
  align?: Align
  primary?: boolean
  /** Keeps the column in view while the table scrolls sideways. */
  sticky?: boolean
  /** Cuts long text with an ellipsis and gives the column the room the others leave. */
  truncate?: boolean
}

function DataTableRowHead({
  align,
  className,
  primary,
  sticky = false,
  truncate,
  ...props
}: DataTableRowHeadProps) {
  return (
    <th
      role='rowheader'
      scope='row'
      className={cn(
        'font-normal',
        cellClassName({ align, primary, truncate }),
        sticky && STICKY,
        className,
      )}
      {...props}
    />
  )
}

interface DataTableGroupHeadProps extends Omit<ComponentProps<'th'>, 'scope'> {
  colSpan: number
}

/** Goes in the first row of the `DataTableBody` whose rows it names. */
function DataTableGroupHead({ children, className, ...props }: DataTableGroupHeadProps) {
  return (
    <th
      role='rowheader'
      scope='rowgroup'
      className={cn(
        'text-muted-foreground px-3 pt-4 pb-1.5 text-start text-xs font-medium',
        EDGES,
        className,
      )}
      {...props}
    >
      <span className='sticky start-[var(--data-table-inset,0.75rem)]'>{children}</span>
    </th>
  )
}

interface DataTableSpacerRowProps {
  colSpan: number
  /** The height, in pixels, of the rows a virtual list leaves out. */
  height: number
}

function DataTableSpacerRow({ colSpan, height }: DataTableSpacerRowProps) {
  return (
    <tr aria-hidden>
      {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- an empty, hidden cell that holds the height of rows not rendered */}
      <td colSpan={colSpan} style={{ height }} className='p-0' />
    </tr>
  )
}

interface DataTableStateRowsProps {
  colSpan: number
  /** Sketches one cell per column while loading, aligned as listed, the first being the row's name, so the rows keep the loaded rows' columns. */
  columns?: ('start' | 'end')[]
  /** Sketches a smaller second line under the name, for rows whose name has a detail line under it. */
  detail?: boolean
  /** What the empty row says, such as `Nobody matches these conditions.` */
  emptyMessage?: string
  /** How many rows to sketch while loading. @default 5 */
  rows?: number
}

function DataTableStateRows({
  colSpan,
  columns,
  detail = false,
  emptyMessage,
  rows = 5,
}: DataTableStateRowsProps) {
  const state = useBlockState()
  if (!state) return null

  if (state !== 'loading') {
    return (
      <DataTableRow>
        <DataTableCell colSpan={colSpan}>
          <span className='sticky start-[var(--data-table-inset,0.75rem)] block max-w-[calc(var(--data-table-visible-width,100%)_-_2*var(--data-table-inset,0.75rem))]'>
            <BlockStateText emptyMessage={emptyMessage} />
          </span>
        </DataTableCell>
      </DataTableRow>
    )
  }

  if (columns) {
    return Array.from({ length: rows }, (_, index) => (
      <DataTableRow key={index} aria-hidden={index > 0 || undefined}>
        {columns.map((align, column) =>
          column === 0 ? (
            <DataTableCell key={column}>
              <span className='flex flex-col'>
                {index === 0 && <span className='sr-only'>Loading</span>}
                <span className='text-sm'>
                  <SkeletonText className='w-32' />
                </span>
                {detail && (
                  <span className='text-xs'>
                    <SkeletonText className='w-24' />
                  </span>
                )}
              </span>
            </DataTableCell>
          ) : (
            <DataTableCell key={column} align={align}>
              <SkeletonText className='w-14' />
            </DataTableCell>
          ),
        )}
      </DataTableRow>
    ))
  }

  return Array.from({ length: rows }, (_, index) => (
    <DataTableRow key={index} aria-hidden={index > 0 || undefined}>
      <DataTableCell colSpan={colSpan}>
        <span className='flex w-full items-center gap-4'>
          {index === 0 && <span className='sr-only'>Loading</span>}
          <SkeletonText className='w-1/4' />
          <SkeletonText className='ms-auto w-16' />
          <SkeletonText className='w-16' />
        </span>
      </DataTableCell>
    </DataTableRow>
  ))
}

interface DataTablePagerProps {
  /** Controls before Previous and Next, such as a page size menu. */
  children?: ReactNode
  className?: string
  /** A fact after the range on the same line, such as `3 selected`. */
  detail?: ReactNode
  /** The first row on the page, counted from 1. */
  from: number
  onNext: () => void
  onPrevious: () => void
  /** The last row on the page. */
  to: number
  total: number
}

function DataTablePager({
  children,
  className,
  detail,
  from,
  onNext,
  onPrevious,
  to,
  total,
}: DataTablePagerProps) {
  const state = useBlockState()
  const previousRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const pressed = useRef<HTMLButtonElement | null>(null)
  const loading = state === 'loading'
  const canPrevious = !loading && from > 1
  const canNext = !loading && to < total

  useEffect(() => {
    const button = pressed.current
    if (!button || loading) return
    pressed.current = null
    if (!button.disabled) {
      if (document.activeElement !== button) button.focus()
      return
    }
    const other = button === previousRef.current ? nextRef.current : previousRef.current
    other?.focus()
  })

  if (state === 'empty' || state === 'error') return null

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
        {loading ? (
          <SkeletonText className='w-24' />
        ) : (
          <Details>
            {`${formatNumber(total === 0 ? 0 : from)}–${formatNumber(to)} of ${formatNumber(total)}`}
            {detail}
          </Details>
        )}
      </p>
      <div className='flex flex-wrap items-center gap-2'>
        {children}
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            ref={previousRef}
            disabled={!canPrevious}
            onClick={() => {
              pressed.current = previousRef.current
              onPrevious()
            }}
          >
            <IconPlaceholder
              lucide='ChevronLeftIcon'
              tabler='IconChevronLeft'
              hugeicons='ArrowLeft01Icon'
              phosphor='CaretLeftIcon'
              remixicon='RiArrowLeftSLine'
              data-icon='inline-start'
            />
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            ref={nextRef}
            disabled={!canNext}
            onClick={() => {
              pressed.current = nextRef.current
              onNext()
            }}
          >
            Next
            <IconPlaceholder
              lucide='ChevronRightIcon'
              tabler='IconChevronRight'
              hugeicons='ArrowRight01Icon'
              phosphor='CaretRightIcon'
              remixicon='RiArrowRightSLine'
              data-icon='inline-end'
            />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface DataTableBarProps {
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  /** Colours the fill with classes, such as a status tone's, instead of `color`. */
  fillClassName?: string
  max: number
  value: number
}

function DataTableBar({
  className,
  color = 'var(--color-chart-2)',
  fillClassName,
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
        className={cn('block h-full rounded-full', fillClassName)}
        style={{
          backgroundColor: fillClassName ? undefined : color,
          width: `${share * 100}%`,
        }}
      />
    </span>
  )
}

export {
  DataTable,
  DataTableBar,
  DataTableBody,
  DataTableCell,
  DataTableFooter,
  DataTableGroupHead,
  DataTableHead,
  DataTableHeader,
  DataTableListItem,
  DataTablePager,
  DataTableRow,
  DataTableRowHead,
  DataTableRowLink,
  DataTableRowTrigger,
  DataTableSpacerRow,
  DataTableStateRows,
}

export type {
  DataTableBarProps,
  DataTableCellProps,
  DataTableDensity,
  DataTableGroupHeadProps,
  DataTableHeadProps,
  DataTablePagerProps,
  DataTableProps,
  DataTableRowHeadProps,
  DataTableRowProps,
  DataTableSpacerRowProps,
  DataTableStateRowsProps,
}
