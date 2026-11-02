'use client'

import type { ReactNode } from 'react'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

import { cn } from '@/lib/utils'

interface ResizableSplitProps {
  /** The main pane, such as a chat. */
  children: ReactNode
  className?: string
  /** The side pane's share of the width when it opens, in percent. @default 50 */
  defaultSideSize?: number
  /** Names the line people drag, for screen readers. @default 'Resize' */
  label?: string
  /** The narrowest either pane can be dragged to, in rem. @default 22 */
  minSize?: number
  /** The pane beside it, such as a document, at the end of the row. */
  side: ReactNode
}

/** Two panes side by side, with a line between them that people drag, or move with the arrow keys, to share the width. Below `xl` they stack: the side pane on top, filling the height, and the main pane under it, as tall as its content. */
function ResizableSplit({
  children,
  className,
  defaultSideSize = 50,
  label = 'Resize',
  minSize = 22,
  side,
}: ResizableSplitProps) {
  return (
    <ResizablePanelGroup
      data-slot='resizable-split'
      orientation='horizontal'
      className={cn(
        'min-h-0 max-xl:flex-col! max-xl:[&>[data-panel]:first-child]:order-last max-xl:[&>[data-panel]:first-child]:flex-none! max-xl:[&>[data-panel]:last-child]:flex-[1_1_0]! max-xl:[&>[data-separator]]:hidden',
        className,
      )}
    >
      <ResizablePanel className='flex flex-col' minSize={`${minSize}rem`}>
        {children}
      </ResizablePanel>
      <ResizableHandle aria-label={label} withHandle />
      <ResizablePanel
        className='flex flex-col'
        defaultSize={`${defaultSideSize}%`}
        minSize={`${minSize}rem`}
      >
        {side}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export { ResizableSplit }
export type { ResizableSplitProps }
