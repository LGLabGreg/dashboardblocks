import type { ComponentProps } from 'react'

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
} as const

type CardStyleVariant = keyof typeof variants

interface CardStyleProps extends ComponentProps<'div'> {
  /**
   * How every Card inside looks. Only the outermost Card is styled, never a card inside one, and
   * dialogs, sheets and popovers render outside the wrapper. `lit`: a surface lit from above, brighter at
   * its top edge, with a hairline and a soft shadow under it.
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

export { CardStyle }
export type { CardStyleProps, CardStyleVariant }
