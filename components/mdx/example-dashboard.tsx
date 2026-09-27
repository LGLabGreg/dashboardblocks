import { Dashboard1 } from '@/registry/components/dashboardblocks/dashboards/dashboard-01'
import { Dashboard2 } from '@/registry/components/dashboardblocks/dashboards/dashboard-02'
import { Dashboard3 } from '@/registry/components/dashboardblocks/dashboards/dashboard-03'

import { ShadcnCliButton } from '@/components/shadcn-cli-button'

/** Midnight UTC today, so every date range ends on the current day. */
function startOfToday() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

const DASHBOARDS = {
  'dashboard-01': (today: Date) => <Dashboard1 title='Store overview' today={today} />,
  'dashboard-02': (today: Date) => <Dashboard2 title='Product health' today={today} />,
  'dashboard-03': (today: Date) => <Dashboard3 title='Site analytics' today={today} />,
}

export function ExampleDashboard({ name }: { name: keyof typeof DASHBOARDS }) {
  return (
    <div className='not-prose -mt-8 mb-6 flex flex-col gap-6'>
      <div className='flex'>
        <ShadcnCliButton name={name} />
      </div>
      {/* A rule keeps the install command apart from the dashboard's own header. */}
      <div className='border-t pt-6'>{DASHBOARDS[name](startOfToday())}</div>
    </div>
  )
}
