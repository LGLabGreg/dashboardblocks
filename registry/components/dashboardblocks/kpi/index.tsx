import { AreaChartKPI1 } from './area-chart-kpi-01'
import { AreaChartKPI2 } from './area-chart-kpi-02'
import { BarChartKPI1 } from './bar-chart-kpi-01'
import { BarChartKPI2 } from './bar-chart-kpi-02'
import { KPI1 } from './kpi-01'
import { KPI2 } from './kpi-02'
import { KPI3 } from './kpi-03'
import { LineChartKPI1 } from './line-chart-kpi-01'
import { ProgressKPI1 } from './progress-kpi-01'
import { ProgressKPI2 } from './progress-kpi-02'
import { ProgressKPI3 } from './progress-kpi-03'

export const exampleComponents = {
  'kpi-01': KPI1,
  'kpi-02': KPI2,
  'kpi-03': KPI3,
  'progress-kpi-01': ProgressKPI1,
  'progress-kpi-02': ProgressKPI2,
  'progress-kpi-03': ProgressKPI3,
  'bar-chart-kpi-01': BarChartKPI1,
  'bar-chart-kpi-02': BarChartKPI2,
  'line-chart-kpi-01': LineChartKPI1,
  'area-chart-kpi-01': AreaChartKPI1,
  'area-chart-kpi-02': AreaChartKPI2,
}

export function getExampleComponent(name: string) {
  return exampleComponents[name as keyof typeof exampleComponents] || null
}
