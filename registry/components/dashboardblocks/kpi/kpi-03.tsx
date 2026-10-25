'use client'

import {
  BlockStateProvider,
  type BlockStateProps,
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

interface KPI3Props extends BlockStateProps {
  /** Use `points` for rates, so the change reads in percentage points; 'percent' by default. */
  changeType?: 'percent' | 'points'
  comparison: string
  /** @default 'This month' */
  currentLabel?: string
  format?: KPIFormat
  /** Use `down` for metrics like churn, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  previous?: number
  title: string
  /** Leave out to show the empty state. */
  value?: number
}

const exampleProps: KPI3Props = {
  changeType: 'points',
  comparison: 'last month',
  format: 'percent',
  previous: 3.46,
  title: 'Conversion rate',
  value: 3.24,
}

const KPI3 = (props: KPI3Props) => {
  const {
    changeType,
    comparison,
    currentLabel = 'This month',
    format,
    goodDirection,
    previous,
    errorMessage,
    status,
    title,
    value,
  } = props
  const state = getBlockState(status, value)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <KPI>
        <KPIContent className='gap-1'>
          <KPITitle>{title}</KPITitle>
          <div className='flex flex-wrap items-end gap-x-6 gap-y-1'>
            <div className='flex flex-col'>
              <KPIValue value={value} format={format} animated />
              <span className='text-muted-foreground text-xs'>{currentLabel}</span>
            </div>
            {(state === undefined || state === 'loading') && (
              <div className='text-muted-foreground flex flex-col pb-px'>
                <KPIValue className='text-2xl' value={previous} format={format} />
                <span className='text-xs first-letter:uppercase'>{comparison}</span>
              </div>
            )}
          </div>
          <KPIChange
            className='mt-2'
            changeType={changeType}
            comparison={comparison}
            format={format}
            goodDirection={goodDirection}
            previous={previous}
            value={value}
            variant='short'
          />
        </KPIContent>
      </KPI>
    </BlockStateProvider>
  )
}

export { KPI3, exampleProps as kpi3ExampleProps, type KPI3Props }
