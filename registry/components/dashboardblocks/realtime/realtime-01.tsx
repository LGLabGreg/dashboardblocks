'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  Leaderboard,
  LeaderboardBar,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import {
  LiveBadge,
  LiveNumber,
  RollingBars,
  createRandom,
  pushWindow,
  useInterval,
} from '@/registry/components/dashboardblocks/realtime'
import { useRef, useState } from 'react'

interface ActivePage {
  path: string
  users: number
}

interface Realtime1Props {
  /** Leave out to show the empty state. */
  activeUsers?: number
  description: string
  /** Page views per second over the last minute, oldest first. */
  pageViews?: number[]
  pages?: ActivePage[]
  simulate?: boolean
  status?: BlockStatus
  title: string
}

const seed = createRandom(7)

const exampleProps: Realtime1Props = {
  activeUsers: 1_284,
  description: 'People on the site in the last 5 minutes, and the pages they are on.',
  pageViews: Array.from({ length: 60 }, () => Math.round(28 + seed() * 34)),
  pages: [
    { path: '/pricing', users: 312 },
    { path: '/', users: 268 },
    { path: '/docs/quickstart', users: 194 },
    { path: '/blog/launch-week', users: 151 },
    { path: '/changelog', users: 87 },
  ],
  simulate: true,
  title: 'Right now',
}

const noViews: number[] = []
const noPages: ActivePage[] = []

const Realtime1 = (props: Realtime1Props) => {
  const {
    activeUsers,
    description,
    pageViews = noViews,
    pages: loadedPages = noPages,
    simulate = false,
    status,
    title,
  } = props
  const [users, setUsers] = useState(activeUsers ?? 0)
  const [views, setViews] = useState(pageViews)
  const [pages, setPages] = useState(loadedPages)
  const [loaded, setLoaded] = useState({ activeUsers, pageViews, pages: loadedPages })
  if (
    loaded.activeUsers !== activeUsers ||
    loaded.pageViews !== pageViews ||
    loaded.pages !== loadedPages
  ) {
    setLoaded({ activeUsers, pageViews, pages: loadedPages })
    setUsers(activeUsers ?? 0)
    setViews(pageViews)
    setPages(loadedPages)
  }
  const random = useRef(createRandom(42))
  const state = getBlockState(status, activeUsers)

  useInterval(
    () => {
      const next = random.current
      setUsers((value) => Math.max(0, Math.round(value + (next() - 0.48) * 40)))
      setViews((values) =>
        pushWindow(values, Math.round(28 + next() * 34), values.length),
      )
      setPages((list) =>
        list
          .map((page) => ({
            ...page,
            users: Math.max(1, Math.round(page.users + (next() - 0.5) * 18)),
          }))
          .sort((a, b) => b.users - a.users),
      )
    },
    simulate && !state ? 1_000 : null,
  )

  const perMinute = views.slice(-60).reduce((sum, value) => sum + value, 0)
  const top = Math.max(1, ...pages.map((page) => page.users))

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {!state && <LiveBadge />}
        </header>
        <div className='flex flex-col gap-3 border-t pt-4'>
          <div className='flex flex-wrap items-end justify-between gap-x-4 gap-y-2'>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>Active users</span>
              {state ? (
                <KPIValue />
              ) : (
                <span className='text-4xl font-light tracking-tight'>
                  <LiveNumber value={users} />
                </span>
              )}
            </div>
            {state !== 'error' && state !== 'empty' && (
              <div className='flex flex-col items-end gap-1'>
                <span className='text-muted-foreground text-sm'>
                  Page views, last minute
                </span>
                {state ? (
                  <KPIValue className='text-2xl' />
                ) : (
                  <span className='text-2xl font-light tracking-tight'>
                    <LiveNumber value={perMinute} />
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex flex-col gap-1'>
            <RollingBars
              height={56}
              labels={views.map((_, index) => `${views.length - 1 - index}s ago`)}
              values={views}
            />
            {!state && (
              <div
                aria-hidden
                className='text-muted-foreground flex justify-between text-xs'
              >
                <span>{views.length}s ago</span>
                <span>Now</span>
              </div>
            )}
          </div>
        </div>
        {state !== 'error' && state !== 'empty' && (
          <div className='flex flex-col gap-1.5'>
            <div className='text-muted-foreground flex justify-between px-2 text-xs'>
              <span>Top pages</span>
              <span>Users</span>
            </div>
            {state === 'loading' && <BlockStateRows rows={5} />}
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
                      value={(page.users / top) * 100}
                    />
                    <LeaderboardLabel className='truncate'>{page.path}</LeaderboardLabel>
                    <LeaderboardValue>
                      <LiveNumber value={page.users} />
                    </LeaderboardValue>
                  </LeaderboardItem>
                ))}
              </Leaderboard>
            )}
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Realtime1,
  exampleProps as realtime1ExampleProps,
  type ActivePage,
  type Realtime1Props,
}
