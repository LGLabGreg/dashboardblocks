import { ActivityFeed1, activityFeed1ExampleProps } from './activity-feed-01'
import { ActivityFeed2, activityFeed2ExampleProps } from './activity-feed-02'
import { ActivityFeed3, activityFeed3ExampleProps } from './activity-feed-03'
import { ActivityFeed4, activityFeed4ExampleProps } from './activity-feed-04'
import { ActivityFeed5, activityFeed5ExampleProps } from './activity-feed-05'

export const activityFeedComponents = {
  'activity-feed-01': ActivityFeed1,
  'activity-feed-02': ActivityFeed2,
  'activity-feed-03': ActivityFeed3,
  'activity-feed-04': ActivityFeed4,
  'activity-feed-05': ActivityFeed5,
}

export const activityFeedExampleProps = {
  'activity-feed-01': activityFeed1ExampleProps,
  'activity-feed-02': activityFeed2ExampleProps,
  'activity-feed-03': activityFeed3ExampleProps,
  'activity-feed-04': activityFeed4ExampleProps,
  'activity-feed-05': activityFeed5ExampleProps,
}

export const activityFeedEmptyProps = {
  'activity-feed-01': { activities: [] },
  'activity-feed-02': { events: [] },
  'activity-feed-03': { notifications: [] },
  'activity-feed-04': { contributors: [], counts: [], days: [] },
  'activity-feed-05': { events: [] },
}
