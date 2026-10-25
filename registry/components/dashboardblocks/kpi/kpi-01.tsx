'use client'

import {
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  KPI,
  KPIChange,
  type KPIFormat,
  KPITitle,
  KPIValue,
} from '@/registry/components/dashboardblocks/kpi'

interface KPI1Props extends BlockStateProps {
  comparison: string
  format?: KPIFormat
  previous?: number
  title: string
  /** Leave out to show the empty state. */
  value?: number
}

const exampleProps: KPI1Props = {
  comparison: 'last month',
  format: 'currency',
  previous: 37_660,
  title: 'Total revenue',
  value: 45_231,
}

const KPI1 = (props: KPI1Props) => {
  const { comparison, format, previous, errorMessage, status, title, value } = props

  return (
    <BlockStateProvider errorMessage={errorMessage} state={getBlockState(status, value)}>
      <KPI className='gap-1'>
        <KPITitle>{title}</KPITitle>
        <KPIValue value={value} format={format} animated />
        <KPIChange
          comparison={comparison}
          format={format}
          previous={previous}
          value={value}
        />
      </KPI>
    </BlockStateProvider>
  )
}

export { KPI1, exampleProps as kpi1ExampleProps, type KPI1Props }
