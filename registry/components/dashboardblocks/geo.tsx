'use client'

import { getHeatColor } from '@/registry/components/dashboardblocks/heatmap'
import { useInView } from '@/registry/hooks/use-in-view'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'

import { cn } from '@/lib/utils'

/** "GB" → 🇬🇧. Returns an empty string for anything that isn't a two-letter code. */
function countryFlag(code: string) {
  if (!/^[a-z]{2}$/i.test(code)) return ''
  const upper = code.toUpperCase()
  return String.fromCodePoint(
    0x1f1e6 + upper.charCodeAt(0) - 65,
    0x1f1e6 + upper.charCodeAt(1) - 65,
  )
}

/**
 * A country's flag as an emoji, or a globe without a code. Decorative: show
 * the country's name beside it. Some platforms, such as Windows, draw the two
 * letters instead of a flag.
 */
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

const compactFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
})

/** "1.2K", "3.4M". */
function formatCompact(value: number) {
  return compactFormatter.format(value)
}

interface MapPoint {
  id: string
  x: number
  y: number
}

/**
 * Shared hover and keyboard behaviour for maps: one Tab stop, the arrow keys
 * move to the nearest point in that direction, Home and End to the first and
 * last. Hovering, focusing or tapping a point makes it active.
 */
function useMapReadout(points: MapPoint[]) {
  const [active, setActive] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const container = useRef<HTMLDivElement>(null)
  const current = points.find((point) => point.id === cursor) ?? points[0]

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
    let next: MapPoint | null | undefined = null
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
    onClick: () => setActive(id),
    onFocus: () => {
      setCursor(id)
      setActive(id)
    },
    onPointerEnter: () => setActive(id),
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

interface GeoTableRow {
  id: string
  name: string
  value: number | null
}

/**
 * The map's data as a table for assistive technology, largest first. The
 * wrapper, not the table, is visually hidden: a table can't shrink below its
 * content width.
 */
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
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope='col'>{nameHeader}</th>
            <th scope='col'>{valueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id}>
              <th scope='row'>{row.name}</th>
              <td>{row.value === null ? 'No data' : format(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** The readout line under a map, with the legend beside it. */
function MapReadout({
  children,
  footer,
  text,
}: {
  children?: ReactNode
  footer?: ReactNode
  text: string | null
}) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2'>
      <p className='text-muted-foreground min-h-5 text-sm'>
        {text ? <span className='text-foreground'>{text}</span> : children}
      </p>
      {footer}
    </div>
  )
}

interface TileMapTile {
  /** Short label drawn on the tile, e.g. "CA". */
  code: string
  /** Column and row on the grid, from 0. */
  column: number
  id: string
  /** Full name for the readout and assistive technology. */
  name: string
  row: number
}

/** The 50 states and DC as a square tile grid, 11 columns by 8 rows. */
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
  /** Shown under the map when no tile is active, such as the top tile. */
  children?: ReactNode
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  /** Describes a tile, e.g. "California: $412,300". Read on focus and hover. */
  describe: (tile: TileMapTile, value: number | null) => string
  /** Shown beside the readout, usually a `HeatmapLegend`. */
  footer?: ReactNode
  format?: (value: number) => string
  /** Names the map and its data table for assistive technology. */
  label: string
  /** Fixes the colour scale. Defaults to the values' extent. */
  max?: number
  min?: number
  /** Heads the name column of the data table. @default 'Region' */
  nameHeader?: string
  /**
   * `sqrt` spreads out skewed values, such as counts that follow population,
   * so the smaller tiles don't all look the same. @default 'linear'
   */
  scale?: 'linear' | 'sqrt'
  tiles: TileMapTile[]
  /** Heads the value column of the data table. @default 'Value' */
  valueHeader?: string
  /** By tile id. Missing tiles are drawn dashed, as no data. */
  values: Record<string, number | null | undefined>
}

/**
 * A tile grid map: one equal square per region, coloured by value, so small
 * regions are as visible as large ones. Hover, focus or tap a tile to read it
 * under the map; screen readers also get the data as a table.
 */
function TileMap({
  children,
  className,
  color,
  describe,
  footer,
  format = (value) => value.toLocaleString('en-US'),
  label,
  max: maxProp,
  min: minProp,
  nameHeader = 'Region',
  scale = 'linear',
  tiles,
  valueHeader = 'Value',
  values,
}: TileMapProps) {
  const { active, containerProps, getPointProps } = useMapReadout(
    tiles.map((tile) => ({ id: tile.id, x: tile.column, y: tile.row })),
  )
  const known = tiles
    .map((tile) => values[tile.id])
    .filter((value): value is number => typeof value === 'number')
  const min = minProp ?? (known.length ? Math.min(...known) : 0)
  const max = maxProp ?? (known.length ? Math.max(...known) : 0)
  const transform = scale === 'sqrt' ? Math.sqrt : (value: number) => value
  const range = transform(max) - transform(min) || 1
  const columns = Math.max(...tiles.map((tile) => tile.column)) + 1
  const activeTile = tiles.find((tile) => tile.id === active)

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        {...containerProps}
        role='group'
        aria-label={`${label}. Use the arrow keys to move between tiles.`}
        className='@container grid gap-[3px]'
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {tiles.map((tile) => {
          const value = values[tile.id] ?? null
          const t = value === null ? 0 : (transform(value) - transform(min)) / range
          return (
            <button
              key={tile.id}
              type='button'
              aria-label={describe(tile, value)}
              className={cn(
                'ring-offset-card flex aspect-square min-w-0 items-center justify-center rounded-[3px] text-[length:clamp(0.5rem,2.6cqw,0.75rem)] font-medium outline-none',
                value === null && 'text-muted-foreground border border-dashed',
                'focus-visible:ring-foreground focus-visible:ring-2 focus-visible:ring-offset-1',
                active === tile.id && 'ring-foreground ring-2 ring-offset-1',
              )}
              style={{
                backgroundColor:
                  value === null ? undefined : getHeatColor(Math.max(0, t), color),
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
      <MapReadout
        footer={footer}
        text={activeTile ? describe(activeTile, values[activeTile.id] ?? null) : null}
      >
        {children}
      </MapReadout>
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

/**
 * Land on a 2.5° grid from 84°N to 56°S, one bit per cell, row by row from
 * the north-west, base64 encoded (about 1.3 KB). Rasterised from Natural
 * Earth's 1:110m land, which is in the public domain.
 */
const LAND_MASK =
  'AAAAAB////8AAAAAAAAAAAAAAAAAAH/////gD+AQAAcAAAAAAAAAk3/f//8AB8AAAADgAAAAAAABff8A//8AAAAD4D/8AfAAAAAD/f/Af/8AAAAGG///8PAAgf8/fv/4P/4AAfgG///////v5/////9+P/gAB///////////9/////7+H8PAD/3/////////E/////f8HwAAP///////////B////+ByBgAAP3////////z4AOB///B+AAAGPv///////4OAAYAf//7/gAAPH////////gOAAAAf////wAAP/////////8MAAAAH////wAAD/////////8AAAAAD///84AAD/////////4AAAAAD////AAAB//f//////oAAAAAD///wAAAP7/Tv/////MAAAAAD///gAAAPF//3////8IAAAAAB///AAAAPNP/3////sYAAAAAB///AAAAH+Gf/////PwAAAAAAf/8AAAAP/MP/////jAAAAAAAf/8AAAAP////////gAAAAAAAP8EAAAA/////////gAAAAAAAH4EAAAA///37////AAAAAAAAB4OAAAB/////H//+gAAAAAAAA9hQAAB///7/D+f4AAAAAAAAA/gYAAB////+B8fwgAAAAAAAAH4AAAB////4BwHwgAAAAAAAAA4AAAB////gAwHwQAAAAAAAAAb/AAA////4AwFgQAAAAAAAAAH/gAAf///wAIEAYAAAAAAAAAB/4AAPv//wAALDAAAAAAAAAAB/8AAAH//gAAHOAAAAAAAAAAD/+AAAH//AAAHfEAAAAAAAAAH//wAAH/+AAADPn4AAAAAAAAH//8AAD/8AAABhB/gAAAAAAAD//8AAB/8AAAA8AeIAAAAAAAD//8AAB/8AAAAB4JCAAAAAAAB//4AAB/+AAAAADsAAAAAAAAB//4AAB/+QAAAAPsAAAAAAAAAf/4AAD/9wAAAAf+ABAAAAAAAP/wAAB/xwAAAB/+AAAAAAAAAP/wAAB/5wAAAH//AAAAAAAAAf/AAAA/xgAAAH//gAAAAAAAAf+AAAA/gAAAAH//wAAAAAAAAf8AAAA/gAAAAD//wAAAAAAAAf8AAAAfAAAAAD//gAAAAAAAAf4AAAAYAAAAADg/gEAAAAAAA/wAAAAAAAAAAAAPACAAAAAAA+AAAAAAAAAAAAAAAGAAAAAAA+AAAAAAAAAAAAADAMAAAAAAA8AAAAAAAAAAAAAAAYAAAAAAA8AAAAAAAAAAAAAAAQAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAA4gAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAA'
const LAND_COLUMNS = 144
const LAND_ROWS = 56
const LAND_NORTH = 84
const LAND_STEP = 2.5

let landPath: string | null = null

/**
 * The land mask as one SVG path of horizontal runs, one unit per cell. Drawn
 * with round caps and a `0 1` dash, each run becomes a row of dots.
 */
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
  /** Full name for the readout and assistive technology, e.g. "London, UK". */
  name: string
  value: number
}

/**
 * Marker diameter as a CSS length: area follows the value, with an 8px floor.
 * The largest marker is `maxSize` pixels, or 7% of the map's width on narrow
 * maps. Resolves against the `DotMap`, so use it inside one.
 */
function getMarkerSize(value: number, max: number, maxSize: number) {
  const scale = Math.sqrt(max > 0 ? Math.max(0, value) / max : 0)
  return `max(8px, min(${maxSize}px, 7cqw) * ${scale.toFixed(3)})`
}

interface DotMapProps {
  /** Shown under the map when no marker is active, such as the top location. */
  children?: ReactNode
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  /** Describes a marker, e.g. "London, UK: 3,420 active users". Read on focus and hover. */
  describe: (marker: DotMapMarker) => string
  /** Shown beside the readout, usually a `DotMapLegend`. */
  footer?: ReactNode
  format?: (value: number) => string
  /** Names the map and its data table for assistive technology. */
  label: string
  markers: DotMapMarker[]
  /** Fixes the size scale, so maps can be compared. Defaults to the largest value. */
  max?: number
  /** Diameter of the largest marker, in pixels. Narrow maps shrink it. @default 28 */
  maxSize?: number
  /** Heads the name column of the data table. @default 'Location' */
  nameHeader?: string
  /** Heads the value column of the data table. @default 'Value' */
  valueHeader?: string
}

/**
 * A dotted world map with markers sized by value. The land is a tiny
 * embedded mask, so there are no map libraries or data files to load.
 * Hover, focus or tap a marker to read it under the map; screen readers also
 * get the data as a table.
 */
function DotMap({
  children,
  className,
  color = 'var(--chart-1)',
  describe,
  footer,
  format = (value) => value.toLocaleString('en-US'),
  label,
  markers,
  max: maxProp,
  maxSize = 28,
  nameHeader = 'Location',
  valueHeader = 'Value',
}: DotMapProps) {
  // Largest first, so smaller markers sit on top and Home starts at the top location.
  const sorted = [...markers].sort((a, b) => b.value - a.value)
  const positioned = sorted.map((marker) => ({
    ...marker,
    ...projectPoint(marker.lat, marker.lon),
  }))
  const { active, containerProps, getPointProps } = useMapReadout(
    // Points in pixels-ish units: the map is about 2.6 times wider than tall.
    positioned.map((marker) => ({
      id: marker.id,
      x: marker.x * (LAND_COLUMNS / LAND_ROWS),
      y: marker.y,
    })),
  )
  const max = maxProp ?? Math.max(0, ...markers.map((marker) => marker.value))
  const activeMarker = markers.find((marker) => marker.id === active)

  return (
    // A size container, so markers and the legend scale with the map's width.
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
            stroke='color-mix(in oklab, var(--muted-foreground) 32%, transparent)'
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
                  'ring-card group-focus-visible/marker:ring-foreground block rounded-full ring-2',
                  active === marker.id && 'ring-foreground',
                )}
                style={{
                  backgroundColor: `color-mix(in oklab, ${color} 75%, transparent)`,
                  height: size,
                  width: size,
                }}
              />
            </button>
          )
        })}
      </div>
      <MapReadout footer={footer} text={activeMarker ? describe(activeMarker) : null}>
        {children}
      </MapReadout>
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

/** The largest 1, 2 or 5 times a power of ten at or below `value`. */
function niceFloor(value: number) {
  if (value <= 0) return 0
  const power = 10 ** Math.floor(Math.log10(value))
  const leading = value / power
  return (leading >= 5 ? 5 : leading >= 2 ? 2 : 1) * power
}

interface DotMapLegendProps {
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  format?: (value: number) => string
  /** The same `max` and `maxSize` the map uses. */
  max: number
  /** @default 28 */
  maxSize?: number
}

/**
 * Two reference markers at round values, on the map's size scale. Smaller
 * values would all hit the 8px floor on narrow maps. Pass it as the map's
 * `footer`.
 */
function DotMapLegend({
  className,
  color = 'var(--chart-1)',
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

interface ShareBarProps {
  animated?: boolean
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  /** Filled share of the track, 0–1. */
  value: number
}

/** A thin bar for a share, revealed once in view. Decorative: show the value as text. */
function ShareBar({
  animated = true,
  className,
  color = 'var(--chart-1)',
  value,
}: ShareBarProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  const share = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      aria-hidden
      className={cn('bg-muted h-1.5 w-full overflow-hidden rounded-full', className)}
    >
      <div
        className='h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
        style={{ backgroundColor: color, width: `${(revealed ? share : 0) * 100}%` }}
      />
    </div>
  )
}

export {
  CountryFlag,
  DotMap,
  DotMapLegend,
  ShareBar,
  TileMap,
  US_STATE_TILES,
  countryFlag,
  formatCompact,
  getMarkerSize,
  projectPoint,
}

export type {
  DotMapLegendProps,
  DotMapMarker,
  DotMapProps,
  ShareBarProps,
  TileMapProps,
  TileMapTile,
}
