'use client'

import {
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  KPI,
  KPIChange,
  KPIContent,
  KPITitle,
  type KPIFormat,
  KPIValue,
} from '@/registry/components/dashboardblocks/kpi'

interface KPI2Props {
  comparison: string
  format?: KPIFormat
  previous?: number
  status?: BlockStatus
  title: string
  /** Leave out to show the empty state. */
  value?: number
}

const exampleProps: KPI2Props = {
  comparison: 'last week',
  format: 'number',
  previous: 2_151,
  title: 'Active users',
  value: 2_420,
}

const KPI2 = (props: KPI2Props) => {
  const { comparison, format, previous, status, title, value } = props

  return (
    <BlockStateProvider state={getBlockState(status, value)}>
      <KPI>
        <KPIContent className='gap-1'>
          <div className='flex items-baseline justify-between gap-3'>
            <KPITitle className='truncate'>{title}</KPITitle>
            <KPIChange
              className='shrink-0'
              comparison={comparison}
              format={format}
              previous={previous}
              value={value}
              variant='short'
            />
          </div>
          <KPIValue value={value} format={format} animated />
        </KPIContent>
      </KPI>
    </BlockStateProvider>
  )
}

export { KPI2, exampleProps as kpi2ExampleProps, type KPI2Props }
