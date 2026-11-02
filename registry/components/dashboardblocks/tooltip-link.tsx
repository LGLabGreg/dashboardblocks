'use client'

import { Link, type LinkProps } from '@/registry/components/dashboardblocks/link'

import { buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

interface TooltipLinkProps extends Omit<LinkProps, 'aria-label'> {
  /** The link's name, shown in its tooltip, such as `Open as a page`. */
  label: string
}

function IconButtonLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ size: 'icon-sm', variant: 'ghost' }), className)}
      {...props}
    />
  )
}

/** An icon that links somewhere, drawn as a ghost icon button, with its label in a tooltip. */
function TooltipLink({ children, label, ...props }: TooltipLinkProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<IconButtonLink {...props} />} aria-label={label}>
          {children}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { TooltipLink }
export type { TooltipLinkProps }
