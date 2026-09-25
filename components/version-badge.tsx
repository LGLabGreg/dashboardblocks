import { version } from '@/package.json'

import { cn } from '@/lib/utils'

export function VersionBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex rounded-full border px-1.5 py-px font-mono text-[11px] font-normal leading-4 tracking-normal normal-case tabular-nums',
        className,
      )}
    >
      v{version}
    </span>
  )
}
