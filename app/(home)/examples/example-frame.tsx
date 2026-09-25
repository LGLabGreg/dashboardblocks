import Link from 'next/link'
import type { ReactNode } from 'react'

import { ShadcnCliButton } from '@/components/shadcn-cli-button'

import { cn } from '@/lib/utils'

export const EXAMPLES = [
  {
    href: '/examples/store',
    name: 'dashboard-01',
    title: 'Store',
  },
  {
    href: '/examples/saas',
    name: 'dashboard-02',
    title: 'SaaS',
  },
]

/** Midnight UTC today, so every date range ends on the current day. */
export function startOfToday() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export function ExampleFrame({ children, name }: { children: ReactNode; name: string }) {
  return (
    <div className='flex w-full flex-1 flex-col'>
      <div className='border-b'>
        <div className='mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6'>
          <nav aria-label='Examples' className='flex items-center gap-1 text-sm'>
            <span className='text-muted-foreground mr-2'>Examples</span>
            {EXAMPLES.map((example) => (
              <Link
                key={example.name}
                href={example.href}
                aria-current={example.name === name ? 'page' : undefined}
                className={cn(
                  'text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1 transition-colors',
                  'aria-[current=page]:bg-muted aria-[current=page]:text-foreground',
                )}
              >
                {example.title}
              </Link>
            ))}
          </nav>
          <ShadcnCliButton name={name} />
        </div>
      </div>
      <main className='mx-auto w-full max-w-7xl px-4 py-8 md:px-6'>{children}</main>
    </div>
  )
}
