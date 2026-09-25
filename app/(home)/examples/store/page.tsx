import { Dashboard1 } from '@/registry/components/dashboardblocks/dashboards/dashboard-01'
import type { Metadata } from 'next'

import { ExampleFrame, startOfToday } from '../example-frame'

// Rebuild daily so the date ranges end on the current day.
export const revalidate = 86_400

export const metadata: Metadata = {
  title: 'Store dashboard example',
  description:
    'A full store dashboard built from Dashboardblocks: header filters, stats, revenue, channels, products and a checkout funnel.',
}

export default function StoreExamplePage() {
  return (
    <ExampleFrame name='dashboard-01'>
      <Dashboard1 title='Store overview' today={startOfToday()} />
    </ExampleFrame>
  )
}
