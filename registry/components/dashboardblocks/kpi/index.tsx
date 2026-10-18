import { AreaChartKPI1, areaChartKpi1ExampleProps } from './area-chart-kpi-01'
import { AreaChartKPI2, areaChartKpi2ExampleProps } from './area-chart-kpi-02'
import { BarChartKPI1, barChartKpi1ExampleProps } from './bar-chart-kpi-01'
import { BarChartKPI2, barChartKpi2ExampleProps } from './bar-chart-kpi-02'
import { KPI1, kpi1ExampleProps } from './kpi-01'
import { KPI2, kpi2ExampleProps } from './kpi-02'
import { KPI3, kpi3ExampleProps } from './kpi-03'
import { KPI4, kpi4ExampleProps } from './kpi-04'
import { LineChartKPI1, lineChartKpi1ExampleProps } from './line-chart-kpi-01'
import { ProgressKPI1, progressKpi1ExampleProps } from './progress-kpi-01'
import { ProgressKPI2, progressKpi2ExampleProps } from './progress-kpi-02'
import { ProgressKPI3, progressKpi3ExampleProps } from './progress-kpi-03'

export const kpiComponents = {
  'kpi-01': KPI1,
  'kpi-02': KPI2,
  'kpi-03': KPI3,
  'kpi-04': KPI4,
  'progress-kpi-01': ProgressKPI1,
  'progress-kpi-02': ProgressKPI2,
  'progress-kpi-03': ProgressKPI3,
  'bar-chart-kpi-01': BarChartKPI1,
  'bar-chart-kpi-02': BarChartKPI2,
  'line-chart-kpi-01': LineChartKPI1,
  'area-chart-kpi-01': AreaChartKPI1,
  'area-chart-kpi-02': AreaChartKPI2,
}

export const kpiExampleProps = {
  'kpi-01': kpi1ExampleProps,
  'kpi-02': kpi2ExampleProps,
  'kpi-03': kpi3ExampleProps,
  'kpi-04': kpi4ExampleProps,
  'progress-kpi-01': progressKpi1ExampleProps,
  'progress-kpi-02': progressKpi2ExampleProps,
  'progress-kpi-03': progressKpi3ExampleProps,
  'bar-chart-kpi-01': barChartKpi1ExampleProps,
  'bar-chart-kpi-02': barChartKpi2ExampleProps,
  'line-chart-kpi-01': lineChartKpi1ExampleProps,
  'area-chart-kpi-01': areaChartKpi1ExampleProps,
  'area-chart-kpi-02': areaChartKpi2ExampleProps,
}

export const kpiEmptyProps = {
  'kpi-01': { previous: undefined, value: undefined },
  'kpi-02': { previous: undefined, value: undefined },
  'kpi-03': { previous: undefined, value: undefined },
  'kpi-04': { previous: undefined, value: undefined },
  'progress-kpi-01': { previous: undefined, value: undefined },
  'progress-kpi-02': { counts: [] },
  'progress-kpi-03': { current: undefined },
  'bar-chart-kpi-01': { data: [], previous: undefined },
  'bar-chart-kpi-02': { data: [] },
  'line-chart-kpi-01': { data: [] },
  'area-chart-kpi-01': { data: [], previous: undefined },
  'area-chart-kpi-02': { data: [], previous: undefined },
}
