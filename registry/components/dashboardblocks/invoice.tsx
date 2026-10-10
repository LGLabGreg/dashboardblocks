'use client'

import { formatCurrency } from '@/registry/components/dashboardblocks/billing'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ComponentProps, type ReactNode, useId } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

import { cn } from '@/lib/utils'

interface DocumentLine {
  detail?: string
  description: string
  id: string
  optional?: boolean
  quantity: number
  sku?: string
  /** This line's tax rate, 0.2 for 20%, instead of the document's. */
  taxRate?: number
  unit?: string
  unitPrice: number
}

interface DocumentTotalsOptions {
  /** Amounts round to its smallest unit, cents for USD. */
  currency?: string
  discount?: number
  /** A share off the subtotal, 0.1 for 10%. */
  discountRate?: number
  paid?: number
  /** Added after tax and not taxed. */
  shipping?: number
  /** The rate for lines without their own, 0.2 for 20%. */
  taxRate?: number
}

interface DocumentTax {
  amount: number
  rate: number
  taxable: number
}

interface DocumentAmounts {
  balanceDue: number
  /** A positive amount. */
  discount: number
  paid: number
  shipping: number
  subtotal: number
  tax: number
  /** One entry per rate above zero, in the order the rates first appear. */
  taxes: DocumentTax[]
  total: number
}

const currencyDigits = new Map<string, number>()

function getCurrencyDigits(currency = 'USD') {
  let digits = currencyDigits.get(currency)
  if (digits === undefined) {
    digits =
      new Intl.NumberFormat('en-US', { currency, style: 'currency' }).resolvedOptions()
        .maximumFractionDigits ?? 2
    currencyDigits.set(currency, digits)
  }
  return digits
}

function toMinorUnits(value: number, scale: number) {
  // The epsilon keeps 1.005 from rounding down because it's stored as 1.00499…
  return Math.sign(value) * Math.round(Math.abs(value) * scale + 1e-6)
}

function formatDocumentAmount(value: number, currency = 'USD') {
  return formatCurrency(value, { currency, fractionDigits: getCurrencyDigits(currency) })
}

function getLineAmount(
  line: Pick<DocumentLine, 'quantity' | 'unitPrice'>,
  currency = 'USD',
) {
  const scale = 10 ** getCurrencyDigits(currency)
  return toMinorUnits(line.quantity * line.unitPrice, scale) / scale
}

function getDocumentTotals(
  lines: Pick<DocumentLine, 'quantity' | 'taxRate' | 'unitPrice'>[],
  options: DocumentTotalsOptions = {},
): DocumentAmounts {
  const {
    currency = 'USD',
    discount,
    discountRate = 0,
    paid = 0,
    shipping = 0,
    taxRate = 0,
  } = options
  const scale = 10 ** getCurrencyDigits(currency)
  const minor = (value: number) => toMinorUnits(value, scale)

  const groups = new Map<number, number>()
  let subtotal = 0
  for (const line of lines) {
    const amount = minor(line.quantity * line.unitPrice)
    const rate = line.taxRate ?? taxRate
    groups.set(rate, (groups.get(rate) ?? 0) + amount)
    subtotal += amount
  }

  const requested =
    discount !== undefined ? minor(discount) : minor((subtotal / scale) * discountRate)
  const discountTotal = Math.min(Math.max(requested, 0), Math.max(subtotal, 0))

  const taxes: DocumentTax[] = []
  let allocated = 0
  let tax = 0
  const entries = [...groups]
  entries.forEach(([rate, base], index) => {
    const share =
      index === entries.length - 1
        ? discountTotal - allocated
        : subtotal === 0
          ? 0
          : Math.round((discountTotal * base) / subtotal)
    allocated += share
    const taxable = base - share
    const amount = minor((taxable / scale) * rate)
    tax += amount
    if (rate > 0) taxes.push({ amount: amount / scale, rate, taxable: taxable / scale })
  })

  const shippingTotal = minor(shipping)
  const total = subtotal - discountTotal + tax + shippingTotal
  const paidTotal = minor(paid)

  return {
    balanceDue: (total - paidTotal) / scale,
    discount: discountTotal / scale,
    paid: paidTotal / scale,
    shipping: shippingTotal / scale,
    subtotal: subtotal / scale,
    tax: tax / scale,
    taxes,
    total: total / scale,
  }
}

const rateFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 3,
  style: 'percent',
})

function formatRate(rate: number) {
  return rateFormatter.format(rate)
}

interface DocumentTotalRow {
  /** `total` rules a line above the row. */
  emphasis?: 'due' | 'total'
  id: string
  label: ReactNode
  /** Negative for amounts taken off, such as a discount or a payment. */
  value: number
}

interface DocumentTotalLabels {
  /** @default 'Discount' */
  discount?: string
  /** @default 'Balance due' */
  due?: string
  /** @default 'Amount paid' */
  paid?: string
  /** @default 'Shipping' */
  shipping?: string
  /** Followed by the rate. */
  tax?: string
  /** @default 'Total' */
  total?: string
}

function getTotalRows(amounts: DocumentAmounts, labels: DocumentTotalLabels = {}) {
  const rows: DocumentTotalRow[] = [
    { id: 'subtotal', label: 'Subtotal', value: amounts.subtotal },
  ]
  if (amounts.discount > 0) {
    rows.push({
      id: 'discount',
      label: labels.discount ?? 'Discount',
      value: -amounts.discount,
    })
  }
  for (const tax of amounts.taxes) {
    rows.push({
      id: `tax-${tax.rate}`,
      label: `${labels.tax ?? 'Tax'} (${formatRate(tax.rate)})`,
      value: tax.amount,
    })
  }
  if (amounts.shipping > 0) {
    rows.push({
      id: 'shipping',
      label: labels.shipping ?? 'Shipping',
      value: amounts.shipping,
    })
  }
  if (amounts.paid === 0) {
    rows.push({
      emphasis: 'due',
      id: 'total',
      label: labels.total ?? 'Total',
      value: amounts.total,
    })
    return rows
  }
  rows.push(
    {
      emphasis: 'total',
      id: 'total',
      label: labels.total ?? 'Total',
      value: amounts.total,
    },
    { id: 'paid', label: labels.paid ?? 'Amount paid', value: -amounts.paid },
    {
      emphasis: 'due',
      id: 'due',
      label: labels.due ?? 'Balance due',
      value: amounts.balanceDue,
    },
  )
  return rows
}

function DocumentLayout({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-3xl flex-col gap-4 print:max-w-none print:gap-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

function DocumentToolbar({
  children,
  className,
  description,
}: {
  children: ReactNode
  className?: string
  description?: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-x-4 gap-y-3 print:hidden',
        className,
      )}
    >
      {description && (
        <div className='text-muted-foreground mr-auto min-w-0 text-sm text-pretty'>
          {description}
        </div>
      )}
      <div className='flex flex-wrap items-center gap-2'>{children}</div>
    </div>
  )
}

function PrintButton({
  children = 'Print',
  className,
  onPrint,
}: {
  /** @default 'Print' */
  children?: ReactNode
  className?: string
  /** Replaces `window.print()`, for example to print a server-rendered PDF. */
  onPrint?: () => void
}) {
  return (
    <Button
      variant='outline'
      className={className}
      onClick={() => (onPrint ? onPrint() : window.print())}
    >
      <IconPlaceholder
        lucide='PrinterIcon'
        tabler='IconPrinter'
        hugeicons='PrinterIcon'
        phosphor='PrinterIcon'
        remixicon='RiPrinterLine'
        aria-hidden
      />
      {children}
    </Button>
  )
}

const printColors =
  'print:[color-scheme:light] print:[--background:#fff] print:[--border:#d4d4d4] print:[--card-foreground:#000] print:[--card:#fff] print:[--foreground:#000] print:[--input:#a3a3a3] print:[--muted-foreground:#525252] print:[--muted:#f5f5f5] print:[--primary-foreground:#fff] print:[--primary:#000]'

function DocumentPage({
  children,
  className,
  ...props
}: {
  children: ReactNode
  className?: string
} & Pick<ComponentProps<'article'>, 'aria-label' | 'aria-labelledby'>) {
  return (
    <Card
      className={cn(
        '@container/document print:overflow-visible print:rounded-none print:bg-transparent print:py-0 print:shadow-none print:ring-0',
        printColors,
        className,
      )}
    >
      <CardContent className='print:px-0'>
        <article {...props} className='flex flex-col gap-8'>
          {children}
        </article>
      </CardContent>
    </Card>
  )
}

function DocumentBrand({
  className,
  detail,
  logo,
  name,
}: {
  className?: string
  detail?: ReactNode
  /** Print-safe: an SVG or image, not a coloured background with light text. */
  logo?: ReactNode
  name: string
}) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      {logo && <span className='flex shrink-0 [&_svg]:size-9'>{logo}</span>}
      <div className='flex min-w-0 flex-col'>
        <span className='font-semibold'>{name}</span>
        {detail && <span className='text-muted-foreground text-sm'>{detail}</span>}
      </div>
    </div>
  )
}

function DocumentHeader({
  brand,
  children,
  className,
  number,
  status,
  title,
}: {
  brand: ReactNode
  children?: ReactNode
  className?: string
  number: string
  status?: ReactNode
  title: string
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-6 break-inside-avoid @xl/document:flex-row @xl/document:items-start @xl/document:justify-between print:flex-row print:items-start print:justify-between',
        className,
      )}
    >
      {brand}
      <div className='flex flex-col gap-1 @xl/document:items-end @xl/document:text-right print:items-end print:text-right'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 @xl/document:flex-row-reverse print:flex-row-reverse'>
          <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
          {status && (
            <span className='flex gap-1.5 print:*:border print:*:border-current print:*:bg-transparent! print:*:text-black!'>
              {status}
            </span>
          )}
        </div>
        <p className='text-muted-foreground font-mono text-sm'>{number}</p>
        {children}
      </div>
    </header>
  )
}

interface DocumentMetaItem {
  label: string
  note?: ReactNode
  value: ReactNode
}

function DocumentMeta({
  className,
  items,
}: {
  className?: string
  items: DocumentMetaItem[]
}) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-x-6 gap-y-4 break-inside-avoid @xl/document:auto-cols-fr @xl/document:grid-flow-col @xl/document:grid-cols-none print:auto-cols-fr print:grid-flow-col print:grid-cols-none',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className='flex min-w-0 flex-col gap-1'>
          <dt className='text-muted-foreground text-xs'>{item.label}</dt>
          <dd className='text-sm font-medium break-words tabular-nums'>{item.value}</dd>
          {item.note && <dd className='text-xs'>{item.note}</dd>}
        </div>
      ))}
    </dl>
  )
}

interface DocumentParty {
  label: string
  lines: string[]
  name: string
}

function DocumentParties({
  className,
  parties,
}: {
  className?: string
  parties: DocumentParty[]
}) {
  return (
    <div
      className={cn(
        'grid gap-6 break-inside-avoid @md/document:grid-cols-2 @2xl/document:auto-cols-fr @2xl/document:grid-flow-col @2xl/document:grid-cols-none print:auto-cols-fr print:grid-flow-col print:grid-cols-none',
        className,
      )}
    >
      {parties.map((party) => (
        <section key={party.label} className='flex min-w-0 flex-col gap-1.5 text-sm'>
          <h2 className='text-muted-foreground text-xs'>{party.label}</h2>
          <address className='not-italic'>
            <span className='block font-medium'>{party.name}</span>
            {party.lines.map((line, index) => (
              <span key={index} className='text-muted-foreground block break-words'>
                {line}
              </span>
            ))}
          </address>
        </section>
      ))}
    </div>
  )
}

interface LineSelection {
  isSelectable?: (line: DocumentLine) => boolean
  label: (line: DocumentLine) => string
  onChange: (id: string, selected: boolean) => void
  selected: string[]
}

interface LineItemsTableProps {
  caption?: string
  className?: string
  /** @default 'USD' */
  currency?: string
  hidePrices?: boolean
  lines: DocumentLine[]
  selection?: LineSelection
}

function LineItemsTable({
  caption = 'Line items',
  className,
  currency = 'USD',
  hidePrices = false,
  lines,
  selection,
}: LineItemsTableProps) {
  const selected = new Set(selection?.selected)
  const hasSelection = Boolean(selection)
  const edge = 'first:ps-0 last:pe-0'
  const wide = 'hidden @md/line-items:table-cell print:table-cell'
  const head = 'h-10 px-2 text-start align-middle font-medium whitespace-nowrap'
  const cell = 'p-2 align-middle whitespace-nowrap'

  return (
    <div className={cn('@container/line-items print:*:overflow-visible', className)}>
      <div
        role='region'
        aria-label={caption}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must be focusable so keyboard users can reach the columns that don't fit
        tabIndex={0}
        className='focus-visible:ring-ring/50 w-full overflow-x-auto outline-none focus-visible:ring-3'
      >
        <table className='w-full text-sm'>
          <caption className='sr-only'>{caption}</caption>
          <thead>
            <tr className='border-b'>
              {hasSelection && (
                <th scope='col' className={cn(head, edge, 'w-8 pe-0')}>
                  <span className='sr-only'>Selected</span>
                </th>
              )}
              <th scope='col' className={cn(head, edge)}>
                Description
              </th>
              <th scope='col' className={cn(head, edge, 'text-end', !hidePrices && wide)}>
                Qty
              </th>
              {!hidePrices && (
                <>
                  <th scope='col' className={cn(head, edge, wide, 'text-end')}>
                    Unit price
                  </th>
                  <th scope='col' className={cn(head, edge, 'text-end')}>
                    Amount
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const isSelectable = selection && (selection.isSelectable?.(line) ?? true)
              const isExcluded = isSelectable && line.optional && !selected.has(line.id)
              const quantity = `${line.quantity}${line.unit ? ` ${line.unit}` : ''}`
              return (
                <tr key={line.id} className='break-inside-avoid border-b last:border-0'>
                  {hasSelection && (
                    <td className={cn(cell, edge, 'pe-0 align-top')}>
                      {isSelectable && (
                        <Checkbox
                          aria-label={selection.label(line)}
                          checked={selected.has(line.id)}
                          onCheckedChange={(checked) =>
                            selection.onChange(line.id, checked === true)
                          }
                          className='mt-0.5 print:bg-transparent! print:[&_svg]:text-black!'
                        />
                      )}
                    </td>
                  )}
                  <td className={cn(cell, edge, 'align-top whitespace-normal')}>
                    <span className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                      <span className='font-medium'>{line.description}</span>
                      {line.optional && <Badge variant='outline'>Optional</Badge>}
                    </span>
                    {(line.sku || line.detail) && (
                      <span className='text-muted-foreground mt-0.5 block text-xs'>
                        {line.sku && <span className='font-mono'>{line.sku}</span>}
                        {line.sku && line.detail && ' · '}
                        {line.detail}
                      </span>
                    )}
                    {!hidePrices && (
                      <span className='text-muted-foreground mt-0.5 block text-xs tabular-nums @md/line-items:hidden print:hidden'>
                        {quantity} × {formatDocumentAmount(line.unitPrice, currency)}
                      </span>
                    )}
                  </td>
                  <td
                    className={cn(
                      cell,
                      edge,
                      'text-end align-top tabular-nums',
                      !hidePrices && wide,
                    )}
                  >
                    {quantity}
                  </td>
                  {!hidePrices && (
                    <>
                      <td
                        className={cn(
                          cell,
                          edge,
                          wide,
                          'text-end align-top tabular-nums',
                        )}
                      >
                        {formatDocumentAmount(line.unitPrice, currency)}
                      </td>
                      <td
                        className={cn(
                          cell,
                          edge,
                          'text-end align-top font-medium tabular-nums',
                          isExcluded && 'text-muted-foreground font-normal',
                        )}
                      >
                        {formatDocumentAmount(getLineAmount(line, currency), currency)}
                        {isExcluded && <span className='sr-only'>, not included</span>}
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DocumentTotals({
  className,
  currency = 'USD',
  rows,
}: {
  className?: string
  /** @default 'USD' */
  currency?: string
  rows: DocumentTotalRow[]
}) {
  return (
    <dl
      className={cn(
        'ml-auto flex w-full max-w-sm flex-col gap-2.5 text-sm break-inside-avoid',
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.id}
          className={cn(
            'flex items-baseline justify-between gap-4',
            row.emphasis && 'border-t pt-2.5 font-medium',
            row.emphasis === 'due' && 'text-base font-semibold',
          )}
        >
          <dt className={cn(!row.emphasis && 'text-muted-foreground')}>{row.label}</dt>
          <dd className='text-right tabular-nums'>
            {formatDocumentAmount(row.value, currency)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function DocumentSection({
  children,
  className,
  title,
}: {
  children: ReactNode
  className?: string
  title: string
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className={cn('flex min-w-0 flex-col gap-2 text-sm break-inside-avoid', className)}
    >
      <h2 id={id} className='font-medium'>
        {title}
      </h2>
      {children}
    </section>
  )
}

function DocumentFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <footer
      className={cn(
        'text-muted-foreground border-t pt-6 text-xs text-pretty break-inside-avoid',
        className,
      )}
    >
      {children}
    </footer>
  )
}

const code39: Record<string, string> = {
  ' ': '011000100',
  $: '010101000',
  '%': '000101010',
  '*': '010010100',
  '+': '010001010',
  '-': '010000101',
  '.': '110000100',
  '/': '010100010',
  '0': '000110100',
  '1': '100100001',
  '2': '001100001',
  '3': '101100000',
  '4': '000110001',
  '5': '100110000',
  '6': '001110000',
  '7': '000100101',
  '8': '100100100',
  '9': '001100100',
  A: '100001001',
  B: '001001001',
  C: '101001000',
  D: '000011001',
  E: '100011000',
  F: '001011000',
  G: '000001101',
  H: '100001100',
  I: '001001100',
  J: '000011100',
  K: '100000011',
  L: '001000011',
  M: '101000010',
  N: '000010011',
  O: '100010010',
  P: '001010010',
  Q: '000000111',
  R: '100000110',
  S: '001000110',
  T: '000010110',
  U: '110000001',
  V: '011000001',
  W: '111000000',
  X: '010010001',
  Y: '110010000',
  Z: '011010000',
}

const QUIET_ZONE = 10
const WIDE = 3
const INTER_CHARACTER_GAP = 1

function getBarcodeBars(value: string) {
  const text = value
    .toUpperCase()
    .split('')
    .filter((char) => char !== '*' && char in code39)
  const bars: { width: number; x: number }[] = []
  let x = QUIET_ZONE
  for (const char of ['*', ...text, '*']) {
    const pattern = code39[char]
    for (let index = 0; index < pattern.length; index++) {
      const width = pattern[index] === '1' ? WIDE : 1
      if (index % 2 === 0) bars.push({ width, x })
      x += width
    }
    x += INTER_CHARACTER_GAP
  }
  return {
    bars,
    text: text.join(''),
    width: x - INTER_CHARACTER_GAP + QUIET_ZONE,
  }
}

function Barcode({
  className,
  moduleWidth = 1.5,
  value,
}: {
  className?: string
  /** The width of a narrow bar in pixels. */
  moduleWidth?: number
  value: string
}) {
  const { bars, text, width } = getBarcodeBars(value)
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg
        aria-hidden
        className='h-12 max-w-full'
        fill='currentColor'
        preserveAspectRatio='none'
        shapeRendering='crispEdges'
        viewBox={`0 0 ${width} 1`}
        width={width * moduleWidth}
      >
        {bars.map((bar) => (
          <rect key={bar.x} height={1} width={bar.width} x={bar.x} y={0} />
        ))}
      </svg>
      <span className='font-mono text-xs tracking-[0.3em]'>{text}</span>
    </div>
  )
}

export {
  Barcode,
  DocumentBrand,
  DocumentFooter,
  DocumentHeader,
  DocumentLayout,
  DocumentMeta,
  DocumentPage,
  DocumentParties,
  DocumentSection,
  DocumentTotals,
  DocumentToolbar,
  LineItemsTable,
  PrintButton,
  formatDocumentAmount,
  formatRate,
  getBarcodeBars,
  getCurrencyDigits,
  getDocumentTotals,
  getLineAmount,
  getTotalRows,
}

export type {
  DocumentAmounts,
  DocumentLine,
  DocumentMetaItem,
  DocumentParty,
  DocumentTax,
  DocumentTotalLabels,
  DocumentTotalRow,
  DocumentTotalsOptions,
  LineItemsTableProps,
  LineSelection,
}
