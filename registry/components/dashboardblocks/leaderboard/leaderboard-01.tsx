'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Leaderboard,
  LeaderboardBar,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

import { Button } from '@/components/ui/button'

interface PageStat {
  path: string
  visitors: number
}

interface Leaderboard1Props {
  /** Defaults to a sentence about the visitors and the top page's share. */
  description?: string
  onViewAll?: () => void
  /** Leave out, or pass none, to show the empty state. */
  pages?: PageStat[]
  status?: BlockStatus
  title: string
}

const exampleProps: Leaderboard1Props = {
  pages: [
    { path: '/', visitors: 18_420 },
    { path: '/pricing', visitors: 9_312 },
    { path: '/docs/getting-started', visitors: 7_845 },
    { path: '/blog/launch-week', visitors: 5_127 },
    { path: '/changelog', visitors: 3_406 },
    { path: '/careers', visitors: 1_982 },
  ],
  title: 'Top pages',
}

const summarize = (pages: PageStat[]) => {
  const total = pages.reduce((sum, page) => sum + page.visitors, 0)
  const [top] = pages
  if (!top || total === 0) return 'No visitors yet.'
  const visitors = `${formatNumber(total)} visitors across ${pages.length} ${pages.length === 1 ? 'page' : 'pages'}`
  return `${visitors}, ${formatPercent(top.visitors / total, { maximumFractionDigits: 0 })} of them to ${top.path}.`
}

const Leaderboard1 = (props: Leaderboard1Props) => {
  const { onViewAll, pages = [], status, title } = props
  const { description = summarize(pages) } = props
  const state = getBlockState(status, pages)
  const max = Math.max(...pages.map((page) => page.visitors), 1)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          <Button variant='outline' size='sm' onClick={onViewAll}>
            View all
            <IconPlaceholder
              lucide='ArrowRightIcon'
              tabler='IconArrowRight'
              hugeicons='ArrowRight01Icon'
              phosphor='ArrowRightIcon'
              remixicon='RiArrowRightLine'
              data-icon='inline-end'
            />
          </Button>
        </header>
        <div className='flex flex-col gap-1.5 border-t pt-4'>
          <div className='text-muted-foreground flex justify-between px-2 text-xs'>
            <span>Page</span>
            <span>Visitors</span>
          </div>
          <BlockStateRows rows={6} />
          {!state && (
            <Leaderboard>
              {pages.map((page, index) => (
                <LeaderboardItem key={page.path}>
                  <LeaderboardBar
                    className={
                      index === 0
                        ? 'bg-[color-mix(in_oklab,var(--color-chart-2)_32%,transparent)]'
                        : undefined
                    }
                    delay={index * 100}
                    value={(page.visitors / max) * 100}
                  />
                  <LeaderboardLabel className='truncate'>{page.path}</LeaderboardLabel>
                  <LeaderboardValue>{formatNumber(page.visitors)}</LeaderboardValue>
                </LeaderboardItem>
              ))}
            </Leaderboard>
          )}
        </div>
      </section>
    </BlockStateProvider>
  )
}

export {
  Leaderboard1,
  exampleProps as leaderboard1ExampleProps,
  type Leaderboard1Props,
  type PageStat,
}
