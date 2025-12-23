import { BarChartKPI } from './bar-chart-kpi'
import { CompactKPI } from './compact-kpi'
import { DescriptiveKPI } from './descriptive-kpi'
import { MinimalKPI } from './minimal-kpi'
import { ProgressKPI } from './progress-kpi'

export const exampleComponents = {
  'minimal-kpi': MinimalKPI,
  'compact-kpi': CompactKPI,
  'descriptive-kpi': DescriptiveKPI,
  'progress-kpi': ProgressKPI,
  'bar-chart-kpi': BarChartKPI,
}

export function getExampleComponent(name: string) {
  return exampleComponents[name as keyof typeof exampleComponents] || null
}
