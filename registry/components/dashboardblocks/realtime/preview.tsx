'use client'

import {
  createRandom,
  pushWindow,
  useInterval,
} from '@/registry/components/dashboardblocks/realtime'
import {
  Realtime1,
  type Realtime1Props,
} from '@/registry/components/dashboardblocks/realtime/realtime-01'
import {
  Realtime2,
  type Realtime2Props,
} from '@/registry/components/dashboardblocks/realtime/realtime-02'
import {
  type LiveEvent,
  Realtime3,
  type Realtime3Props,
} from '@/registry/components/dashboardblocks/realtime/realtime-03'
import {
  Realtime4,
  type Realtime4Props,
} from '@/registry/components/dashboardblocks/realtime/realtime-04'
import { useRef, useState } from 'react'

// The docs preview only: each wraps a block and feeds it new data every few
// seconds, so the preview looks live. Not part of any registry item.

const Realtime1Preview = (props: Realtime1Props) => {
  const live = !props.status && props.activeUsers !== undefined
  const random = useRef(createRandom(42))
  const [data, setData] = useState({
    activeUsers: props.activeUsers ?? 0,
    pageViews: props.pageViews ?? [],
    pages: props.pages ?? [],
  })

  useInterval(
    () => {
      const next = random.current
      setData((current) => ({
        activeUsers: Math.max(0, Math.round(current.activeUsers + (next() - 0.48) * 40)),
        pageViews: pushWindow(
          current.pageViews,
          Math.round(28 + next() * 34),
          current.pageViews.length,
        ),
        pages: current.pages
          .map((page) => ({
            ...page,
            users: Math.max(1, Math.round(page.users + (next() - 0.5) * 18)),
          }))
          .sort((a, b) => b.users - a.users),
      }))
    },
    live ? 1_000 : null,
  )

  return <Realtime1 {...props} {...(live ? data : {})} />
}

const Realtime2Preview = (props: Realtime2Props) => {
  const source = props.samples ?? []
  const live = !props.status && source.length > 0
  const [samples, setSamples] = useState(source)
  const tick = useRef(0)

  useInterval(
    () => {
      tick.current += 1
      const sample = source[tick.current % source.length]
      setSamples((values) => pushWindow(values, sample, values.length))
    },
    live ? 1_500 : null,
  )

  return <Realtime2 {...props} samples={live ? samples : props.samples} />
}

const arrivals: Omit<LiveEvent, 'at' | 'id'>[] = [
  { detail: '$56.00, 1 item', kind: 'order', label: 'Order' },
  { detail: 'Starter plan, from search', kind: 'signup', label: 'New sign-up' },
  { detail: '$129.00, 3 items', kind: 'order', label: 'Order' },
  { detail: '"Do you support SSO?"', kind: 'message', label: 'Support chat' },
  { detail: '$18.00, wrong size', kind: 'refund', label: 'Refund' },
]

const Realtime3Preview = (props: Realtime3Props) => {
  const live = !props.status && (props.events?.length ?? 0) > 0
  const random = useRef(createRandom(5))
  const count = useRef(0)
  const [data, setData] = useState({ events: props.events ?? [], now: props.now })

  useInterval(
    () => {
      const now = new Date(data.now.getTime() + 2_500)
      if (random.current() < 0.6) {
        setData((current) => ({ ...current, now }))
        return
      }
      count.current += 1
      const arrival = arrivals[count.current % arrivals.length]
      const label =
        arrival.kind === 'order' ? `Order #${10_482 + count.current}` : arrival.label
      const event = { ...arrival, at: now, id: `arrival-${count.current}`, label }
      setData((current) => ({ events: [event, ...current.events].slice(0, 20), now }))
    },
    live ? 2_500 : null,
  )

  return <Realtime3 {...props} {...(live ? data : {})} />
}

const Realtime4Preview = (props: Realtime4Props) => {
  const live = !props.status && (props.metrics?.length ?? 0) > 0
  const random = useRef(createRandom(21))
  const [data, setData] = useState({
    hourly: props.hourly ?? [],
    metrics: props.metrics ?? [],
  })

  useInterval(
    () => {
      const next = random.current
      const orders = next() > 0.35 ? 1 + Math.floor(next() * 3) : 0
      const bumps = data.metrics.map((metric) =>
        metric.id === 'orders'
          ? orders
          : metric.id === 'revenue'
            ? orders * (40 + next() * 80)
            : next() > 0.8
              ? 1
              : 0,
      )
      const drift = bumps.map(() => 0.85 + next() * 0.2)
      setData((current) => ({
        hourly: orders
          ? [...current.hourly.slice(0, -1), (current.hourly.at(-1) ?? 0) + orders]
          : current.hourly,
        metrics: current.metrics.map((metric, index) => ({
          ...metric,
          today: metric.today + bumps[index],
          yesterday: metric.yesterday + bumps[index] * drift[index],
        })),
      }))
    },
    live ? 2_000 : null,
  )

  return <Realtime4 {...props} {...(live ? data : {})} />
}

export { Realtime1Preview, Realtime2Preview, Realtime3Preview, Realtime4Preview }
