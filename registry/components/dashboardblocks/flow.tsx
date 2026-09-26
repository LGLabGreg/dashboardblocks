'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface FlowNode {
  /** Overrides the colour picked from the node's position. */
  color?: string
  /** Which column the node sits in. Defaults to its longest path from a source. */
  column?: number
  id: string
  /** Drop-offs, such as "Exit", are drawn muted. */
  kind?: 'default' | 'exit'
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
  height: number
  value: number
  x: number
  y: number
}

interface FlowLayoutLink extends FlowLink {
  index: number
  /** Top of the band where it leaves the source. */
  sy: number
  thickness: number
  /** Top of the band where it enters the target. */
  ty: number
}

interface FlowLayoutOptions {
  /**
   * 'source' keeps each source's colour downstream, for flows that split
   * from several sources. 'target' colours each node by its position and each
   * band by where it goes, for a single source splitting into outcomes.
   * @default 'source'
   */
  colorBy?: 'source' | 'target'
  height: number
  /** @default 8 */
  nodeWidth?: number
  /** Vertical gap between nodes in a column. @default 12 */
  nodePadding?: number
  width: number
}

const flowPalette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]
const exitColor = 'var(--muted-foreground)'

/** Each node's in and out totals; a node's value is the larger of the two. */
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

/**
 * Places nodes in columns and links as bands between them. Nodes keep the
 * order they're given within a column; links leave and enter nodes in the
 * order of the nodes at their other end, so bands don't cross needlessly.
 */
function layoutFlow(
  nodes: FlowNode[],
  links: FlowLink[],
  {
    colorBy = 'source',
    height,
    nodePadding = 12,
    nodeWidth = 8,
    width,
  }: FlowLayoutOptions,
) {
  const totals = getFlowTotals(nodes, links)
  // Longest path from a source, for nodes without a column.
  const depth = new Map<string, number>()
  const visit = (id: string, seen: Set<string>): number => {
    if (depth.has(id)) return depth.get(id)!
    const node = nodes.find((candidate) => candidate.id === id)
    if (node?.column !== undefined) return node.column
    const parents = links.filter((link) => link.target === id && !seen.has(link.source))
    const value = parents.length
      ? Math.max(...parents.map((link) => visit(link.source, new Set([...seen, id])) + 1))
      : 0
    depth.set(id, value)
    return value
  }
  const columns = nodes.map((node) => node.column ?? visit(node.id, new Set()))
  const lastColumn = Math.max(0, ...columns)
  const byColumn = Array.from({ length: lastColumn + 1 }, (_, column) =>
    nodes
      .map((node, index) => ({ column: columns[index], node }))
      .filter((entry) => entry.column === column),
  )
  const valueOf = (id: string) => {
    const total = totals.get(id)
    return total ? Math.max(total.in, total.out) : 0
  }
  const scale = Math.min(
    ...byColumn
      .filter((column) => column.length > 0)
      .map((column) => {
        const sum = column.reduce((total, entry) => total + valueOf(entry.node.id), 0)
        return sum > 0 ? (height - (column.length - 1) * nodePadding) / sum : Infinity
      }),
  )
  const ky = Number.isFinite(scale) ? Math.max(0, scale) : 0

  const placed = new Map<string, FlowLayoutNode>()
  byColumn.forEach((column, columnIndex) => {
    const total =
      column.reduce((sum, entry) => sum + valueOf(entry.node.id) * ky, 0) +
      Math.max(0, column.length - 1) * nodePadding
    let y = (height - total) / 2
    column.forEach((entry, index) => {
      const value = valueOf(entry.node.id)
      const color =
        entry.node.color ??
        (entry.node.kind === 'exit' ? exitColor : flowPalette[index % flowPalette.length])
      placed.set(entry.node.id, {
        ...entry.node,
        color,
        column: columnIndex,
        height: value * ky,
        value,
        x: lastColumn > 0 ? (columnIndex / lastColumn) * (width - nodeWidth) : 0,
        y,
      })
      y += value * ky + nodePadding
    })
  })
  // Downstream nodes take the colour of their largest source, so a flow keeps its hue.
  for (let column = 1; colorBy === 'source' && column <= lastColumn; column++) {
    for (const entry of byColumn[column]) {
      const node = placed.get(entry.node.id)!
      if (entry.node.color || entry.node.kind === 'exit') continue
      const largest = links
        .filter((link) => link.target === node.id)
        .sort((a, b) => b.value - a.value)[0]
      if (largest) node.color = placed.get(largest.source)?.color ?? node.color
    }
  }

  const outOffset = new Map<string, number>()
  const inOffset = new Map<string, number>()
  const laidOut: FlowLayoutLink[] = links.map((link, index) => ({
    ...link,
    index,
    sy: 0,
    thickness: link.value * ky,
    ty: 0,
  }))
  const centre = (id: string) => {
    const node = placed.get(id)
    return node ? node.y + node.height / 2 : 0
  }
  ;[...laidOut]
    .sort((a, b) => centre(a.target) - centre(b.target))
    .forEach((link) => {
      const offset = outOffset.get(link.source) ?? 0
      link.sy = (placed.get(link.source)?.y ?? 0) + offset
      outOffset.set(link.source, offset + link.thickness)
    })
  ;[...laidOut]
    .sort((a, b) => centre(a.source) - centre(b.source))
    .forEach((link) => {
      const offset = inOffset.get(link.target) ?? 0
      link.ty = (placed.get(link.target)?.y ?? 0) + offset
      inOffset.set(link.target, offset + link.thickness)
    })

  return { lastColumn, links: laidOut, nodes: [...placed.values()] }
}

/** A band from source to target, as a filled path with curved edges. */
function getFlowPath(x0: number, x1: number, sy: number, ty: number, thickness: number) {
  const xm = (x0 + x1) / 2
  return [
    `M${x0},${sy}`,
    `C${xm},${sy} ${xm},${ty} ${x1},${ty}`,
    `L${x1},${ty + thickness}`,
    `C${xm},${ty + thickness} ${xm},${sy + thickness} ${x0},${sy + thickness}`,
    'Z',
  ].join(' ')
}

type FlowActive = { link: number } | { node: string } | null

interface FlowChartProps {
  /** Shown under the chart when nothing is hovered, such as a summary. */
  children?: ReactNode
  className?: string
  /** @default 'source' */
  colorBy?: FlowLayoutOptions['colorBy']
  /** Describes a hovered link for the readout. */
  describeLink?: (
    link: FlowLink,
    source: FlowLayoutNode,
    target: FlowLayoutNode,
  ) => string
  /** Describes a hovered node for the readout. */
  describeNode?: (node: FlowLayoutNode) => string
  format?: (value: number) => string
  /** @default 280 */
  height?: number
  links: FlowLink[]
  /**
   * Keeps labels legible in narrow cards: below this width the chart scrolls
   * sideways. E.g. '36rem'.
   */
  minWidth?: string
  nodes: FlowNode[]
}

/**
 * A Sankey diagram: nodes in columns, joined by bands as wide as the flow
 * between them. Hovering a node or band highlights what it connects and
 * reads it out under the chart. Decorative for assistive technology: pair it
 * with a table of the links.
 */
function FlowChart({
  children,
  className,
  colorBy = 'source',
  describeLink,
  describeNode,
  format = (value) => value.toLocaleString(),
  height = 280,
  links,
  minWidth,
  nodes,
}: FlowChartProps) {
  const frame = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState<FlowActive>(null)

  useEffect(() => {
    const element = frame.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Room for the first column's labels on the right and the last column's on the left.
  const labelGap = 6
  const layout = layoutFlow(nodes, links, { colorBy, height, width: Math.max(0, width) })
  const byId = new Map(layout.nodes.map((node) => [node.id, node]))

  const isLinkActive = (link: FlowLayoutLink) => {
    if (!active) return false
    if ('link' in active) return active.link === link.index
    return link.source === active.node || link.target === active.node
  }
  const isNodeActive = (node: FlowLayoutNode) => {
    if (!active) return false
    if ('node' in active) return active.node === node.id
    const link = links[active.link]
    return link?.source === node.id || link?.target === node.id
  }

  const defaultDescribeLink = (
    link: FlowLink,
    source: FlowLayoutNode,
    target: FlowLayoutNode,
  ) => {
    const share = source.value > 0 ? Math.round((link.value / source.value) * 100) : 0
    return `${source.label} → ${target.label}: ${format(link.value)} (${share}% of ${source.label})`
  }
  const defaultDescribeNode = (node: FlowLayoutNode) =>
    `${node.label}: ${format(node.value)}`

  let readout: ReactNode = children
  if (active && 'link' in active) {
    const link = links[active.link]
    const source = link && byId.get(link.source)
    const target = link && byId.get(link.target)
    if (link && source && target) {
      readout = (describeLink ?? defaultDescribeLink)(link, source, target)
    }
  } else if (active && 'node' in active) {
    const node = byId.get(active.node)
    if (node) readout = (describeNode ?? defaultDescribeNode)(node)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className={cn(minWidth && '-my-1 overflow-x-auto py-1')}>
        <div ref={frame} aria-hidden style={{ height, minWidth }}>
          {width > 0 && (
            <svg
              width={width}
              height={height}
              className='overflow-visible'
              onPointerLeave={() => setActive(null)}
            >
              <g>
                {layout.links.map((link) => {
                  const source = byId.get(link.source)
                  const target = byId.get(link.target)
                  if (!source || !target) return null
                  const highlighted = isLinkActive(link)
                  const opacity = active ? (highlighted ? 0.6 : 0.12) : 0.32
                  return (
                    <path
                      key={link.index}
                      d={getFlowPath(
                        source.x + 8,
                        target.x,
                        link.sy,
                        link.ty,
                        link.thickness,
                      )}
                      fill={
                        target.kind === 'exit'
                          ? exitColor
                          : colorBy === 'target'
                            ? target.color
                            : source.color
                      }
                      fillOpacity={target.kind === 'exit' ? opacity * 0.6 : opacity}
                      className='transition-[fill-opacity] duration-200'
                      onPointerEnter={() => setActive({ link: link.index })}
                      onPointerDown={() => setActive({ link: link.index })}
                    />
                  )
                })}
              </g>
              <g>
                {layout.nodes.map((node) => {
                  const last = node.column === layout.lastColumn && layout.lastColumn > 0
                  const dimmed = active !== null && !isNodeActive(node)
                  const textX = last ? node.x - labelGap : node.x + 8 + labelGap
                  const centre = node.y + node.height / 2
                  return (
                    <g
                      key={node.id}
                      className='transition-opacity duration-200'
                      opacity={dimmed ? 0.45 : 1}
                      onPointerEnter={() => setActive({ node: node.id })}
                      onPointerDown={() => setActive({ node: node.id })}
                    >
                      <rect
                        x={node.x}
                        y={node.y}
                        width={8}
                        height={Math.max(1, node.height)}
                        rx={2}
                        fill={node.color}
                      />
                      <text
                        x={textX}
                        y={centre}
                        dy={node.height > 22 ? '-0.2em' : '0.35em'}
                        textAnchor={last ? 'end' : 'start'}
                        className='fill-foreground stroke-card text-xs font-medium [paint-order:stroke] [stroke-linejoin:round] [stroke-width:3px]'
                      >
                        {node.label}
                        {node.height <= 22 && (
                          <tspan className='fill-muted-foreground font-normal tabular-nums'>
                            {' '}
                            {format(node.value)}
                          </tspan>
                        )}
                      </text>
                      {node.height > 22 && (
                        <text
                          x={textX}
                          y={centre}
                          dy='1em'
                          textAnchor={last ? 'end' : 'start'}
                          className='fill-muted-foreground stroke-card text-xs tabular-nums [paint-order:stroke] [stroke-linejoin:round] [stroke-width:3px]'
                        >
                          {format(node.value)}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            </svg>
          )}
        </div>
      </div>
      <p className='text-muted-foreground min-h-5 text-sm'>
        {active ? <span className='text-foreground'>{readout}</span> : children}
      </p>
    </div>
  )
}

interface FlowPathStep {
  label: string
}

/** A path of steps as chips joined by arrows, wrapping as needed. */
function FlowPathSteps({
  className,
  steps,
}: {
  className?: string
  steps: FlowPathStep[]
}) {
  return (
    <ol className={cn('flex flex-wrap items-center gap-1 text-xs', className)}>
      {steps.map((step, index) => (
        <li key={`${step.label}-${index}`} className='flex items-center gap-1'>
          {index > 0 && (
            <span aria-hidden className='text-muted-foreground'>
              →
            </span>
          )}
          <span className='bg-muted rounded-md px-1.5 py-0.5 font-medium whitespace-nowrap'>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  )
}

export { FlowChart, FlowPathSteps, flowPalette, getFlowPath, getFlowTotals, layoutFlow }

export type {
  FlowChartProps,
  FlowLayoutLink,
  FlowLayoutNode,
  FlowLayoutOptions,
  FlowLink,
  FlowNode,
  FlowPathStep,
}
