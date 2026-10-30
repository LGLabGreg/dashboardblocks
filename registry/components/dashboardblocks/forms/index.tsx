import { Forms1, forms1ExampleProps } from './forms-01'
import { Forms2, forms2ExampleProps } from './forms-02'
import { Forms3, forms3ExampleProps } from './forms-03'
import { Forms4, forms4ExampleProps } from './forms-04'
import { Forms5, forms5ExampleProps } from './forms-05'
import { Forms6, forms6ExampleProps } from './forms-06'
import { Forms7, forms7ExampleProps } from './forms-07'

export const formsComponents = {
  'forms-01': Forms1,
  'forms-02': Forms2,
  'forms-03': Forms3,
  'forms-04': Forms4,
  'forms-05': Forms5,
  'forms-06': Forms6,
  'forms-07': Forms7,
}

export const formsExampleProps = {
  'forms-01': forms1ExampleProps,
  'forms-02': forms2ExampleProps,
  'forms-03': forms3ExampleProps,
  'forms-04': forms4ExampleProps,
  'forms-05': forms5ExampleProps,
  'forms-06': forms6ExampleProps,
  'forms-07': forms7ExampleProps,
}

export const formsEmptyProps = {
  'forms-01': { defaultValues: undefined },
  'forms-02': { customers: [] },
  'forms-04': { defaultValues: undefined },
  'forms-05': { defaultValues: undefined },
  'forms-06': { defaultValues: undefined },
  'forms-07': { defaultValues: undefined },
}
