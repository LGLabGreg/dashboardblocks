'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipFrame,
  ChartTooltipItem,
} from '@/registry/components/dashboardblocks/chart'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'
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

const NODE_WIDTH = 8
const LABEL_GAP = 6
const TWO_LINE_LABEL_HEIGHT = 22

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

type FlowActive = { link: number } | { node: string } | null

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
  /** Names the sideways scroll region `minWidth` adds. @default 'Flow' */
  label?: string
  links: FlowLink[]
  /** Keeps labels legible in narrow cards: below this width the chart scrolls sideways. */
  minWidth?: string
  nodes: FlowNode[]
}

function FlowChart({
  className,
  colorBy = 'source',
  describeLink,
  describeNode,
  emphasis,
  format = (value) => formatNumber(value),
  height = 280,
  label = 'Flow',
  links,
  minWidth,
  nodes,
}: FlowChartProps) {
  const [active, setActive] = useState<FlowActive>(null)
  const state = useBlockState()
  const laidOut = getFlowNodes(nodes, links, colorBy)
  const byId = new Map(laidOut.map((node) => [node.id, node]))
  const indexOf = new Map(laidOut.map((node, index) => [node.id, index]))
  const lastColumn = Math.max(0, ...laidOut.map((node) => node.column))
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
    if (!link || !source || !target) return <path />
    const emphasised =
      emphasis !== undefined && (link.source === emphasis || link.target === emphasis)
    const opacity = active
      ? isLinkActive(link, shape.index)
        ? 0.6
        : 0.12
      : emphasis === undefined
        ? 0.32
        : emphasised
          ? 0.5
          : 0.2
    return (
      <path
        d={`M${shape.sourceX},${shape.sourceY} C${shape.sourceControlX},${shape.sourceY} ${shape.targetControlX},${shape.targetY} ${shape.targetX},${shape.targetY}`}
        fill='none'
        stroke={
          target.kind === 'exit'
            ? exitColor
            : colorBy === 'target'
              ? target.color
              : source.color
        }
        strokeOpacity={target.kind === 'exit' ? opacity * 0.6 : opacity}
        strokeWidth={Math.max(1, shape.linkWidth)}
        className='transition-[stroke-opacity] duration-200'
      />
    )
  }

  const renderNode = (shape: SankeyNodeProps) => {
    const node = byId.get(String((shape.payload as { id?: string }).id))
    if (!node) return <g />
    const last = node.column === lastColumn && lastColumn > 0
    const dimmed = active !== null && !isNodeActive(node)
    const textX = last ? shape.x - LABEL_GAP : shape.x + shape.width + LABEL_GAP
    const centre = shape.y + shape.height / 2
    const twoLines = shape.height > TWO_LINE_LABEL_HEIGHT
    return (
      <g className='transition-opacity duration-200' opacity={dimmed ? 0.45 : 1}>
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={Math.max(1, shape.height)}
          rx={2}
          fill={node.color}
        />
        <text
          x={textX}
          y={centre}
          dy={twoLines ? '-0.2em' : '0.35em'}
          textAnchor={last ? 'end' : 'start'}
          className='fill-foreground stroke-background text-xs font-medium [paint-order:stroke] [stroke-linejoin:round] [stroke-width:3px]'
        >
          {node.label}
          {!twoLines && (
            <tspan className='fill-muted-foreground font-normal tabular-nums'>
              {' '}
              {format(node.value)}
            </tspan>
          )}
        </text>
        {twoLines && (
          <text
            x={textX}
            y={centre}
            dy='1em'
            textAnchor={last ? 'end' : 'start'}
            className='fill-muted-foreground stroke-background text-xs tabular-nums [paint-order:stroke] [stroke-linejoin:round] [stroke-width:3px]'
          >
            {format(node.value)}
          </text>
        )}
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
      <div role='img' aria-label={label} style={{ height, minWidth }}>
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
              if (type === 'link' && 'linkWidth' in item) setActive({ link: item.index })
              if (type === 'node' && 'payload' in item && 'id' in item.payload) {
                setActive({ node: String(item.payload.id) })
              }
            }}
            onMouseLeave={() => setActive(null)}
            sort={false}
          >
            <Tooltip
              content={({ active: shown }) => {
                const item = tooltip()
                if (!shown || !item) return null
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

export type { FlowChartProps, FlowLayoutNode, FlowLink, FlowNode, FlowPathStep }
