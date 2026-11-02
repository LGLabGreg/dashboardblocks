// Override of registry/components/dashboardblocks/tooltip-link.tsx for React Aria
// source-hash: 7dc6b03c0bfc

'use client'

import { Link, type LinkProps } from '@/registry/components/dashboardblocks/link'

import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

interface TooltipLinkProps extends Omit<LinkProps, 'aria-label'> {
  /** The link's name, shown in its tooltip, such as `Open as a page`. */
  label: string
}

/** A link that leads somewhere, drawn as a button with its label, such as View activity. @default size 'sm', variant 'outline' */
function ButtonLink({
  className,
  size = 'sm',
  variant = 'outline',
  ...props
}: LinkProps &
  Pick<NonNullable<Parameters<typeof buttonVariants>[0]>, 'size' | 'variant'>) {
  return <Link className={cn(buttonVariants({ size, variant }), className)} {...props} />
}

/** An icon that links somewhere, drawn as a ghost icon button, with its label in a tooltip. */
function TooltipLink({ className, label, ...props }: TooltipLinkProps) {
  return (
    <TooltipTrigger>
      <Link
        aria-label={label}
        className={cn(buttonVariants({ size: 'icon-sm', variant: 'ghost' }), className)}
        {...props}
      />
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  )
}

export { ButtonLink, TooltipLink }
export type { TooltipLinkProps }
