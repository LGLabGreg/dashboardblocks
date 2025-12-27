import { type VariantProps, cva } from 'class-variance-authority'
import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const iconVariants = cva(
  'flex items-center justify-center bg-muted p-3 aspect-square w-12',
  {
    variants: {
      shape: {
        square: 'rounded-md',
        circle: 'rounded-full',
      },
      bordered: {
        true: 'border',
        false: '',
      },
    },
    defaultVariants: {
      shape: 'square',
      bordered: false,
    },
  },
)

interface IconProps extends VariantProps<typeof iconVariants> {
  className?: string
  icon: LucideIcon
}

function Icon({
  className,
  icon: IconComponent,
  shape = 'square',
  bordered = false,
}: IconProps) {
  return (
    <div className={cn(iconVariants({ shape, bordered }), className)}>
      <IconComponent />
    </div>
  )
}

export { Icon, iconVariants }
export type { IconProps }
