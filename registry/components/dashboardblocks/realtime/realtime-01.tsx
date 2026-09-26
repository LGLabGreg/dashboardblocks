'use client'

import {
  LiveBadge,
  LiveNumber,
  RollingBars,
  createRandom,
  pushWindow,
  useInterval,
} from '@/registry/components/dashboardblocks/realtime'
import { useRef, useState } from 'react'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ActivePage {
  path: string
  users: number
}

interface Realtime1Props {
  /** Users active in the last few minutes. */
  activeUsers: number
  description: string
  /** Page views per second, oldest first, e.g. the last 60 seconds. */
  pageViews: number[]
  /** Pages with the most active users, largest first. */
  pages: ActivePage[]
  /** Makes up updates every second, for demos. Replace with your own feed. */
  simulate?: boolean
  title: string
}

const seed = createRandom(7)

const exampleProps: Realtime1Props = {
  activeUsers: 1_284,
  description: 'Users on the site in the last 5 minutes',
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

const Realtime1 = (props: Realtime1Props) => {
  const { description, simulate = false, title } = props
  const [users, setUsers] = useState(props.activeUsers)
  const [views, setViews] = useState(props.pageViews)
  const [pages, setPages] = useState(props.pages)
  const random = useRef(createRandom(42))

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
    simulate ? 1_000 : null,
  )

  const perMinute = views.slice(-60).reduce((sum, value) => sum + value, 0)
  const top = Math.max(1, ...pages.map((page) => page.users))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <LiveBadge />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex items-end justify-between gap-4'>
          <div className='flex flex-col'>
            <span className='text-4xl font-semibold tracking-tight'>
              <LiveNumber value={users} />
            </span>
            <span className='text-muted-foreground text-sm'>active users</span>
          </div>
          <div className='flex flex-col items-end'>
            <span className='text-lg font-semibold'>
              <LiveNumber value={perMinute} />
            </span>
            <span className='text-muted-foreground text-xs'>page views, last minute</span>
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <RollingBars className='h-14' values={views} />
          <div
            aria-hidden
            className='text-muted-foreground flex justify-between text-[11px]'
          >
            <span>60s ago</span>
            <span>now</span>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='text-muted-foreground flex justify-between text-xs'>
            <span>Top pages</span>
            <span>Users</span>
          </div>
          <ul className='flex flex-col gap-1.5'>
            {pages.map((page) => (
              <li
                key={page.path}
                className='relative flex items-center justify-between gap-3 text-sm'
              >
                <span
                  aria-hidden
                  className='bg-muted absolute inset-y-0 left-0 rounded-sm transition-[width] duration-500 motion-reduce:transition-none'
                  style={{ width: `${(page.users / top) * 100}%` }}
                />
                <span className='relative truncate px-2 py-1 font-mono text-xs'>
                  {page.path}
                </span>
                <span className='relative pr-1 font-medium'>
                  <LiveNumber value={page.users} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export {
  Realtime1,
  exampleProps as realtime1ExampleProps,
  type ActivePage,
  type Realtime1Props,
}
