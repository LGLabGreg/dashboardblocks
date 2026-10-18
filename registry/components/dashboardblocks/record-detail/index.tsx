import { RecordDetail1, recordDetail1ExampleProps } from './record-detail-01'
import { RecordDetail2, recordDetail2ExampleProps } from './record-detail-02'
import { RecordDetail3, recordDetail3ExampleProps } from './record-detail-03'

export const recordDetailComponents = {
  'record-detail-01': RecordDetail1,
  'record-detail-02': RecordDetail2,
  'record-detail-03': RecordDetail3,
}

export const recordDetailExampleProps = {
  'record-detail-01': recordDetail1ExampleProps,
  'record-detail-02': recordDetail2ExampleProps,
  'record-detail-03': recordDetail3ExampleProps,
}

export const recordDetailEmptyProps = {
  'record-detail-01': { customer: undefined, orders: [], stats: [] },
  'record-detail-02': { customer: undefined, events: [], items: [], order: undefined },
  'record-detail-03': { events: [], ticket: undefined },
}
