import {
  type ExampleDashboardName,
  ExampleDashboardView,
} from '@/components/mdx/example-dashboard-view'
import { startOfToday } from '@/components/mdx/start-of-today'
import { ShadcnCliButton } from '@/components/shadcn-cli-button'

export function ExampleDashboard({ name }: { name: ExampleDashboardName }) {
  return (
    <div className='not-prose -mt-8 mb-6 flex flex-col gap-6'>
      <div className='flex'>
        <ShadcnCliButton name={name} />
      </div>
      {/* A rule keeps the install command apart from the dashboard's own header. */}
      <div className='border-t pt-6'>
        <ExampleDashboardView name={name} buildDay={startOfToday()} />
      </div>
    </div>
  )
}
