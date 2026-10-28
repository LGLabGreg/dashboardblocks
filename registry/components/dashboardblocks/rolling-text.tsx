'use client'

import { type ComponentProps, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface RollingTextProps extends ComponentProps<'span'> {
  /**
   * Rolls to each new value. Turn it off while the value changes faster than a roll can play,
   * such as during a drag, and it swaps in place.
   * @default true
   */
  roll?: boolean
  text: string
  /** Wraps onto more lines instead of cutting the text short, and grows or shrinks with the text. */
  wrap?: boolean
}

/** Text that rolls up to its next value. */
function RollingText({
  className,
  roll = true,
  style,
  text,
  wrap = false,
  ...props
}: RollingTextProps) {
  const [shown, setShown] = useState({
    previous: null as string | null,
    roll: true,
    text,
  })

  if (shown.text !== text) setShown({ previous: roll ? shown.text : null, roll, text })

  const content = useRef<HTMLSpanElement>(null)
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    const node = content.current
    if (!wrap || !node) return
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight))
    observer.observe(node)
    return () => observer.disconnect()
  }, [wrap])

  useEffect(() => {
    if (shown.previous === null) return
    const timer = setTimeout(
      () => setShown((current) => ({ ...current, previous: null })),
      300,
    )
    return () => clearTimeout(timer)
  }, [shown])

  return (
    <span
      data-slot='rolling-text'
      className={cn(
        'relative block overflow-hidden',
        wrap &&
          shown.roll &&
          'transition-[height] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
        className,
      )}
      style={wrap && height !== null ? { ...style, height } : style}
      {...props}
    >
      {shown.previous !== null && (
        <span
          aria-hidden
          className={cn(
            'motion-safe:animate-out motion-safe:fade-out motion-safe:slide-out-to-top-3 absolute inset-x-0 top-0 duration-300 fill-mode-forwards motion-reduce:hidden',
            wrap ? 'text-pretty' : 'truncate',
          )}
        >
          {shown.previous}
        </span>
      )}
      <span ref={content} className='block'>
        <span
          key={text}
          className={cn(
            'block',
            shown.roll &&
              'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 duration-300',
            wrap ? 'text-pretty break-words' : 'truncate',
          )}
        >
          {text}
        </span>
      </span>
    </span>
  )
}

export { RollingText }
export type { RollingTextProps }
