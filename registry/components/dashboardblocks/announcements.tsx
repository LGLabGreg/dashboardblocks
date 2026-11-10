'use client'

import { type ComponentProps, useCallback, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type Announcement = { id: number; text: string }

/**
 * The messages a block says to screen readers, newest last, keeping the last five. Like
 * `useState`, call `announce` in the same transition as the result it reports.
 */
function useAnnouncements() {
  const [said, setSaid] = useState<Announcement[]>([])
  const count = useRef(0)
  const announce = useCallback((...texts: string[]) => {
    const next = texts.map((text) => ({ id: ++count.current, text }))
    setSaid((current) => [...current, ...next].slice(-5))
  }, [])
  return [said, announce] as const
}

function Announcements({
  said,
  className,
  ...props
}: ComponentProps<'div'> & { said: readonly Announcement[] }) {
  return (
    <div
      role='status'
      aria-atomic='false'
      data-slot='announcements'
      className={cn('sr-only', className)}
      {...props}
    >
      {said.map((item) => (
        <div key={item.id}>{item.text}</div>
      ))}
    </div>
  )
}

export { Announcements, useAnnouncements }
export type { Announcement }
