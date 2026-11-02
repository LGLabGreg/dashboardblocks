// Override of registry/components/dashboardblocks/tooltip-link.tsx for React Aria
// source-hash: e7962aa48d56

'use client'

import { Link, type LinkProps } from '@/registry/components/dashboardblocks/link'

import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

interface TooltipLinkProps extends Omit<LinkProps, 'aria-label'> {
  /** The link's name, shown in its tooltip, such as `Open as a page`. */
  label: string
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

export { TooltipLink }
export type { TooltipLinkProps }
