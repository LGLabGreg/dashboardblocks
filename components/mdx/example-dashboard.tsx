import { Dashboard1 } from '@/registry/components/dashboardblocks/dashboards/dashboard-01'
import { Dashboard2 } from '@/registry/components/dashboardblocks/dashboards/dashboard-02'

import { ShadcnCliButton } from '@/components/shadcn-cli-button'

/** Midnight UTC today, so every date range ends on the current day. */
function startOfToday() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

const DASHBOARDS = {
  'dashboard-01': (today: Date) => <Dashboard1 title='Store overview' today={today} />,
  'dashboard-02': (today: Date) => <Dashboard2 title='Product health' today={today} />,
}

export function ExampleDashboard({ name }: { name: keyof typeof DASHBOARDS }) {
  return (
    <div className='not-prose my-6 flex flex-col gap-4'>
      <div className='flex justify-end'>
        <ShadcnCliButton name={name} />
      </div>
      {DASHBOARDS[name](startOfToday())}
    </div>
  )
}
