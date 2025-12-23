import { BarChartKPI1 } from './bar-chart-kpi-01'
import { KPI1 } from './kpi-01'
import { KPI2 } from './kpi-02'
import { KPI3 } from './kpi-03'
import { ProgressKPI1 } from './progress-kpi-01'

export const exampleComponents = {
  'kpi-01': KPI1,
  'kpi-02': KPI2,
  'kpi-03': KPI3,
  'progress-kpi-01': ProgressKPI1,
  'bar-chart-kpi-01': BarChartKPI1,
}

export function getExampleComponent(name: string) {
  return exampleComponents[name as keyof typeof exampleComponents] || null
}
