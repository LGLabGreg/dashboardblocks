'use client'

import {
  activityFeedComponents,
  activityFeedExampleProps,
} from '@/registry/components/dashboardblocks/activity-feed/index'
import {
  kpiComponents,
  kpiExampleProps,
} from '@/registry/components/dashboardblocks/kpi/index'
import {
  usageMeterComponents,
  usageMeterExampleProps,
} from '@/registry/components/dashboardblocks/usage-meter/index'

const exampleComponents = {
  ...kpiComponents,
  ...activityFeedComponents,
  ...usageMeterComponents,
}

const examplePropsMap = {
  ...kpiExampleProps,
  ...activityFeedExampleProps,
  ...usageMeterExampleProps,
}

export type ComponentName = keyof typeof exampleComponents

export function ExampleRenderer({ name }: { name: ComponentName }) {
  const Component = exampleComponents[name]
  const props = examplePropsMap[name as keyof typeof examplePropsMap]
  if (!Component) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Component {...(props as any)} />
}
