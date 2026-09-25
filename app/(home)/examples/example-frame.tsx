import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { ShadcnCliButton } from '@/components/shadcn-cli-button'

import { cn } from '@/lib/utils'

interface ExampleBlock {
  /** The block's docs section, e.g. '/docs/components/stat-group#with-sparklines'. */
  href: string
  /** The family and variant, e.g. 'Stat Group: With Sparklines'. */
  label: string
  /** The registry name, e.g. 'stat-group-02'. */
  name: string
}

const EXAMPLES = [
  {
    blocks: [
      {
        href: '/docs/components/dashboard-header',
        label: 'Dashboard Header primitives',
        name: 'dashboard-header',
      },
      {
        href: '/docs/components/stat-group#with-sparklines',
        label: 'Stat Group: With Sparklines',
        name: 'stat-group-02',
      },
      {
        href: '/docs/components/chart-panel#period-comparison',
        label: 'Chart Panel: Period Comparison',
        name: 'chart-panel-01',
      },
      {
        href: '/docs/components/breakdown#segmented-bar',
        label: 'Breakdown: Segmented Bar',
        name: 'breakdown-01',
      },
      {
        href: '/docs/components/data-table#inline-bars',
        label: 'Data Table: Inline Bars',
        name: 'data-table-02',
      },
      {
        href: '/docs/components/funnel#stage-bars',
        label: 'Funnel: Stage Bars',
        name: 'funnel-01',
      },
      {
        href: '/docs/components/states#refresh',
        label: 'States: Refresh',
        name: 'block-state',
      },
    ],
    href: '/examples/store',
    name: 'dashboard-01',
    title: 'Store',
  },
  {
    blocks: [
      {
        href: '/docs/components/dashboard-header',
        label: 'Dashboard Header primitives',
        name: 'dashboard-header',
      },
      {
        href: '/docs/components/stat-group#metric-tabs',
        label: 'Stat Group: Metric Tabs',
        name: 'stat-group-03',
      },
      {
        href: '/docs/components/heatmap#weekday-by-hour',
        label: 'Heatmap: Weekday by Hour',
        name: 'heatmap-01',
      },
      {
        href: '/docs/components/breakdown#segmented-bar',
        label: 'Breakdown: Segmented Bar',
        name: 'breakdown-01',
      },
      {
        href: '/docs/components/data-table#status',
        label: 'Data Table: Status',
        name: 'data-table-04',
      },
      {
        href: '/docs/components/states#refresh',
        label: 'States: Refresh',
        name: 'block-state',
      },
    ],
    href: '/examples/saas',
    name: 'dashboard-02',
    title: 'SaaS',
  },
] satisfies { blocks: ExampleBlock[]; href: string; name: string; title: string }[]

/** Midnight UTC today, so every date range ends on the current day. */
export function startOfToday() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export function ExampleFrame({ children, name }: { children: ReactNode; name: string }) {
  const example = EXAMPLES.find((item) => item.name === name)

  return (
    <div className='flex w-full flex-1 flex-col'>
      <div className='border-b'>
        <div className='mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6'>
          <nav
            aria-label='Dashboard examples'
            className='flex items-center gap-1 text-sm'
          >
            {EXAMPLES.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-current={item.name === name ? 'page' : undefined}
                className={cn(
                  'text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1 transition-colors',
                  'aria-[current=page]:bg-muted aria-[current=page]:text-foreground',
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <ShadcnCliButton name={name} />
        </div>
      </div>
      <main className='mx-auto w-full max-w-7xl px-4 py-8 md:px-6'>{children}</main>
      {example && (
        <aside
          aria-labelledby='example-blocks'
          className='mx-auto w-full max-w-7xl px-4 pb-16 md:px-6'
        >
          <div className='border-t pt-8'>
            <h2 id='example-blocks' className='text-lg font-semibold'>
              Blocks on this page
            </h2>
            <p className='text-muted-foreground mt-1 text-sm'>
              Each block installs on its own. Open one to see its code and variants.
            </p>
            <ul className='mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {example.blocks.map((block) => (
                <li key={block.name}>
                  <Link
                    href={block.href}
                    className='group hover:border-foreground/20 hover:bg-muted/40 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors'
                  >
                    <span className='flex min-w-0 flex-col'>
                      <span className='text-sm font-medium'>{block.label}</span>
                      <span className='text-muted-foreground font-mono text-xs'>
                        {block.name}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className='text-muted-foreground size-4 shrink-0 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5'
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  )
}
