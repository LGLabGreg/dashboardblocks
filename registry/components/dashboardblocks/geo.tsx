'use client'

import {
  Skeleton,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartFloatingTooltip,
  ChartTooltipItem,
} from '@/registry/components/dashboardblocks/chart'
import { getHeatColor } from '@/registry/components/dashboardblocks/heatmap'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowHead,
} from '@/registry/components/dashboardblocks/table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  formatCompact,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'
import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useRef,
  useState,
} from 'react'

import { cn } from '@/lib/utils'

function countryFlag(code: string) {
  if (!/^[a-z]{2}$/i.test(code)) return ''
  const upper = code.toUpperCase()
  return String.fromCodePoint(
    0x1f1e6 + upper.charCodeAt(0) - 65,
    0x1f1e6 + upper.charCodeAt(1) - 65,
  )
}

function CountryFlag({ className, code }: { className?: string; code?: string }) {
  const flag = code ? countryFlag(code) : ''
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex w-5 shrink-0 items-center justify-center text-base leading-none',
        className,
      )}
    >
      {flag || (
        <IconPlaceholder
          lucide='GlobeIcon'
          tabler='IconGlobe'
          hugeicons='Globe02Icon'
          phosphor='GlobeIcon'
          remixicon='RiGlobeLine'
          className='text-muted-foreground size-4'
        />
      )}
    </span>
  )
}

interface MapPoint {
  id: string
  x: number
  y: number
}

interface ActivePoint {
  flip: boolean
  id: string
  x: number
  y: number
}

function useMapReadout(points: MapPoint[]) {
  const [active, setActive] = useState<ActivePoint | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const container = useRef<HTMLDivElement>(null)
  const current = points.find((point) => point.id === cursor) ?? points[0]

  const show = (id: string, element: HTMLElement) => {
    const origin = container.current?.getBoundingClientRect()
    if (!origin) return
    const box = element.getBoundingClientRect()
    const x = box.left - origin.left + box.width / 2
    setActive({
      flip: x > origin.width / 2,
      id,
      x,
      y: box.top - origin.top + box.height / 2,
    })
  }

  const focusPoint = (id: string) => {
    setCursor(id)
    container.current
      ?.querySelector<HTMLElement>(`[data-map-point="${CSS.escape(id)}"]`)
      ?.focus()
  }

  const nearest = (dx: number, dy: number) => {
    let best: MapPoint | null = null
    let bestScore = Infinity
    for (const point of points) {
      const along = (point.x - current.x) * dx + (point.y - current.y) * dy
      if (along <= 0) continue
      const across = Math.abs((point.x - current.x) * dy - (point.y - current.y) * dx)
      const score = along + across * 2
      if (score < bestScore) {
        best = point
        bestScore = score
      }
    }
    return best
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!current) return
    let next: MapPoint | null | undefined
    switch (event.key) {
      case 'ArrowRight':
        next = nearest(1, 0)
        break
      case 'ArrowLeft':
        next = nearest(-1, 0)
        break
      case 'ArrowDown':
        next = nearest(0, 1)
        break
      case 'ArrowUp':
        next = nearest(0, -1)
        break
      case 'Home':
        next = points[0]
        break
      case 'End':
        next = points.at(-1)
        break
      default:
        return
    }
    event.preventDefault()
    if (next) focusPoint(next.id)
  }

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setActive(null)
  }

  const getPointProps = (id: string) => ({
    'data-map-point': id,
    onClick: (event: MouseEvent<HTMLElement>) => show(id, event.currentTarget),
    onFocus: (event: FocusEvent<HTMLElement>) => {
      setCursor(id)
      show(id, event.currentTarget)
    },
    onPointerEnter: (event: PointerEvent<HTMLElement>) => show(id, event.currentTarget),
    tabIndex: id === current?.id ? 0 : -1,
  })

  return {
    active,
    containerProps: {
      onBlur,
      onKeyDown,
      onPointerLeave: () => setActive(null),
      ref: container,
    },
    getPointProps,
  }
}

interface MapTooltipProps {
  active: ActivePoint | null
  color?: string
  format: (value: number) => string
  name?: string
  share?: number
  value: number | null
  valueHeader: string
}

function MapTooltip({
  active,
  color,
  format,
  name,
  share,
  value,
  valueHeader,
}: MapTooltipProps) {
  if (!active) return null
  return (
    <ChartFloatingTooltip active flip={active.flip} x={active.x} y={active.y}>
      <span className='font-medium'>{name}</span>
      <ChartTooltipItem
        color={value === null ? undefined : color}
        name={valueHeader}
        value={value === null ? 'No data' : format(value)}
      />
      {share !== undefined && value !== null && (
        <ChartTooltipItem name='Share' value={formatPercent(share)} />
      )}
    </ChartFloatingTooltip>
  )
}

interface GeoTableRow {
  id: string
  name: string
  value: number | null
}

function GeoTable({
  caption,
  format,
  nameHeader,
  rows,
  valueHeader,
}: {
  caption: string
  format: (value: number) => string
  nameHeader: string
  rows: GeoTableRow[]
  valueHeader: string
}) {
  const sorted = [...rows].sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity))
  return (
    <div className='sr-only'>
      <DataTable caption={caption}>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead>{nameHeader}</DataTableHead>
            <DataTableHead>{valueHeader}</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {sorted.map((row) => (
            <DataTableRow key={row.id}>
              <DataTableRowHead>{row.name}</DataTableRowHead>
              <DataTableCell>
                {row.value === null ? 'No data' : format(row.value)}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  )
}

function MapFooter({ children, footer }: { children?: ReactNode; footer?: ReactNode }) {
  if (!children && !footer) return null
  return (
    <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2'>
      {children && <p className='text-muted-foreground text-sm'>{children}</p>}
      {footer}
    </div>
  )
}

interface TileMapTile {
  code: string
  /** Column and row on the grid, from 0. */
  column: number
  id: string
  name: string
  row: number
}

const US_STATE_TILES: TileMapTile[] = (
  [
    ['AK', 'Alaska', 0, 0],
    ['ME', 'Maine', 10, 0],
    ['VT', 'Vermont', 9, 1],
    ['NH', 'New Hampshire', 10, 1],
    ['WA', 'Washington', 0, 2],
    ['ID', 'Idaho', 1, 2],
    ['MT', 'Montana', 2, 2],
    ['ND', 'North Dakota', 3, 2],
    ['MN', 'Minnesota', 4, 2],
    ['IL', 'Illinois', 5, 2],
    ['WI', 'Wisconsin', 6, 2],
    ['MI', 'Michigan', 7, 2],
    ['NY', 'New York', 8, 2],
    ['RI', 'Rhode Island', 9, 2],
    ['MA', 'Massachusetts', 10, 2],
    ['OR', 'Oregon', 0, 3],
    ['NV', 'Nevada', 1, 3],
    ['WY', 'Wyoming', 2, 3],
    ['SD', 'South Dakota', 3, 3],
    ['IA', 'Iowa', 4, 3],
    ['IN', 'Indiana', 5, 3],
    ['OH', 'Ohio', 6, 3],
    ['PA', 'Pennsylvania', 7, 3],
    ['NJ', 'New Jersey', 8, 3],
    ['CT', 'Connecticut', 9, 3],
    ['CA', 'California', 0, 4],
    ['UT', 'Utah', 1, 4],
    ['CO', 'Colorado', 2, 4],
    ['NE', 'Nebraska', 3, 4],
    ['MO', 'Missouri', 4, 4],
    ['KY', 'Kentucky', 5, 4],
    ['WV', 'West Virginia', 6, 4],
    ['VA', 'Virginia', 7, 4],
    ['MD', 'Maryland', 8, 4],
    ['DE', 'Delaware', 9, 4],
    ['AZ', 'Arizona', 1, 5],
    ['NM', 'New Mexico', 2, 5],
    ['KS', 'Kansas', 3, 5],
    ['AR', 'Arkansas', 4, 5],
    ['TN', 'Tennessee', 5, 5],
    ['NC', 'North Carolina', 6, 5],
    ['SC', 'South Carolina', 7, 5],
    ['DC', 'District of Columbia', 8, 5],
    ['OK', 'Oklahoma', 3, 6],
    ['LA', 'Louisiana', 4, 6],
    ['MS', 'Mississippi', 5, 6],
    ['AL', 'Alabama', 6, 6],
    ['GA', 'Georgia', 7, 6],
    ['HI', 'Hawaii', 0, 7],
    ['TX', 'Texas', 3, 7],
    ['FL', 'Florida', 8, 7],
  ] as const
).map(([code, name, column, row]) => ({ code, column, id: code, name, row }))

interface TileMapProps {
  children?: ReactNode
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  describe: (tile: TileMapTile, value: number | null) => string
  footer?: ReactNode
  format?: (value: number) => string
  label: string
  /** Fixes the colour scale. */
  max?: number
  min?: number
  nameHeader?: string
  /** `sqrt` spreads out skewed values, such as counts that follow population, so the smaller tiles don't all look the same. */
  scale?: 'linear' | 'sqrt'
  /** Adds each tile's share of the total to its tooltip. */
  showShare?: boolean
  tiles: TileMapTile[]
  valueHeader?: string
  /** By tile id. */
  values: Record<string, number | null | undefined>
}

function TileMap({
  children,
  className,
  color,
  describe,
  footer,
  format = (value) => formatNumber(value),
  label,
  max: maxProp,
  min: minProp,
  nameHeader = 'Region',
  scale = 'linear',
  showShare = false,
  tiles,
  valueHeader = 'Value',
  values,
}: TileMapProps) {
  const { active, containerProps, getPointProps } = useMapReadout(
    tiles.map((tile) => ({ id: tile.id, x: tile.column, y: tile.row })),
  )
  const state = useBlockState()
  const known = tiles
    .map((tile) => values[tile.id])
    .filter((value): value is number => typeof value === 'number')
  const min = minProp ?? (known.length ? Math.min(...known) : 0)
  const max = maxProp ?? (known.length ? Math.max(...known) : 0)
  const transform = scale === 'sqrt' ? Math.sqrt : (value: number) => value
  const range = transform(max) - transform(min) || 1
  const columns = Math.max(...tiles.map((tile) => tile.column)) + 1
  const total = known.reduce((sum, value) => sum + value, 0)
  const heat = (value: number) =>
    getHeatColor(Math.max(0, (transform(value) - transform(min)) / range), color)
  const activeTile = tiles.find((tile) => tile.id === active?.id)
  const activeValue = activeTile ? (values[activeTile.id] ?? null) : null

  if (state) {
    return (
      <div aria-hidden className={cn('flex flex-col gap-3', className)}>
        <div
          className='grid gap-[3px]'
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {tiles.map((tile) => {
            const position = { gridColumn: tile.column + 1, gridRow: tile.row + 1 }
            return state === 'loading' ? (
              <Skeleton
                key={tile.id}
                className='aspect-square rounded-[3px]'
                style={position}
              />
            ) : (
              <span
                key={tile.id}
                className='text-muted-foreground flex aspect-square min-w-0 items-center justify-center rounded-[3px] border border-dashed text-xs font-medium'
                style={position}
              >
                {tile.code}
              </span>
            )
          })}
        </div>
        {state === 'loading' && <MapFooter footer={footer}>{children}</MapFooter>}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        {...containerProps}
        role='group'
        aria-label={`${label}. Use the arrow keys to move between tiles.`}
        className='relative'
      >
        <div
          className='grid gap-[3px]'
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {tiles.map((tile) => {
            const value = values[tile.id] ?? null
            return (
              <button
                key={tile.id}
                type='button'
                aria-label={`${tile.code}, ${describe(tile, value)}`}
                className={cn(
                  'ring-offset-background flex aspect-square min-w-0 items-center justify-center rounded-[3px] text-xs font-medium outline-none',
                  value === null && 'text-muted-foreground border border-dashed',
                  'focus-visible:ring-foreground focus-visible:ring-2 focus-visible:ring-offset-1',
                  active?.id === tile.id && 'ring-foreground ring-2 ring-offset-1',
                )}
                style={{
                  backgroundColor: value === null ? undefined : heat(value),
                  gridColumn: tile.column + 1,
                  gridRow: tile.row + 1,
                }}
                {...getPointProps(tile.id)}
              >
                <span aria-hidden>{tile.code}</span>
              </button>
            )
          })}
        </div>
        <MapTooltip
          active={active}
          color={activeValue === null ? undefined : heat(activeValue)}
          format={format}
          name={activeTile?.name}
          share={
            showShare && activeValue !== null && total > 0
              ? activeValue / total
              : undefined
          }
          value={activeValue}
          valueHeader={valueHeader}
        />
      </div>
      <MapFooter footer={footer}>{children}</MapFooter>
      <GeoTable
        caption={label}
        format={format}
        nameHeader={nameHeader}
        rows={tiles.map((tile) => ({
          id: tile.id,
          name: tile.name,
          value: values[tile.id] ?? null,
        }))}
        valueHeader={valueHeader}
      />
    </div>
  )
}

const LAND_MASK =
  'AAAAAB////8AAAAAAAAAAAAAAAAAAH/////gD+AQAAcAAAAAAAAAk3/f//8AB8AAAADgAAAAAAABff8A//8AAAAD4D/8AfAAAAAD/f/Af/8AAAAGG///8PAAgf8/fv/4P/4AAfgG///////v5/////9+P/gAB///////////9/////7+H8PAD/3/////////E/////f8HwAAP///////////B////+ByBgAAP3////////z4AOB///B+AAAGPv///////4OAAYAf//7/gAAPH////////gOAAAAf////wAAP/////////8MAAAAH////wAAD/////////8AAAAAD///84AAD/////////4AAAAAD////AAAB//f//////oAAAAAD///wAAAP7/Tv/////MAAAAAD///gAAAPF//3////8IAAAAAB///AAAAPNP/3////sYAAAAAB///AAAAH+Gf/////PwAAAAAAf/8AAAAP/MP/////jAAAAAAAf/8AAAAP////////gAAAAAAAP8EAAAA/////////gAAAAAAAH4EAAAA///37////AAAAAAAAB4OAAAB/////H//+gAAAAAAAA9hQAAB///7/D+f4AAAAAAAAA/gYAAB////+B8fwgAAAAAAAAH4AAAB////4BwHwgAAAAAAAAA4AAAB////gAwHwQAAAAAAAAAb/AAA////4AwFgQAAAAAAAAAH/gAAf///wAIEAYAAAAAAAAAB/4AAPv//wAALDAAAAAAAAAAB/8AAAH//gAAHOAAAAAAAAAAD/+AAAH//AAAHfEAAAAAAAAAH//wAAH/+AAADPn4AAAAAAAAH//8AAD/8AAABhB/gAAAAAAAD//8AAB/8AAAA8AeIAAAAAAAD//8AAB/8AAAAB4JCAAAAAAAB//4AAB/+AAAAADsAAAAAAAAB//4AAB/+QAAAAPsAAAAAAAAAf/4AAD/9wAAAAf+ABAAAAAAAP/wAAB/xwAAAB/+AAAAAAAAAP/wAAB/5wAAAH//AAAAAAAAAf/AAAA/xgAAAH//gAAAAAAAAf+AAAA/gAAAAH//wAAAAAAAAf8AAAA/gAAAAD//wAAAAAAAAf8AAAAfAAAAAD//gAAAAAAAAf4AAAAYAAAAADg/gEAAAAAAA/wAAAAAAAAAAAAPACAAAAAAA+AAAAAAAAAAAAAAAGAAAAAAA+AAAAAAAAAAAAADAMAAAAAAA8AAAAAAAAAAAAAAAYAAAAAAA8AAAAAAAAAAAAAAAQAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAA4gAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAA'
const LAND_COLUMNS = 144
const LAND_ROWS = 56
const LAND_NORTH = 84
const LAND_STEP = 2.5

let landPath: string | null = null

function getLandPath() {
  if (landPath !== null) return landPath
  const bytes = atob(LAND_MASK)
  const isLand = (index: number) =>
    (bytes.charCodeAt(index >> 3) & (128 >> (index & 7))) !== 0
  const runs: string[] = []
  for (let row = 0; row < LAND_ROWS; row++) {
    let start = -1
    for (let column = 0; column <= LAND_COLUMNS; column++) {
      const land = column < LAND_COLUMNS && isLand(row * LAND_COLUMNS + column)
      if (land && start < 0) start = column
      if (!land && start >= 0) {
        runs.push(`M${start + 0.5} ${row + 0.5}h${column - start - 1}`)
        start = -1
      }
    }
  }
  landPath = runs.join('')
  return landPath
}

/** Longitude and latitude to a position on the dot map, as percentages. */
function projectPoint(lat: number, lon: number) {
  return {
    x: ((lon + 180) / 360) * 100,
    y: ((LAND_NORTH - lat) / (LAND_ROWS * LAND_STEP)) * 100,
  }
}

interface DotMapMarker {
  id: string
  lat: number
  lon: number
  name: string
  value: number
}

/** Marker diameter as a CSS length: area follows the value, with an 8px floor. */
function getMarkerSize(value: number, max: number, maxSize: number) {
  const scale = Math.sqrt(max > 0 ? Math.max(0, value) / max : 0)
  return `max(8px, min(${maxSize}px, 7cqw) * ${scale.toFixed(3)})`
}

interface DotMapProps {
  children?: ReactNode
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  describe: (marker: DotMapMarker) => string
  footer?: ReactNode
  format?: (value: number) => string
  label: string
  /** Writes the name of the largest marker beside it. */
  labelLargest?: boolean
  markers: DotMapMarker[]
  /** Fixes the size scale, so maps can be compared. */
  max?: number
  /** Diameter of the largest marker, in pixels. */
  maxSize?: number
  nameHeader?: string
  /** Adds each marker's share of the total to its tooltip. */
  showShare?: boolean
  valueHeader?: string
}

function DotMap({
  children,
  className,
  color = 'var(--color-chart-2)',
  describe,
  footer,
  format = (value) => formatNumber(value),
  label,
  labelLargest = false,
  markers,
  max: maxProp,
  maxSize = 28,
  nameHeader = 'Location',
  showShare = false,
  valueHeader = 'Value',
}: DotMapProps) {
  const sorted = [...markers].sort((a, b) => b.value - a.value)
  const positioned = sorted.map((marker) => ({
    ...marker,
    ...projectPoint(marker.lat, marker.lon),
  }))
  const { active, containerProps, getPointProps } = useMapReadout(
    positioned.map((marker) => ({
      id: marker.id,
      x: marker.x * (LAND_COLUMNS / LAND_ROWS),
      y: marker.y,
    })),
  )
  const state = useBlockState()
  const max = maxProp ?? Math.max(0, ...markers.map((marker) => marker.value))
  const activeMarker = markers.find((marker) => marker.id === active?.id)
  const total = markers.reduce((sum, marker) => sum + marker.value, 0)
  const markerColor = `color-mix(in oklab, ${color} 75%, transparent)`
  const largest = labelLargest ? positioned[0] : undefined

  if (state) {
    return (
      <div aria-hidden className={cn('@container flex flex-col gap-3', className)}>
        <svg
          viewBox={`0 0 ${LAND_COLUMNS} ${LAND_ROWS}`}
          className={cn(
            'w-full',
            state === 'loading' && 'animate-pulse motion-reduce:animate-none',
          )}
          style={{ aspectRatio: `${LAND_COLUMNS} / ${LAND_ROWS}` }}
        >
          <path
            d={getLandPath()}
            fill='none'
            stroke='color-mix(in oklab, var(--color-muted-foreground) 32%, transparent)'
            strokeDasharray='0 1'
            strokeLinecap='round'
            strokeWidth={0.55}
          />
        </svg>
        {state === 'loading' && <MapFooter footer={footer}>{children}</MapFooter>}
      </div>
    )
  }

  return (
    <div className={cn('@container flex flex-col gap-3', className)}>
      <div
        {...containerProps}
        role='group'
        aria-label={`${label}. Use the arrow keys to move between locations.`}
        className='relative'
        style={{ aspectRatio: `${LAND_COLUMNS} / ${LAND_ROWS}` }}
      >
        <svg
          aria-hidden
          viewBox={`0 0 ${LAND_COLUMNS} ${LAND_ROWS}`}
          className='absolute inset-0 size-full'
        >
          <path
            d={getLandPath()}
            fill='none'
            stroke='color-mix(in oklab, var(--color-muted-foreground) 32%, transparent)'
            strokeDasharray='0 1'
            strokeLinecap='round'
            strokeWidth={0.55}
          />
        </svg>
        {positioned.map((marker) => {
          const size = getMarkerSize(marker.value, max, maxSize)
          return (
            <button
              key={marker.id}
              type='button'
              aria-label={describe(marker)}
              className='group/marker absolute flex min-h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none'
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              {...getPointProps(marker.id)}
            >
              <span
                aria-hidden
                className={cn(
                  'ring-background group-focus-visible/marker:ring-foreground block rounded-full ring-2',
                  active?.id === marker.id && 'ring-foreground',
                )}
                style={{
                  backgroundColor: markerColor,
                  height: size,
                  width: size,
                }}
              />
            </button>
          )
        })}
        {largest && (
          <span
            aria-hidden
            className='pointer-events-none absolute -translate-y-1/2 text-xs font-medium whitespace-nowrap'
            style={{
              left: `${largest.x}%`,
              marginLeft: `calc(${getMarkerSize(largest.value, max, maxSize)} / 2 + 6px)`,
              top: `${largest.y}%`,
            }}
          >
            {largest.name}
          </span>
        )}
        <MapTooltip
          active={active}
          color={markerColor}
          format={format}
          name={activeMarker?.name}
          share={
            showShare && activeMarker && total > 0
              ? activeMarker.value / total
              : undefined
          }
          value={activeMarker?.value ?? null}
          valueHeader={valueHeader}
        />
      </div>
      <MapFooter footer={footer}>{children}</MapFooter>
      <GeoTable
        caption={label}
        format={format}
        nameHeader={nameHeader}
        rows={sorted}
        valueHeader={valueHeader}
      />
    </div>
  )
}

function niceFloor(value: number) {
  if (value <= 0) return 0
  const power = 10 ** Math.floor(Math.log10(value))
  const leading = value / power
  return (leading >= 5 ? 5 : leading >= 2 ? 2 : 1) * power
}

interface DotMapLegendProps {
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  format?: (value: number) => string
  /** The same `max` and `maxSize` the map uses. */
  max: number
  /** @default 28 */
  maxSize?: number
}

function DotMapLegend({
  className,
  color = 'var(--color-chart-2)',
  format = formatCompact,
  max,
  maxSize = 28,
}: DotMapLegendProps) {
  const steps = [...new Set([max / 4, max].map(niceFloor))].filter((value) => value > 0)
  return (
    <div
      aria-hidden
      className={cn('text-muted-foreground flex items-center gap-3 text-xs', className)}
    >
      {steps.map((value) => {
        const size = getMarkerSize(value, max, maxSize)
        return (
          <span key={value} className='flex items-center gap-1.5 tabular-nums'>
            <span
              className='shrink-0 rounded-full'
              style={{
                backgroundColor: `color-mix(in oklab, ${color} 75%, transparent)`,
                height: size,
                width: size,
              }}
            />
            {format(value)}
          </span>
        )
      })}
    </div>
  )
}

export {
  CountryFlag,
  DotMap,
  DotMapLegend,
  TileMap,
  US_STATE_TILES,
  countryFlag,
  getMarkerSize,
  projectPoint,
}

export type { DotMapLegendProps, DotMapMarker, DotMapProps, TileMapProps, TileMapTile }
