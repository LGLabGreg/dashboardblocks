'use client'

import { type ComponentProps, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const shared = cn(
  '[--card-style-card:var(--card)] [--card-style-muted:var(--muted)] [--card-style-accent:var(--accent)] [--card-style-border:var(--border)] [--card-style-muted-foreground:var(--muted-foreground)]',
  '[&_[data-slot=card]:not([data-slot=card]_*)]:[--card:color-mix(in_oklab,var(--card-style-card),var(--foreground)_var(--card-style-step,0%))]',
  '[&_[data-slot=card]:not([data-slot=card]_*)]:[--muted:color-mix(in_oklab,var(--card-style-muted),var(--foreground)_var(--card-style-step,0%))]',
  '[&_[data-slot=card]:not([data-slot=card]_*)]:[--accent:color-mix(in_oklab,var(--card-style-accent),var(--foreground)_var(--card-style-step,0%))]',
  '[&_[data-slot=card]:not([data-slot=card]_*)]:[--border:color-mix(in_oklab,var(--card-style-border),var(--foreground)_var(--card-style-step,0%))]',
  '[&_[data-slot=card]:not([data-slot=card]_*)]:[--muted-foreground:color-mix(in_oklab,var(--card-style-muted-foreground),var(--foreground)_var(--card-style-step,0%))]',
  '[&_[data-slot=card]:not([data-slot=card]_*)]:[--background:var(--card)]',
  '[&_[data-slot=card]:not([data-slot=card]_*)]:[--color-background:var(--card)] [&_[data-slot=card]:not([data-slot=card]_*)]:[--color-card:var(--card)] [&_[data-slot=card]:not([data-slot=card]_*)]:[--color-muted:var(--muted)] [&_[data-slot=card]:not([data-slot=card]_*)]:[--color-accent:var(--accent)] [&_[data-slot=card]:not([data-slot=card]_*)]:[--color-border:var(--border)] [&_[data-slot=card]:not([data-slot=card]_*)]:[--color-muted-foreground:var(--muted-foreground)]',
  '[&_[data-slot=card]:not([data-slot=card]_*)]:border-transparent [&_[data-slot=card]:not([data-slot=card]_*)]:[box-shadow:var(--card-style-shadow,none)] [&_[data-slot=card]:not([data-slot=card]_*)]:[background-image:var(--card-style-image,none)]',
)

const variants = {
  lit: cn(
    '[--card-style-step:0%] dark:[--card-style-step:3%]',
    '[--card-style-image:linear-gradient(var(--card),color-mix(in_oklab,var(--card),var(--foreground)_1.5%))]',
    'dark:[--card-style-image:linear-gradient(color-mix(in_oklab,var(--card),white_2.5%),var(--card)_45%)]',
    '[--card-style-shadow:inset_0_1px_0_oklch(1_0_0),inset_0_-1px_0_oklch(0_0_0/0.05),0_0_0_1px_oklch(0_0_0/0.09),0_1px_2px_oklch(0_0_0/0.06),0_10px_24px_-14px_oklch(0_0_0/0.16)]',
    'dark:[--card-style-shadow:inset_0_1px_0_oklch(1_0_0/0.08),0_0_0_1px_oklch(0_0_0/0.5),0_1px_3px_oklch(0_0_0/0.5),0_12px_28px_-16px_oklch(0_0_0/0.6)]',
  ),
  frame: cn(
    '[--card-style-tray:color-mix(in_oklab,var(--background),var(--foreground)_3.5%)]',
    '[--card-style-shadow:0_0_0_1px_color-mix(in_oklab,var(--card-style-border),var(--foreground)_4%)]',
    '[&_[data-slot=card]:not([data-slot=card]_*)]:relative [&_[data-slot=card]:not([data-slot=card]_*)]:gap-0 [&_[data-slot=card]:not([data-slot=card]_*)]:rounded-[calc(var(--radius)+0.25rem)] [&_[data-slot=card]:not([data-slot=card]_*)]:bg-(--card-style-tray) [&_[data-slot=card]:not([data-slot=card]_*)]:p-1 [&_[data-slot=card]:not([data-slot=card]_*)]:pt-10 [&_[data-slot=card]:not([data-slot=card]_*)]:[--card-spacing:--spacing(5)]',
    '[&_[data-slot=card]:not([data-slot=card]_*):not(:has(>[data-slot=card-content]>*>:first-child_h2)):not(:has(>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child))]:pt-1',
    '[&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]]:bg-card [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]]:flex-1 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]]:rounded-(--radius) [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]]:py-(--card-spacing) [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]]:shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.04)]',
    '[&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:text-muted-foreground [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:absolute [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:inset-x-0 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:top-5 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:-translate-y-1/2 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:line-clamp-2 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:text-balance [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:px-4 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:font-mono [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:text-xs [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:leading-4 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:font-normal [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:tracking-widest [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>*>:first-child_h2]:uppercase',
    '[&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:text-muted-foreground [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:absolute [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:inset-x-0 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:top-5 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:-translate-y-1/2 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:line-clamp-2 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:text-balance [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:px-4 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:font-mono [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:text-xs [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:leading-4 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:font-normal [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:tracking-widest [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:uppercase',
    '[&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-style-icon]]:absolute [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-style-icon]]:start-4 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-style-icon]]:top-0 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-style-icon]]:flex [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-style-icon]]:h-10 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-style-icon]]:items-center [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-style-icon]]:text-muted-foreground [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-style-icon]_svg]:size-3.5 [&_[data-slot=card]:not([data-slot=card]_*):has(>[data-slot=card-style-icon])>[data-slot=card-content]>*>:first-child_h2]:ps-9.5 [&_[data-slot=card]:not([data-slot=card]_*):has(>[data-slot=card-style-icon])>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:ps-9.5',
    '[&_[data-slot=card]:not([data-slot=card]_*):has(>[data-slot=card-content]_[data-slot=card-style-action])>[data-slot=card-content]>*>:first-child_h2]:pe-[calc(var(--card-style-action-width,0px)+1rem)] [&_[data-slot=card]:not([data-slot=card]_*):has(>[data-slot=card-content]_[data-slot=card-style-action])>[data-slot=card-content]>[data-slot=kpi]>[data-slot=kpi-title]:first-child]:pe-[calc(var(--card-style-action-width,0px)+1rem)]',
    '[&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]_[data-slot=card-style-action]]:absolute [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]_[data-slot=card-style-action]]:end-1 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]_[data-slot=card-style-action]]:top-0 [&_[data-slot=card]:not([data-slot=card]_*)>[data-slot=card-content]_[data-slot=card-style-action]]:h-10',
  ),
} as const

type CardStyleVariant = keyof typeof variants

interface CardStyleProps extends ComponentProps<'div'> {
  /**
   * How every Card inside looks. Only the outermost Card is styled, never a card inside one, and
   * dialogs, sheets and popovers render outside the wrapper. `lit`: a surface lit from above, brighter at
   * its top edge, with a hairline and a soft shadow under it. `frame`: a tray a step off the page holding
   * the card as a panel, with the block's `h2`, or a KPI's title, set in small mono capitals in the tray's top rim, on two lines when it's too long for one, after a `CardStyleIcon`
   * when the Card holds one, and a `CardStyleAction` at the end of the top rim, the caption keeping clear of it.
   */
  variant: CardStyleVariant
}

function CardStyle({ className, variant, ...props }: CardStyleProps) {
  return (
    <div
      data-slot='card-style'
      data-card-style={variant}
      className={cn(shared, variants[variant], className)}
      {...props}
    />
  )
}

function CardStyleIcon({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot='card-style-icon'
      className={cn('hidden', className)}
      {...props}
    />
  )
}

/** Holds a block's action, such as a link to the full report: in place, or at the end of a Frame card's top rim, where the caption keeps clear of it. */
function CardStyleAction({ className, ...props }: ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const action = ref.current
    const card = action?.closest<HTMLElement>('[data-slot=card]')
    if (!action || !card) return
    const observer = new ResizeObserver(() =>
      card.style.setProperty('--card-style-action-width', `${action.offsetWidth}px`),
    )
    observer.observe(action)
    return () => {
      observer.disconnect()
      card.style.removeProperty('--card-style-action-width')
    }
  }, [])
  return (
    <div
      data-slot='card-style-action'
      className={cn('flex shrink-0 items-center', className)}
      {...props}
      ref={ref}
    />
  )
}

export { CardStyle, CardStyleAction, CardStyleIcon }
export type { CardStyleProps, CardStyleVariant }
