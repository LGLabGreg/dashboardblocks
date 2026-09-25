import { activityFeedComponents } from '@/registry/components/dashboardblocks/activity-feed/index'
import { kpiComponents } from '@/registry/components/dashboardblocks/kpi/index'
import { leaderboardComponents } from '@/registry/components/dashboardblocks/leaderboard/index'
import { usageMeterComponents } from '@/registry/components/dashboardblocks/usage-meter/index'

import { Categories } from '@/components/home/categories'
import { CTA } from '@/components/home/cta'
import { Hero } from '@/components/home/hero'
import { Steps } from '@/components/home/steps'

const counts = {
  kpi: Object.keys(kpiComponents).length,
  usageMeter: Object.keys(usageMeterComponents).length,
  activityFeed: Object.keys(activityFeedComponents).length,
  leaderboard: Object.keys(leaderboardComponents).length,
}
const blockCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

export default function HomePage() {
  return (
    <div className='flex flex-1 flex-col items-center'>
      <Hero blockCount={blockCount} />
      <Categories counts={counts} />
      <Steps />
      <CTA blockCount={blockCount} />
    </div>
  )
}
