import {
  Realtime1Preview,
  Realtime2Preview,
  Realtime3Preview,
  Realtime4Preview,
} from './preview'
import { realtime1ExampleProps } from './realtime-01'
import { realtime2ExampleProps } from './realtime-02'
import { realtime3ExampleProps } from './realtime-03'
import { realtime4ExampleProps } from './realtime-04'

export const realtimeComponents = {
  'realtime-01': Realtime1Preview,
  'realtime-02': Realtime2Preview,
  'realtime-03': Realtime3Preview,
  'realtime-04': Realtime4Preview,
}

export const realtimeExampleProps = {
  'realtime-01': realtime1ExampleProps,
  'realtime-02': realtime2ExampleProps,
  'realtime-03': realtime3ExampleProps,
  'realtime-04': realtime4ExampleProps,
}

export const realtimeEmptyProps = {
  'realtime-01': { activeUsers: undefined, pageViews: [], pages: [] },
  'realtime-02': { samples: [] },
  'realtime-03': { events: [] },
  'realtime-04': { hourly: [], metrics: [] },
}
