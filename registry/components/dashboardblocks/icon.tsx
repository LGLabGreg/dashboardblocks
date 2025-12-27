import { type VariantProps, cva } from 'class-variance-authority'
import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const iconVariants = cva('flex items-center justify-center bg-muted aspect-square', {
  variants: {
    shape: {
      square: 'rounded-md',
      circle: 'rounded-full',
    },
    bordered: {
      true: 'border',
      false: '',
    },
    size: {
      default: 'size-12 p-3',
      sm: 'size-8 p-2',
      md: 'size-10 p-2.5',
    },
  },
  defaultVariants: {
    shape: 'square',
    bordered: false,
    size: 'default',
  },
})

interface IconProps extends VariantProps<typeof iconVariants> {
  className?: string
  icon: LucideIcon
}

function Icon({
  className,
  icon: IconComponent,
  shape = 'square',
  bordered = false,
  size,
}: IconProps) {
  return (
    <div className={cn(iconVariants({ shape, bordered, size }), className)}>
      <IconComponent />
    </div>
  )
}

export { Icon, iconVariants }
export type { IconProps }
