'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipFrame,
  ChartTooltipItem,
} from '@/registry/components/dashboardblocks/chart'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import {
  ResponsiveContainer,
  Sankey,
  type SankeyLinkProps,
  type SankeyNodeProps,
  Tooltip,
} from 'recharts'

import { cn } from '@/lib/utils'

interface FlowNode {
  color?: string
  id: string
  /** `exit` draws grey, for people who left. `gap` draws nothing and holds its place, so a node after it keeps its column. */
  kind?: 'default' | 'exit' | 'gap'
  label: string
}

interface FlowLink {
  source: string
  target: string
  value: number
}

interface FlowLayoutNode extends FlowNode {
  color: string
  column: number
  value: number
}

const flowPalette = [
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-1)',
]
const exitColor = 'var(--color-muted-foreground)'

/** A path through the flow, drawn as its own band over the rest. */
interface FlowHighlight {
  /** Node ids in order, one per column. */
  nodes: string[]
  /** How many took the whole path: the band's width. */
  value: number
}

const NODE_WIDTH = 8
/** How long after the column before each column starts to draw, in milliseconds. */
const COLUMN_DELAY = 220

const flowStyles = `
  @keyframes dashboardblocks-flow-draw {
    from { stroke-dashoffset: 1; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes dashboardblocks-flow-fade {
    from { opacity: 0; }
  }
  @media (prefers-reduced-motion: no-preference) {
    [data-flow-drawing] [data-flow-draw], [data-flow-draw='band'] {
      stroke-dasharray: 1;
      animation: dashboardblocks-flow-draw 700ms cubic-bezier(0.2, 0, 0, 1) both;
    }
    [data-flow-draw='band'] { animation-duration: 450ms; }
    [data-flow-drawing] [data-flow-fade] { animation: dashboardblocks-flow-fade 500ms cubic-bezier(0.2, 0, 0, 1) both; }
  }
`
const LABEL_GAP = 6
const TWO_LINE_LABEL_HEIGHT = 22
/** About how tall a node's tooltip is, to keep it clear of the node's label and inside the chart. */
const TOOLTIP_HEIGHT = 56

function getFlowTotals(nodes: FlowNode[], links: FlowLink[]) {
  const totals = new Map(nodes.map((node) => [node.id, { in: 0, out: 0 }]))
  for (const link of links) {
    const source = totals.get(link.source)
    const target = totals.get(link.target)
    if (source) source.out += link.value
    if (target) target.in += link.value
  }
  return totals
}

function getFlowColumns(nodes: FlowNode[], links: FlowLink[]) {
  const columns = new Map<string, number>()
  const visit = (id: string, seen: Set<string>): number => {
    const known = columns.get(id)
    if (known !== undefined) return known
    const parents = links.filter((link) => link.target === id && !seen.has(link.source))
    const column = parents.length
      ? Math.max(...parents.map((link) => visit(link.source, new Set([...seen, id])) + 1))
      : 0
    columns.set(id, column)
    return column
  }
  for (const node of nodes) visit(node.id, new Set())
  return columns
}

function getFlowNodes(
  nodes: FlowNode[],
  links: FlowLink[],
  colorBy: 'source' | 'target' = 'source',
): FlowLayoutNode[] {
  const totals = getFlowTotals(nodes, links)
  const columns = getFlowColumns(nodes, links)
  const lastColumn = Math.max(0, ...columns.values())
  const placed = new Map<string, FlowLayoutNode>()
  for (let column = 0; column <= lastColumn; column++) {
    nodes
      .filter((node) => columns.get(node.id) === column)
      .forEach((node, index) => {
        const total = totals.get(node.id)
        placed.set(node.id, {
          ...node,
          color:
            node.color ??
            (node.kind === 'exit' ? exitColor : flowPalette[index % flowPalette.length]),
          column,
          value: total ? Math.max(total.in, total.out) : 0,
        })
      })
  }
  for (let column = 1; colorBy === 'source' && column <= lastColumn; column++) {
    for (const original of nodes) {
      const node = placed.get(original.id)
      if (!node || node.column !== column || original.color || original.kind === 'exit') {
        continue
      }
      const largest = links
        .filter((link) => link.target === node.id)
        .sort((a, b) => b.value - a.value)[0]
      if (largest) node.color = placed.get(largest.source)?.color ?? node.color
    }
  }
  return nodes.flatMap((node) => {
    const laidOut = placed.get(node.id)
    return laidOut ? [laidOut] : []
  })
}

/** What the pointer is on; a node keeps the y its tooltip goes at, clear of its label. */
type FlowActive = { link: number } | { node: string; tooltipY: number } | null

interface FlowChartProps {
  className?: string
  /** @default 'source' */
  colorBy?: 'source' | 'target'
  /** The muted text beside a hovered band's value. @default its share of the source */
  describeLink?: (
    link: FlowLink,
    source: FlowLayoutNode,
    target: FlowLayoutNode,
  ) => string
  /** The muted text beside a hovered node's value. */
  describeNode?: (node: FlowLayoutNode) => string
  /** Draws the bands into and out of this node id stronger than the rest. */
  emphasis?: string
  format?: (value: number) => string
  /** @default 280 */
  height?: number
  /** Lights one path and fades the rest. */
  highlight?: FlowHighlight
  /** Names the chart, and the sideways scroll region `minWidth` adds. @default 'Flow' */
  label?: string
  /**
   * `inside` puts the last column's labels left of its bars, at the chart's right edge. `outside`
   * puts them right of the bars, like every other column's, and spaces the columns evenly, so
   * column `c` of `n` starts at `c / n` of the width.
   * @default 'inside'
   */
  lastLabels?: 'inside' | 'outside'
  links: FlowLink[]
  /** Keeps labels legible in narrow cards: below this width the chart scrolls sideways. */
  minWidth?: string
  nodes: FlowNode[]
  /** Makes each node a button that calls this. The chart is one tab stop, and the arrow keys move between nodes. */
  onNodeSelect?: (node: FlowLayoutNode) => void
}

function FlowChart({
  className,
  colorBy = 'source',
  describeLink,
  describeNode,
  emphasis,
  format = (value) => formatNumber(value),
  height = 280,
  highlight,
  label = 'Flow',
  lastLabels = 'inside',
  links,
  minWidth,
  nodes,
  onNodeSelect,
}: FlowChartProps) {
  const [active, setActive] = useState<FlowActive>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const chart = useRef<HTMLDivElement>(null)
  const state = useBlockState()
  const laidOut = getFlowNodes(nodes, links, colorBy)
  const byId = new Map(laidOut.map((node) => [node.id, node]))
  const indexOf = new Map(laidOut.map((node, index) => [node.id, index]))
  const lastColumn = Math.max(0, ...laidOut.map((node) => node.column))
  const isGap = (id: string) => byId.get(id)?.kind === 'gap'
  const lit = new Set(highlight?.nodes)
  const highlightKey = highlight?.nodes.join('>')
  const reachable = laidOut.filter((node) => node.kind !== 'gap')
  const roving =
    reachable.find((node) => node.id === cursor) ??
    reachable.find((node) => lit.has(node.id)) ??
    reachable[0]

  const moveFocus = (from: FlowLayoutNode, key: string) => {
    const column = reachable.filter((node) => node.column === from.column)
    const at = column.indexOf(from)
    let next: FlowLayoutNode | undefined
    if (key === 'ArrowUp') next = column[at - 1]
    else if (key === 'ArrowDown') next = column[at + 1]
    else {
      const side = reachable.filter(
        (node) => node.column === from.column + (key === 'ArrowRight' ? 1 : -1),
      )
      next = side.find((node) => lit.has(node.id)) ?? side[Math.min(at, side.length - 1)]
    }
    if (!next) return
    setCursor(next.id)
    chart.current
      ?.querySelector<SVGGElement>(`[data-flow-node="${CSS.escape(next.id)}"]`)
      ?.focus()
  }
  /** Where a link sits on the highlighted path, or -1 when it's off it. */
  const segmentOf = (link: FlowLink) => {
    const at = highlight ? highlight.nodes.indexOf(link.source) : -1
    return at >= 0 && highlight?.nodes[at + 1] === link.target ? at : -1
  }
  // Drawing again when the data changes, so a new query draws in like the first.
  const drawKey = links
    .map((link) => `${link.source}>${link.target}:${link.value}`)
    .join()
  // Recharts keys each node by its position, so a resize mounts the nodes again: they only
  // draw in until the data's first draw has ended.
  const [drawnKey, setDrawnKey] = useState<string | null>(null)
  useEffect(() => {
    if (drawnKey === drawKey) return
    const timer = setTimeout(() => setDrawnKey(drawKey), lastColumn * COLUMN_DELAY + 700)
    return () => clearTimeout(timer)
  }, [drawKey, drawnKey, lastColumn])
  const data = {
    links: links.flatMap((link) => {
      const source = indexOf.get(link.source)
      const target = indexOf.get(link.target)
      return source === undefined || target === undefined
        ? []
        : [{ source, target, value: link.value }]
    }),
    nodes: laidOut.map((node) => ({ ...node, name: node.label })),
  }

  const isLinkActive = (link: FlowLink, index: number) => {
    if (!active) return false
    if ('link' in active) return active.link === index
    return link.source === active.node || link.target === active.node
  }
  const isNodeActive = (node: FlowLayoutNode) => {
    if (!active) return false
    if ('node' in active) return active.node === node.id
    const link = links[active.link]
    return link?.source === node.id || link?.target === node.id
  }

  const tooltip = () => {
    if (!active) return null
    if ('link' in active) {
      const link = links[active.link]
      const source = link && byId.get(link.source)
      const target = link && byId.get(link.target)
      if (!link || !source || !target) return null
      const share = formatPercent(source.value > 0 ? link.value / source.value : 0, {
        maximumFractionDigits: 0,
      })
      return {
        color: target.kind === 'exit' ? exitColor : source.color,
        heading: `${source.label} → ${target.label}`,
        name: describeLink
          ? describeLink(link, source, target)
          : `${share} of ${source.label}`,
        value: link.value,
      }
    }
    const node = byId.get(active.node)
    if (!node) return null
    return {
      color: node.color,
      heading: node.label,
      name: describeNode?.(node),
      value: node.value,
    }
  }

  const renderLink = (shape: SankeyLinkProps) => {
    const link = links[shape.index]
    const source = link && byId.get(link.source)
    const target = link && byId.get(link.target)
    if (!link || !source || !target || source.kind === 'gap' || target.kind === 'gap') {
      return <path />
    }
    const segment = segmentOf(link)
    const emphasised =
      emphasis !== undefined && (link.source === emphasis || link.target === emphasis)
    const opacity = active
      ? isLinkActive(link, shape.index)
        ? 0.6
        : 0.12
      : highlight
        ? segment >= 0
          ? 0.24
          : 0.12
        : emphasis === undefined
          ? 0.32
          : emphasised
            ? 0.5
            : 0.2
    const stroke =
      target.kind === 'exit'
        ? exitColor
        : colorBy === 'target'
          ? target.color
          : source.color
    const width = Math.max(1, shape.linkWidth)
    const curve = (offset: number) =>
      `M${shape.sourceX},${shape.sourceY + offset} C${shape.sourceControlX},${shape.sourceY + offset} ${shape.targetControlX},${shape.targetY + offset} ${shape.targetX},${shape.targetY + offset}`
    const bandWidth =
      highlight && segment >= 0 && link.value > 0
        ? Math.min(width, Math.max(2, (width * highlight.value) / link.value))
        : 0
    return (
      <g>
        <path
          data-flow-draw=''
          d={curve(0)}
          fill='none'
          pathLength={1}
          stroke={stroke}
          strokeOpacity={target.kind === 'exit' ? opacity * 0.6 : opacity}
          strokeWidth={width}
          className='transition-[stroke-opacity] duration-200'
          style={{ animationDelay: `${source.column * COLUMN_DELAY}ms` }}
        />
        {bandWidth > 0 && (
          <path
            key={highlightKey}
            data-flow-draw='band'
            d={curve((bandWidth - width) / 2)}
            fill='none'
            pathLength={1}
            stroke={stroke}
            strokeOpacity={target.kind === 'exit' ? 0.5 : 0.8}
            strokeWidth={bandWidth}
            className='pointer-events-none'
            style={{ animationDelay: `${segment * COLUMN_DELAY}ms` }}
          />
        )}
      </g>
    )
  }

  const renderNode = (shape: SankeyNodeProps) => {
    const node = byId.get(String((shape.payload as { id?: string }).id))
    if (!node || node.kind === 'gap') return <g />
    const last = lastLabels === 'inside' && node.column === lastColumn && lastColumn > 0
    const dimmed = active !== null && !isNodeActive(node)
    // Off the highlighted path the bar fades but its label stays readable.
    const faded = !dimmed && highlight !== undefined && !lit.has(node.id)
    const textX = last ? shape.x - LABEL_GAP : shape.x + shape.width + LABEL_GAP
    const centre = shape.y + shape.height / 2
    const twoLines = shape.height > TWO_LINE_LABEL_HEIGHT
    const select = onNodeSelect
      ? {
          'aria-label': `${node.label} ${format(node.value)}`,
          'aria-pressed': lit.has(node.id),
          'data-flow-node': node.id,
          onClick: () => {
            setCursor(node.id)
            onNodeSelect(node)
          },
          onFocus: () => setCursor(node.id),
          onKeyDown: (event: KeyboardEvent) => {
            if (event.key.startsWith('Arrow')) {
              event.preventDefault()
              moveFocus(node, event.key)
              return
            }
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            onNodeSelect(node)
          },
          role: 'button',
          tabIndex: node.id === roving?.id ? 0 : -1,
        }
      : {}
    return (
      <g
        {...select}
        data-flow-fade=''
        className={cn(
          'group/flow-node focus-visible:outline-ring transition-opacity duration-200 outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
          onNodeSelect && 'cursor-pointer',
        )}
        opacity={dimmed ? 0.45 : 1}
        style={{ animationDelay: `${node.column * COLUMN_DELAY}ms` }}
      >
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={Math.max(1, shape.height)}
          rx={2}
          fill={node.color}
          opacity={faded ? 0.35 : 1}
          className='transition-opacity duration-200'
        />
        <foreignObject x={textX} y={centre} width={1} height={1} overflow='visible'>
          <span
            className={cn(
              'bg-background absolute top-0 -translate-y-1/2 rounded-sm px-1 text-xs leading-tight whitespace-nowrap',
              last ? 'right-0 -mr-1 text-end' : 'left-0 -ml-1',
              onNodeSelect &&
                'group-focus-visible/flow-node:ring-ring group-focus-visible/flow-node:ring-2',
            )}
          >
            <span
              className={faded ? 'text-muted-foreground' : 'text-foreground font-medium'}
            >
              {node.label}
            </span>{' '}
            <span
              className={cn('text-muted-foreground tabular-nums', twoLines && 'block')}
            >
              {format(node.value)}
            </span>
          </span>
        </foreignObject>
      </g>
    )
  }

  if (state) return <ChartPlaceholder className={className} height={height} />

  return (
    <div
      role={minWidth ? 'region' : undefined}
      aria-label={minWidth ? label : undefined}
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must be focusable so keyboard users can reach the columns that don't fit
      tabIndex={minWidth ? 0 : undefined}
      className={cn(
        minWidth &&
          'focus-visible:ring-ring/50 -my-1 overflow-x-auto rounded-sm py-1 outline-none focus-visible:ring-3',
        className,
      )}
    >
      <style href='dashboardblocks-flow' precedence='default'>
        {flowStyles}
      </style>
      <div
        ref={chart}
        role={onNodeSelect ? 'group' : 'img'}
        aria-label={
          onNodeSelect ? `${label}. Use the arrow keys to move between steps.` : label
        }
        style={{ height, minWidth }}
      >
        <div
          key={drawKey}
          data-flow-drawing={drawnKey === drawKey ? undefined : ''}
          className='h-full [&_.recharts-surface]:overflow-visible'
          onPointerLeave={() => setActive(null)}
          style={{
            width:
              lastLabels === 'outside' && lastColumn > 0
                ? `calc(100% * ${lastColumn} / ${lastColumn + 1} + ${NODE_WIDTH}px)`
                : undefined,
          }}
        >
          <ResponsiveContainer width='100%' height='100%'>
            <Sankey
              accessibilityLayer={false}
              align='left'
              data={data}
              iterations={32}
              link={renderLink}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              node={renderNode}
              nodePadding={12}
              nodeWidth={NODE_WIDTH}
              onMouseEnter={(item, type) => {
                if (type === 'link' && 'linkWidth' in item) {
                  const link = links[item.index]
                  if (link && !isGap(link.source) && !isGap(link.target)) {
                    setActive({ link: item.index })
                  }
                }
                if (type === 'node' && 'payload' in item && 'id' in item.payload) {
                  const id = String(item.payload.id)
                  const { payload } = item
                  const centre =
                    'y' in payload && 'dy' in payload ? payload.y + payload.dy / 2 : 0
                  const clear = TWO_LINE_LABEL_HEIGHT / 2 + LABEL_GAP * 2
                  const tooltipY =
                    centre + clear + TOOLTIP_HEIGHT <= height
                      ? centre + clear
                      : centre - clear - TOOLTIP_HEIGHT
                  if (!isGap(id)) setActive({ node: id, tooltipY })
                }
              }}
              sort={false}
            >
              <Tooltip
                active={active !== null}
                position={active && 'node' in active ? { y: active.tooltipY } : undefined}
                content={() => {
                  const item = tooltip()
                  if (!item) return null
                  return (
                    <ChartTooltipFrame>
                      <span className='font-medium'>{item.heading}</span>
                      <ChartTooltipItem
                        color={item.color}
                        name={item.name}
                        value={format(item.value)}
                      />
                    </ChartTooltipFrame>
                  )
                }}
              />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

interface FlowPathStep {
  label: string
}

function FlowPathSteps({
  className,
  steps,
}: {
  className?: string
  steps: FlowPathStep[]
}) {
  return (
    <ol className={cn('flex flex-wrap items-center gap-x-1.5 text-sm', className)}>
      {steps.map((step, index) => (
        <li key={`${step.label}-${index}`} className='flex items-center gap-1.5'>
          {index > 0 && (
            <span aria-hidden className='text-muted-foreground'>
              →
            </span>
          )}
          <span className='font-medium whitespace-nowrap'>{step.label}</span>
        </li>
      ))}
    </ol>
  )
}

export {
  FlowChart,
  FlowPathSteps,
  flowPalette,
  getFlowColumns,
  getFlowNodes,
  getFlowTotals,
}

export type {
  FlowChartProps,
  FlowHighlight,
  FlowLayoutNode,
  FlowLink,
  FlowNode,
  FlowPathStep,
}
