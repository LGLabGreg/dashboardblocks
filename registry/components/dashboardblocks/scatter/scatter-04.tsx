'use client'

import {
  type RiskLevel,
  RiskLevelLabel,
  getRiskLevel,
  riskLevelConfig,
} from '@/registry/components/dashboardblocks/scatter'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Risk {
  id: string
  /** 1 (minor) to 5 (severe). */
  impact: number
  /** 1 (rare) to 5 (almost certain). */
  likelihood: number
  owner?: string
  title: string
}

interface Scatter4Props {
  description: string
  risks: Risk[]
  title: string
}

const exampleProps: Scatter4Props = {
  description: 'Open risks by likelihood and impact',
  risks: [
    {
      id: 'r1',
      impact: 5,
      likelihood: 3,
      owner: 'Platform',
      title: 'Primary database region outage',
    },
    {
      id: 'r2',
      impact: 4,
      likelihood: 4,
      owner: 'Security',
      title: 'Leaked API keys in client builds',
    },
    {
      id: 'r3',
      impact: 3,
      likelihood: 4,
      owner: 'Growth',
      title: 'Pricing change raises churn',
    },
    {
      id: 'r4',
      impact: 4,
      likelihood: 2,
      owner: 'Legal',
      title: 'EU data residency deadline missed',
    },
    {
      id: 'r5',
      impact: 2,
      likelihood: 4,
      owner: 'Support',
      title: 'Ticket backlog after launch',
    },
    {
      id: 'r6',
      impact: 3,
      likelihood: 2,
      owner: 'Platform',
      title: 'Payment provider rate limits',
    },
    {
      id: 'r7',
      impact: 5,
      likelihood: 1,
      owner: 'Security',
      title: 'Supply chain compromise',
    },
    {
      id: 'r8',
      impact: 1,
      likelihood: 3,
      owner: 'Design',
      title: 'Icon set licence renewal',
    },
    {
      id: 'r9',
      impact: 3,
      likelihood: 4,
      owner: 'Mobile',
      title: 'App store review delays',
    },
  ],
  title: 'Risk matrix',
}

const LIKELIHOOD = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain']
const IMPACT = ['Minor', 'Moderate', 'Major', 'Severe', 'Critical']
const LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low']

const Scatter4 = (props: Scatter4Props) => {
  const { description, risks, title } = props
  const [selected, setSelected] = useState<{ impact: number; likelihood: number } | null>(
    null,
  )
  const at = (likelihood: number, impact: number) =>
    risks.filter((risk) => risk.likelihood === likelihood && risk.impact === impact)
  const shown = selected
    ? at(selected.likelihood, selected.impact)
    : [...risks]
        .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
        .slice(0, 3)

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <ul className='flex flex-wrap gap-x-4 gap-y-1'>
          {LEVELS.map((level) => (
            <li key={level} className='flex items-center gap-1.5'>
              <RiskLevelLabel level={level} />
              <span className='text-muted-foreground text-xs tabular-nums'>
                {
                  risks.filter(
                    (risk) => getRiskLevel(risk.likelihood, risk.impact) === level,
                  ).length
                }
              </span>
            </li>
          ))}
        </ul>
        <div className='grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-1'>
          {[5, 4, 3, 2, 1].map((likelihood) => (
            <div key={likelihood} className='contents'>
              <span className='text-muted-foreground flex max-w-16 items-center pr-1 text-[11px] leading-tight @sm:max-w-none'>
                {LIKELIHOOD[likelihood - 1]}
              </span>
              {[1, 2, 3, 4, 5].map((impact) => {
                const cell = at(likelihood, impact)
                const level = getRiskLevel(likelihood, impact)
                const isSelected =
                  selected?.likelihood === likelihood && selected.impact === impact
                return (
                  <button
                    key={impact}
                    type='button'
                    aria-label={`${LIKELIHOOD[likelihood - 1]} likelihood, ${IMPACT[impact - 1].toLowerCase()} impact: ${riskLevelConfig[level].label.toLowerCase()} risk, ${cell.length} ${cell.length === 1 ? 'risk' : 'risks'}`}
                    aria-pressed={isSelected}
                    className={cn(
                      'ring-offset-card focus-visible:ring-foreground flex h-9 min-w-0 items-center @sm:aspect-[4/3] @sm:h-auto justify-center rounded-md text-sm font-semibold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                      riskLevelConfig[level].cell,
                      isSelected && 'ring-foreground ring-2 ring-offset-1',
                      cell.length === 0 && 'text-transparent',
                    )}
                    onClick={() =>
                      setSelected(isSelected ? null : { impact, likelihood })
                    }
                  >
                    {cell.length}
                  </button>
                )
              })}
            </div>
          ))}
          <span />
          {IMPACT.map((label) => (
            <span
              key={label}
              className='text-muted-foreground truncate pt-1 text-center text-[11px]'
            >
              {label}
            </span>
          ))}
          <span />
          <span className='text-muted-foreground col-span-5 text-center text-[11px]'>
            Impact →
          </span>
        </div>
        <div className='flex flex-col gap-2 border-t pt-4'>
          <span className='text-muted-foreground text-xs'>
            {selected
              ? `${LIKELIHOOD[selected.likelihood - 1]} and ${IMPACT[selected.impact - 1].toLowerCase()}`
              : 'Highest risks. Select a cell to see its risks.'}
          </span>
          {shown.length === 0 ? (
            <span className='text-muted-foreground text-sm'>No risks here.</span>
          ) : (
            <ul className='flex flex-col gap-1.5'>
              {shown.map((risk) => (
                <li
                  key={risk.id}
                  className='flex items-center justify-between gap-3 text-sm'
                >
                  <span className='min-w-0 truncate'>{risk.title}</span>
                  <span className='flex shrink-0 items-center gap-2'>
                    {risk.owner && (
                      <span className='text-muted-foreground text-xs'>{risk.owner}</span>
                    )}
                    <RiskLevelLabel level={getRiskLevel(risk.likelihood, risk.impact)} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { Scatter4, exampleProps as scatter4ExampleProps, type Risk, type Scatter4Props }
