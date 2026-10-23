'use client'

import type { AISource } from '@/registry/components/dashboardblocks/ai-message'
import { isPlainClick, useLinkNavigate } from '@/registry/components/dashboardblocks/link'
import type { ReactNode } from 'react'

/**
 * A link from a model's reply or its sources. Takes an href `getSafeHref` passed; a web address opens in a new tab.
 * A plain `<a>`, not the app's router link, which may fetch an in-app path the model chose as soon as it shows; a click on an in-app path opens it with `LinkProvider`'s `navigate`.
 */
function AILink({
  children,
  className,
  href,
}: {
  children: ReactNode
  className?: string
  href: string
}) {
  const navigate = useLinkNavigate()
  const external = /^https?:/i.test(href)
  const inApp = /^[/?#]/.test(href)
  return (
    <a
      href={href}
      onClick={(event) => {
        if (!inApp || !navigate || event.defaultPrevented || !isPlainClick(event)) return
        event.preventDefault()
        navigate(href)
      }}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={className}
    >
      {children}
      {external && <span className='sr-only'> (opens in a new tab)</span>}
    </a>
  )
}

/** A cited `[n]`: the number, linked to its source, with the source's name for screen readers. */
function Citation({ index, source }: { index: number; source: AISource }) {
  const label = (
    <>
      <span aria-hidden>{index}</span>
      <span className='sr-only'>
        Source {index}: {source.label}
      </span>
    </>
  )
  return (
    <sup data-slot='citation' className='ms-0.5'>
      {source.href ? (
        <AILink
          href={source.href}
          className='text-primary font-medium tabular-nums underline underline-offset-2'
        >
          {label}
        </AILink>
      ) : (
        <span className='text-muted-foreground font-medium tabular-nums'>{label}</span>
      )}
    </sup>
  )
}

function SourceList({
  heading = 'Sources',
  headingLevel: Heading = 'h4',
  id,
  numbers,
  sources,
}: {
  /** @default 'Sources' */
  heading?: string
  /** @default 'h4' */
  headingLevel?: 'h3' | 'h4'
  id: string
  /** Lists only these sources, keeping their numbers; leave it out to list them all. */
  numbers?: number[]
  sources: AISource[]
}) {
  const listed = (numbers ?? sources.map((_, index) => index + 1)).flatMap((number) => {
    const source = sources[number - 1]
    return source ? [{ number, source }] : []
  })
  if (listed.length === 0) return null
  return (
    <div data-slot='source-list' className='flex flex-col gap-1.5 text-sm'>
      <Heading id={`${id}-sources`} className='text-muted-foreground'>
        {heading}
      </Heading>
      <ol
        aria-labelledby={`${id}-sources`}
        className='marker:text-muted-foreground flex list-decimal flex-col gap-1 ps-5 marker:tabular-nums'
      >
        {listed.map(({ number, source }) => {
          const label =
            source.kind === 'query' ? (
              <code className='font-mono text-xs break-all'>{source.label}</code>
            ) : (
              source.label
            )
          return (
            <li key={number} value={number} className='min-w-0 break-words'>
              {source.href ? (
                <AILink href={source.href} className='underline underline-offset-4'>
                  {label}
                </AILink>
              ) : (
                label
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export { AILink, Citation, SourceList }
