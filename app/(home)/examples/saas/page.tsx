import { Dashboard2 } from '@/registry/components/dashboardblocks/dashboards/dashboard-02'
import type { Metadata } from 'next'

import { ExampleFrame, startOfToday } from '../example-frame'

// Rebuild daily so the date ranges end on the current day.
export const revalidate = 86_400

export const metadata: Metadata = {
  title: 'SaaS dashboard example',
  description:
    'A full SaaS dashboard built from Dashboardblocks: metric tabs, activity heatmap, accounts by region and service status.',
}

export default function SaasExamplePage() {
  return (
    <ExampleFrame name='dashboard-02'>
      <Dashboard2 title='Product health' today={startOfToday()} />
    </ExampleFrame>
  )
}
