'use client'

import { Dashboard1 } from '@/registry/components/dashboardblocks/dashboards/dashboard-01'
import { Dashboard2 } from '@/registry/components/dashboardblocks/dashboards/dashboard-02'
import { Dashboard3 } from '@/registry/components/dashboardblocks/dashboards/dashboard-03'
import { useSyncExternalStore } from 'react'

import { startOfToday } from '@/components/mdx/start-of-today'

const DASHBOARDS = {
  'dashboard-01': (today: Date) => <Dashboard1 title='Store overview' today={today} />,
  'dashboard-02': (today: Date) => <Dashboard2 title='Product health' today={today} />,
  'dashboard-03': (today: Date) => <Dashboard3 title='Site analytics' today={today} />,
}

export type ExampleDashboardName = keyof typeof DASHBOARDS

const subscribe = () => () => {}

/**
 * The page is prerendered once at build time, so it renders with the build's
 * date and then moves to the visitor's today after hydration.
 */
export function ExampleDashboardView({
  name,
  buildDay,
}: {
  name: ExampleDashboardName
  buildDay: number
}) {
  const today = useSyncExternalStore(subscribe, startOfToday, () => buildDay)
  return DASHBOARDS[name](new Date(today))
}
