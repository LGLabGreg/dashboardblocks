import { Leaderboard1, leaderboard1ExampleProps } from './leaderboard-01'
import { Leaderboard2, leaderboard2ExampleProps } from './leaderboard-02'
import { Leaderboard3, leaderboard3ExampleProps } from './leaderboard-03'
import { Leaderboard4, leaderboard4ExampleProps } from './leaderboard-04'
import { Leaderboard5, leaderboard5ExampleProps } from './leaderboard-05'

export const leaderboardComponents = {
  'leaderboard-01': Leaderboard1,
  'leaderboard-02': Leaderboard2,
  'leaderboard-03': Leaderboard3,
  'leaderboard-04': Leaderboard4,
  'leaderboard-05': Leaderboard5,
}

export const leaderboardExampleProps = {
  'leaderboard-01': leaderboard1ExampleProps,
  'leaderboard-02': leaderboard2ExampleProps,
  'leaderboard-03': leaderboard3ExampleProps,
  'leaderboard-04': leaderboard4ExampleProps,
  'leaderboard-05': leaderboard5ExampleProps,
}

export const leaderboardEmptyProps = {
  'leaderboard-01': { pages: [] },
  'leaderboard-02': { reps: [] },
  'leaderboard-03': { contributors: [] },
  'leaderboard-04': { products: [] },
  'leaderboard-05': { countries: [] },
}
