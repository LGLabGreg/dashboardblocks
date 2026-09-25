import { cn } from '@/lib/utils'

export function Corner({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox='0 0 11 11'
      className={cn('text-foreground/40 absolute hidden size-[11px] md:block', className)}
    >
      <path d='M5.5 0v11M0 5.5h11' stroke='currentColor' strokeWidth='1' />
    </svg>
  )
}
