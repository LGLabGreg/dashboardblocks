// Override of registry/components/dashboardblocks/kanban.tsx for React Aria
// source-hash: a1bdf6da7259

'use client'

import {
  type ActivityTone,
  activityToneClasses,
} from '@/registry/components/dashboardblocks/activity-feed'
import {
  UrgencyBadge,
  formatDay,
  getDay,
  getDayOffset,
  getUrgency,
} from '@/registry/components/dashboardblocks/schedule'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'

import { cn } from '@/lib/utils'

interface KanbanColumnDef {
  /** A dot beside the title, such as `var(--chart-2)`. */
  color?: string
  id: string
  title: string
  /** The most cards the column should hold. Shown as "3 / 4" beside the title. */
  wipLimit?: number
}

/** A card's data. Extend it with whatever your cards show. */
interface KanbanItem {
  /** The id of the column the card is in. Cards keep the array's order within a column. */
  column: string
  id: string
  /** Names the card in announcements and its menu. */
  title: string
}

/**
 * `warn` lets cards into a column at its WIP limit and flags the column when
 * it goes over. `block` refuses them.
 */
type KanbanWipLimitMode = 'block' | 'warn'

interface KanbanTarget {
  /** Set when the column is at its limit and `wipLimitMode` is `block`. */
  blocked?: boolean
  column: string
  /** The position in the column, counted without the card being moved. */
  index: number
}

interface KanbanDrag {
  id: string
  mode: 'keyboard' | 'pointer'
  origin: KanbanTarget
  /** Where the card lands if dropped now. `null` while it's outside the board. */
  target: KanbanTarget | null
}

/** Cards in `column`, in board order, leaving out the card with id `without`. */
function getColumnItems<T extends KanbanItem>(
  items: T[],
  column: string,
  without?: string,
) {
  return items.filter((item) => item.column === column && item.id !== without)
}

/**
 * Moves a card to `index` in `column` and returns a new array. `index` counts
 * the column's cards without the moved one, as `onMove` reports it.
 */
function moveItem<T extends KanbanItem>(
  items: T[],
  id: string,
  column: string,
  index: number,
): T[] {
  const item = items.find((candidate) => candidate.id === id)
  if (!item) return items
  const rest = items.filter((candidate) => candidate.id !== id)
  const siblings = rest.filter((candidate) => candidate.column === column)
  const before = siblings[Math.max(0, index)]
  const at = before
    ? rest.indexOf(before)
    : siblings.length > 0
      ? rest.indexOf(siblings[siblings.length - 1]) + 1
      : rest.length
  return [...rest.slice(0, at), { ...item, column }, ...rest.slice(at)]
}

interface KanbanState {
  columns: KanbanColumnDef[]
  items: KanbanItem[]
  onMove: (id: string, column: string, index: number) => void
  wipLimitMode: KanbanWipLimitMode
}

/** Whether `id` can go into `column`: always, unless the column is full and the mode is `block`. */
function canDrop(state: KanbanState, id: string, column: string) {
  const item = state.items.find((candidate) => candidate.id === id)
  const limit = state.columns.find((candidate) => candidate.id === column)?.wipLimit
  if (!item || item.column === column || limit === undefined) return true
  return (
    state.wipLimitMode !== 'block' || getColumnItems(state.items, column).length < limit
  )
}

/** Whether moving `id` into `column` takes the column over its WIP limit. */
function exceedsLimit(state: KanbanState, id: string, column: string) {
  const item = state.items.find((candidate) => candidate.id === id)
  const limit = state.columns.find((candidate) => candidate.id === column)?.wipLimit
  return (
    item !== undefined &&
    item.column !== column &&
    limit !== undefined &&
    getColumnItems(state.items, column).length >= limit
  )
}

/** "In progress, position 2 of 4", counting the moved card. */
function describePosition(state: KanbanState, id: string, target: KanbanTarget) {
  const column = state.columns.find((candidate) => candidate.id === target.column)
  const count = getColumnItems(state.items, target.column, id).length + 1
  return `${column?.title ?? target.column}, position ${target.index + 1} of ${count}`
}

function isSameTarget(a: KanbanTarget | null, b: KanbanTarget | null) {
  return a?.column === b?.column && a?.index === b?.index && a?.blocked === b?.blocked
}

interface KanbanContextValue {
  canDrop: (id: string, column: string) => boolean
  columns: KanbanColumnDef[]
  drag: KanbanDrag | null
  exceedsLimit: (id: string, column: string) => boolean
  instructionsId: string
  itemName: KanbanItemName
  items: KanbanItem[]
  moveFromMenu: (id: string, column: string, index: number) => void
  onHandleBlur: (id: string) => void
  onHandleClick: (event: MouseEvent<HTMLButtonElement>, id: string) => void
  onHandleKeyDown: (event: KeyboardEvent<HTMLButtonElement>, id: string) => void
  onPointerDown: (event: PointerEvent<HTMLElement>, id: string) => void
  registerHandle: (id: string, element: HTMLButtonElement | null) => void
}

const KanbanContext = createContext<KanbanContextValue | null>(null)

function useKanban() {
  const context = useContext(KanbanContext)
  if (!context) throw new Error('Kanban parts must be inside a KanbanBoard.')
  return context
}

const KanbanCardContext = createContext<KanbanItem | null>(null)

function useKanbanCard() {
  const item = useContext(KanbanCardContext)
  if (!item) throw new Error('Kanban card parts must be inside a KanbanCard.')
  return item
}

interface KanbanItemName {
  one: string
  other: string
}

interface PointerSession {
  active: boolean
  frame: number
  id: string
  offsetX: number
  offsetY: number
  pointerId: number
  removeListeners: () => void
  startX: number
  startY: number
  surface: HTMLElement
  timer?: ReturnType<typeof setTimeout>
  x: number
  y: number
}

/** Mouse drags start after the pointer moves this far, in pixels. */
const DRAG_DISTANCE = 4
/** Touch drags start after a press this long, in milliseconds, so a swipe still scrolls. */
const TOUCH_DELAY = 250
/** A touch that moves this far before the delay is a scroll, not a drag. */
const TOUCH_TOLERANCE = 8
/** Dragging this close to an edge scrolls the board or the page. */
const SCROLL_EDGE = 56

const INTERACTIVE =
  'a, button, input, select, textarea, [contenteditable], [role="button"], [role="menuitem"]'

interface KanbanBoardProps {
  /** `KanbanColumn`s, one per column in `columns`, in the same order. */
  children: ReactNode
  className?: string
  columns: KanbanColumnDef[]
  /** What a card is, in counts and empty columns. @default { one: 'card', other: 'cards' } */
  itemName?: KanbanItemName
  /** Every card on the board. Cards keep the array's order within a column. */
  items: KanbanItem[]
  /** Names the board for screen readers, such as "Sprint 24". */
  label: string
  /**
   * Called when a card is dropped somewhere new, by dragging, with the keyboard
   * or from its menu. `index` counts the column's cards without the moved one;
   * pass the arguments to `moveItem` to update your array.
   */
  onMove: (id: string, column: string, index: number) => void
  /** @default 'warn' */
  wipLimitMode?: KanbanWipLimitMode
}

/**
 * A row of columns that scrolls sideways when they don't fit. Drag cards with a
 * mouse, or press and hold on touch screens. With a keyboard, Space or Enter
 * picks a card up, the arrow keys move it and Space or Enter drops it. Every
 * step is announced to screen readers.
 */
function KanbanBoard({
  children,
  className,
  columns,
  itemName = { one: 'card', other: 'cards' },
  items,
  label,
  onMove,
  wipLimitMode = 'warn',
}: KanbanBoardProps) {
  const id = useId()
  const instructionsId = `${id}-instructions`
  const scrollerRef = useRef<HTMLDivElement>(null)
  const handles = useRef(new Map<string, HTMLButtonElement>())
  const [drag, setDragState] = useState<KanbanDrag | null>(null)
  const [announcement, setAnnouncement] = useState('')
  // Pointer and keyboard handlers outlive the render that created them, so they
  // read the current drag and props from refs.
  const dragRef = useRef<KanbanDrag | null>(null)
  const session = useRef<PointerSession | null>(null)
  const pendingFocus = useRef<{ id: string; onlyIfLost: boolean } | null>(null)
  const latest = useRef<KanbanState>({ columns, items, onMove, wipLimitMode })

  useEffect(() => {
    latest.current = { columns, items, onMove, wipLimitMode }
  })

  // Moving a card between columns remounts it, which drops focus. Put it back
  // on the card once the new position has rendered.
  useEffect(() => {
    const pending = pendingFocus.current
    if (!pending) return
    pendingFocus.current = null
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement
      if (pending.onlyIfLost && active && active !== document.body) return
      handles.current.get(pending.id)?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [items])

  // Keep the drop position in view while moving with the keyboard.
  useEffect(() => {
    if (drag?.mode !== 'keyboard' || !drag.target) return
    const root = scrollerRef.current
    const target =
      root?.querySelector('[data-kanban-indicator]') ??
      root?.querySelector(
        `[data-kanban-column="${CSS.escape(drag.target.column)}"][data-collapsed]`,
      ) ??
      root?.querySelector(`[data-kanban-card="${CSS.escape(drag.id)}"]`)
    target?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [drag])

  useEffect(
    () => () => {
      const current = session.current
      if (!current) return
      cancelAnimationFrame(current.frame)
      clearTimeout(current.timer)
      current.removeListeners()
    },
    [],
  )

  function setDrag(next: KanbanDrag | null) {
    dragRef.current = next
    setDragState(next)
  }

  function announce(text: string) {
    // A repeat of the last message wouldn't be read again, so vary it.
    setAnnouncement((current) => (current === text ? `${text}\u00a0` : text))
  }

  function titleOf(cardId: string) {
    return latest.current.items.find((item) => item.id === cardId)?.title ?? 'Card'
  }

  function limitNote(cardId: string, column: string) {
    const state = latest.current
    if (!exceedsLimit(state, cardId, column)) return ''
    const def = state.columns.find((candidate) => candidate.id === column)
    return ` That puts ${def?.title} over its limit of ${def?.wipLimit}.`
  }

  function lift(cardId: string) {
    const state = latest.current
    const item = state.items.find((candidate) => candidate.id === cardId)
    if (!item) return
    const origin = {
      column: item.column,
      index: getColumnItems(state.items, item.column).indexOf(item),
    }
    setDrag({ id: cardId, mode: 'keyboard', origin, target: origin })
    announce(
      `Picked up ${item.title}. ${describePosition(state, cardId, origin)}. Use the arrow keys to move it, Space or Enter to drop it, Escape to cancel.`,
    )
  }

  function drop() {
    const current = dragRef.current
    if (!current) return
    const state = latest.current
    const title = titleOf(current.id)
    setDrag(null)
    const { origin, target } = current
    if (!target || target.blocked) {
      const def = state.columns.find((candidate) => candidate.id === target?.column)
      announce(
        `${target?.blocked ? `${def?.title} is at its limit of ${def?.wipLimit}. ` : ''}${title} is back in ${describePosition(state, current.id, origin)}.`,
      )
      return
    }
    if (isSameTarget(target, origin)) {
      announce(
        `Dropped ${title} where it was, ${describePosition(state, current.id, origin)}.`,
      )
      return
    }
    if (current.mode === 'keyboard')
      pendingFocus.current = { id: current.id, onlyIfLost: false }
    announce(
      `Dropped ${title} in ${describePosition(state, current.id, target)}.${limitNote(current.id, target.column)}`,
    )
    state.onMove(current.id, target.column, target.index)
  }

  function cancel() {
    const current = dragRef.current
    if (!current) return
    setDrag(null)
    announce(
      `Move cancelled. ${titleOf(current.id)} is back in ${describePosition(latest.current, current.id, current.origin)}.`,
    )
  }

  function moveKeyboardTarget(key: string) {
    const current = dragRef.current
    if (!current?.target) return
    const state = latest.current
    const { target } = current
    let next: KanbanTarget = target
    let skipped: string[] = []
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      const count = getColumnItems(state.items, target.column, current.id).length
      const index = target.index + (key === 'ArrowUp' ? -1 : 1)
      next = { ...target, index: Math.max(0, Math.min(count, index)) }
    } else {
      const step = key === 'ArrowLeft' ? -1 : 1
      let position =
        state.columns.findIndex((column) => column.id === target.column) + step
      const passed: string[] = []
      // In `block` mode, skip over full columns to the next one with room.
      while (
        position >= 0 &&
        position < state.columns.length &&
        !canDrop(state, current.id, state.columns[position].id)
      ) {
        passed.push(state.columns[position].title)
        position += step
      }
      const column = state.columns[position]
      if (column) {
        const count = getColumnItems(state.items, column.id, current.id).length
        next = { column: column.id, index: Math.min(target.index, count) }
        skipped = passed
      }
    }
    setDrag({ ...current, target: next })
    const title = titleOf(current.id)
    const edge =
      isSameTarget(next, target) && key !== 'ArrowUp' && key !== 'ArrowDown'
        ? `${title} can't move further ${key === 'ArrowLeft' ? 'left' : 'right'}. `
        : ''
    const skip =
      skipped.length > 0
        ? `Skipped ${skipped.join(' and ')}, at ${skipped.length === 1 ? 'its' : 'their'} limit. `
        : ''
    announce(
      `${edge}${skip}${describePosition(state, current.id, next)}.${limitNote(current.id, next.column)}`,
    )
  }

  function onHandleClick(event: MouseEvent<HTMLButtonElement>, cardId: string) {
    // Space and Enter click a button with `detail` 0, as do screen readers.
    // Mouse and touch clicks are left to dragging.
    if (event.detail !== 0) return
    event.preventDefault()
    const current = dragRef.current
    if (!current) lift(cardId)
    else if (current.mode === 'keyboard' && current.id === cardId) drop()
  }

  function onHandleKeyDown(event: KeyboardEvent<HTMLButtonElement>, cardId: string) {
    const current = dragRef.current
    if (current?.mode !== 'keyboard' || current.id !== cardId) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      cancel()
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault()
      moveKeyboardTarget(event.key)
    }
  }

  function onHandleBlur(cardId: string) {
    const current = dragRef.current
    if (current?.mode === 'keyboard' && current.id === cardId) cancel()
  }

  function moveFromMenu(cardId: string, column: string, index: number) {
    const state = latest.current
    pendingFocus.current = { id: cardId, onlyIfLost: true }
    announce(
      `Moved ${titleOf(cardId)} to ${describePosition(state, cardId, { column, index })}.${limitNote(cardId, column)}`,
    )
    state.onMove(cardId, column, index)
  }

  /** The column and position under the pointer, or `null` when it's well outside the board. */
  function findTarget(cardId: string, x: number, y: number): KanbanTarget | null {
    const root = scrollerRef.current
    if (!root) return null
    const bounds = root.getBoundingClientRect()
    if (y < bounds.top - SCROLL_EDGE || y > bounds.bottom + SCROLL_EDGE) return null
    const clampedX = Math.max(bounds.left + 1, Math.min(bounds.right - 1, x))
    let closest: HTMLElement | null = null
    let distance = Infinity
    for (const element of root.querySelectorAll<HTMLElement>('[data-kanban-column]')) {
      const rect = element.getBoundingClientRect()
      const gap =
        clampedX < rect.left ? rect.left - clampedX : Math.max(0, clampedX - rect.right)
      if (gap < distance) {
        closest = element
        distance = gap
      }
    }
    const column = closest?.dataset.kanbanColumn
    if (!closest || column === undefined) return null
    if (!canDrop(latest.current, cardId, column))
      return { blocked: true, column, index: 0 }
    if (closest.dataset.collapsed !== undefined) return { column, index: 0 }
    let index = 0
    for (const card of closest.querySelectorAll<HTMLElement>('[data-kanban-card]')) {
      if (card.dataset.kanbanCard === cardId) continue
      const rect = card.getBoundingClientRect()
      if (rect.top + rect.height / 2 < y) index++
    }
    return { column, index }
  }

  function endPointer(commit: boolean) {
    const current = session.current
    if (!current) return
    session.current = null
    cancelAnimationFrame(current.frame)
    clearTimeout(current.timer)
    current.removeListeners()
    current.surface.style.transform = ''
    if (!current.active) return
    if (commit) drop()
    else cancel()
  }

  function tick() {
    const current = session.current
    const root = scrollerRef.current
    if (!current?.active || !root) return
    const { x, y } = current
    const bounds = root.getBoundingClientRect()

    // Scroll the board near its sides and the page near the window's top and bottom.
    const edge = Math.min(SCROLL_EDGE, bounds.width / 5)
    const speed = (depth: number) => Math.min(20, Math.ceil((depth / edge) * 14))
    if (x < bounds.left + edge) root.scrollLeft -= speed(bounds.left + edge - x)
    else if (x > bounds.right - edge) root.scrollLeft += speed(x - bounds.right + edge)
    if (y < SCROLL_EDGE) window.scrollBy(0, -speed(SCROLL_EDGE - y))
    else if (y > window.innerHeight - SCROLL_EDGE)
      window.scrollBy(0, speed(y - window.innerHeight + SCROLL_EDGE))

    // Follow the pointer, kept inside the board so it never widens the scroll area.
    const slot = (
      current.surface.parentElement ?? current.surface
    ).getBoundingClientRect()
    const inset = 6
    const left = Math.max(
      bounds.left + inset,
      Math.min(bounds.left + root.clientWidth - slot.width - inset, x - current.offsetX),
    )
    const top = Math.max(
      bounds.top + inset,
      Math.min(bounds.top + root.clientHeight - slot.height - inset, y - current.offsetY),
    )
    current.surface.style.transform = `translate(${left - slot.left}px, ${top - slot.top}px)`

    const target = findTarget(current.id, x, y)
    const drag = dragRef.current
    if (drag && !isSameTarget(drag.target, target)) setDrag({ ...drag, target })
    current.frame = requestAnimationFrame(tick)
  }

  function activate() {
    const current = session.current
    const state = latest.current
    const item = state.items.find((candidate) => candidate.id === current?.id)
    if (!current || !item) return
    current.active = true
    const rect = current.surface.getBoundingClientRect()
    current.offsetX = current.startX - rect.left
    current.offsetY = current.startY - rect.top
    const origin = {
      column: item.column,
      index: getColumnItems(state.items, item.column).indexOf(item),
    }
    setDrag({ id: item.id, mode: 'pointer', origin, target: origin })
    announce(`Picked up ${item.title}.`)
    current.frame = requestAnimationFrame(tick)
  }

  function onPointerDown(event: PointerEvent<HTMLElement>, cardId: string) {
    if (event.button !== 0 || dragRef.current || session.current) return
    const target = event.target as HTMLElement
    // Buttons and links inside a card work on their own; only the card itself drags.
    if (!target.closest('[data-kanban-handle]') && target.closest(INTERACTIVE)) return
    const isTouch = event.pointerType === 'touch'

    const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
      const current = session.current
      if (!current || moveEvent.pointerId !== current.pointerId) return
      if (moveEvent.pointerType === 'mouse' && moveEvent.buttons === 0) {
        endPointer(true)
        return
      }
      current.x = moveEvent.clientX
      current.y = moveEvent.clientY
      if (current.active) return
      const distance = Math.hypot(current.x - current.startX, current.y - current.startY)
      if (isTouch && distance > TOUCH_TOLERANCE) endPointer(false)
      else if (!isTouch && distance > DRAG_DISTANCE) activate()
    }
    const onUp = (upEvent: globalThis.PointerEvent) => {
      if (upEvent.pointerId === session.current?.pointerId) endPointer(true)
    }
    const onCancel = (cancelEvent: globalThis.PointerEvent) => {
      if (cancelEvent.pointerId === session.current?.pointerId) endPointer(false)
    }
    const onKey = (keyEvent: globalThis.KeyboardEvent) => {
      if (keyEvent.key !== 'Escape' || !session.current?.active) return
      keyEvent.preventDefault()
      endPointer(false)
    }
    // Once a touch drag starts, stop the page from scrolling under it.
    const onTouchMove = (touchEvent: TouchEvent) => {
      if (session.current?.active && touchEvent.cancelable) touchEvent.preventDefault()
    }
    const onContextMenu = (menuEvent: Event) => menuEvent.preventDefault()
    const onBlur = () => endPointer(false)

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('blur', onBlur)

    session.current = {
      active: false,
      frame: 0,
      id: cardId,
      offsetX: 0,
      offsetY: 0,
      pointerId: event.pointerId,
      removeListeners: () => {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onCancel)
        window.removeEventListener('keydown', onKey)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('contextmenu', onContextMenu)
        window.removeEventListener('blur', onBlur)
      },
      startX: event.clientX,
      startY: event.clientY,
      surface: event.currentTarget,
      timer: isTouch ? setTimeout(activate, TOUCH_DELAY) : undefined,
      x: event.clientX,
      y: event.clientY,
    }
  }

  function registerHandle(cardId: string, element: HTMLButtonElement | null) {
    if (element) handles.current.set(cardId, element)
    else handles.current.delete(cardId)
  }

  const context: KanbanContextValue = {
    canDrop: (cardId, column) =>
      canDrop({ columns, items, onMove, wipLimitMode }, cardId, column),
    columns,
    drag,
    exceedsLimit: (cardId, column) =>
      exceedsLimit({ columns, items, onMove, wipLimitMode }, cardId, column),
    instructionsId,
    itemName,
    items,
    moveFromMenu,
    onHandleBlur,
    onHandleClick,
    onHandleKeyDown,
    onPointerDown,
    registerHandle,
  }

  return (
    <KanbanContext.Provider value={context}>
      <div className='relative min-w-0'>
        <p id={instructionsId} className='sr-only'>
          To move a {itemName.one} with the keyboard, press Space or Enter on it, use the
          arrow keys to choose a column and a position, then press Space or Enter to drop
          it, or Escape to cancel. Each {itemName.one} also has a Move menu.
        </p>
        <p role='status' className='sr-only'>
          {announcement}
        </p>
        <div
          ref={scrollerRef}
          role='region'
          aria-label={label}
          data-dragging={drag?.mode}
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must be focusable so keyboard users can reach the columns that don't fit
          tabIndex={0}
          className={cn(
            'focus-visible:ring-ring/50 @container flex snap-x snap-proximity items-start gap-3 overflow-x-auto outline-none focus-visible:ring-3 focus-visible:ring-inset data-dragging:snap-none data-dragging:select-none data-[dragging=pointer]:**:cursor-grabbing',
            className,
          )}
        >
          {children}
        </div>
        {drag?.mode === 'keyboard' && (
          // Sticks to the bottom of the window while the board runs past it.
          <div aria-hidden className='pointer-events-none sticky bottom-4 z-20 h-0'>
            <div className='bg-popover text-popover-foreground absolute inset-x-4 bottom-4 mx-auto flex w-fit max-w-[calc(100%-2rem)] flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10'>
              <span className='flex items-center gap-1'>
                <Kbd>←</Kbd>
                <Kbd>→</Kbd>
                Column
              </span>
              <span className='flex items-center gap-1'>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                Position
              </span>
              <span className='flex items-center gap-1'>
                <Kbd>Space</Kbd>
                Drop
              </span>
              <span className='flex items-center gap-1'>
                <Kbd>Esc</Kbd>
                Cancel
              </span>
            </div>
          </div>
        )}
      </div>
    </KanbanContext.Provider>
  )
}

/** "3" or, with a WIP limit, "3 / 4": amber at the limit and red with an icon over it. */
function KanbanCount({
  className,
  count,
  itemName = { one: 'card', other: 'cards' },
  limit,
}: {
  className?: string
  count: number
  itemName?: KanbanItemName
  limit?: number
}) {
  const state =
    limit === undefined
      ? 'none'
      : count > limit
        ? 'over'
        : count === limit
          ? 'at'
          : 'under'
  return (
    <span
      data-state={state}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums [&_svg]:size-3 [&_svg]:shrink-0',
        state === 'over'
          ? 'bg-red-500/10 text-red-700 dark:text-red-400'
          : state === 'at'
            ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400'
            : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {state === 'over' && (
        <IconPlaceholder
          lucide='TriangleAlertIcon'
          tabler='IconAlertTriangle'
          hugeicons='Alert02Icon'
          phosphor='WarningIcon'
          remixicon='RiErrorWarningLine'
          aria-hidden
        />
      )}
      <span aria-hidden>{limit === undefined ? count : `${count} / ${limit}`}</span>
      <span className='sr-only'>
        {count} {count === 1 ? itemName.one : itemName.other}
        {limit !== undefined && `, limit ${limit}`}
        {state === 'over' && ', over the limit'}
        {state === 'at' && ', at the limit'}
      </span>
    </span>
  )
}

interface KanbanColumnProps {
  /** Buttons at the end of the header, such as an add button. */
  action?: ReactNode
  /** The column's `KanbanCard`s, in board order. */
  children?: ReactNode
  className?: string
  /** Shows the column as a narrow strip with its title and count. Cards dropped on it go to the top. */
  collapsed?: boolean
  column: KanbanColumnDef
  /** Shown when the column has no cards. @default 'No cards' */
  empty?: ReactNode
  /** Under the cards, such as a `KanbanAddCard`. */
  footer?: ReactNode
  /** Adds a button that collapses and expands the column. */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Under the title, such as the column's total value. */
  summary?: ReactNode
}

/** One column: a header with its title, count and WIP limit, its cards, and an optional footer. */
function KanbanColumn({
  action,
  children,
  className,
  collapsed = false,
  column,
  empty,
  footer,
  onCollapsedChange,
  summary,
}: KanbanColumnProps) {
  const headingId = useId()
  const { drag, items, itemName } = useKanban()
  const count = getColumnItems(items, column.id).length
  const target = drag?.target?.column === column.id ? drag.target : null
  const isOver =
    target !== null && !target.blocked && !isSameTarget(target, drag?.origin ?? null)
  const dot = column.color && (
    <span
      aria-hidden
      className='size-2.5 shrink-0 rounded-full'
      style={{ backgroundColor: column.color }}
    />
  )
  const toggle = onCollapsedChange && (
    <Button
      aria-expanded={!collapsed}
      aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${column.title}`}
      className='text-muted-foreground'
      size='icon-xs'
      variant='ghost'
      onClick={() => onCollapsedChange(!collapsed)}
    >
      {collapsed ? (
        <IconPlaceholder
          lucide='UnfoldHorizontalIcon'
          tabler='IconArrowsHorizontal'
          hugeicons='ArrowExpandIcon'
          phosphor='ArrowsOutLineHorizontalIcon'
          remixicon='RiExpandLeftRightLine'
        />
      ) : (
        <IconPlaceholder
          lucide='FoldHorizontalIcon'
          tabler='IconArrowsMinimize'
          hugeicons='ArrowShrinkIcon'
          phosphor='ArrowsInLineHorizontalIcon'
          remixicon='RiContractLeftRightLine'
        />
      )}
    </Button>
  )
  const columnClassName =
    'bg-muted/50 flex shrink-0 snap-start flex-col rounded-xl transition-[background-color,box-shadow] data-over:bg-muted data-over:ring-2 data-over:ring-primary/25 data-blocked:ring-2 data-blocked:ring-red-500/40'

  if (collapsed) {
    return (
      <section
        aria-labelledby={headingId}
        data-kanban-column={column.id}
        data-collapsed=''
        data-over={isOver ? '' : undefined}
        data-blocked={target?.blocked ? '' : undefined}
        className={cn(columnClassName, 'w-11 items-center gap-3 px-1 py-2', className)}
      >
        {toggle}
        <KanbanCount count={count} itemName={itemName} limit={column.wipLimit} />
        <h3
          id={headingId}
          className='flex items-center gap-2 text-sm font-medium whitespace-nowrap [writing-mode:vertical-rl]'
        >
          {dot}
          {column.title}
        </h3>
      </section>
    )
  }

  return (
    <section
      aria-labelledby={headingId}
      data-kanban-column={column.id}
      data-over={isOver ? '' : undefined}
      data-blocked={target?.blocked ? '' : undefined}
      className={cn(
        columnClassName,
        'w-72 max-w-[calc(100cqw-2.5rem)] gap-2 p-2',
        className,
      )}
    >
      <div className='flex min-h-7 items-center gap-2 pl-1.5'>
        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <h3
            id={headingId}
            className='flex min-w-0 items-center gap-2 text-sm font-medium'
          >
            {dot}
            <span className='truncate'>{column.title}</span>
          </h3>
          {summary && (
            <div className='text-muted-foreground text-xs tabular-nums'>{summary}</div>
          )}
        </div>
        <KanbanCount count={count} itemName={itemName} limit={column.wipLimit} />
        {(action || toggle) && (
          <div className='-my-1 flex shrink-0 items-center'>
            {action}
            {toggle}
          </div>
        )}
      </div>
      {target?.blocked && (
        <p aria-hidden className='px-1.5 text-xs text-red-700 dark:text-red-400'>
          At its limit of {column.wipLimit}
        </p>
      )}
      {count > 0 ? (
        <ul aria-labelledby={headingId} className='flex flex-col gap-2'>
          {children}
        </ul>
      ) : (
        <div
          data-kanban-indicator={isOver ? '' : undefined}
          className={cn(
            'text-muted-foreground border-foreground/15 flex min-h-20 items-center justify-center rounded-lg border border-dashed px-3 py-4 text-center text-xs transition-colors',
            isOver && 'border-primary/60 bg-primary/5',
          )}
        >
          {empty ?? `No ${itemName.other}`}
        </div>
      )}
      {footer}
    </section>
  )
}

/** The line where a dragged card will land, in the gap above or below a card. */
function DropIndicator({ edge, over }: { edge: 'after' | 'before'; over: boolean }) {
  return (
    <span
      aria-hidden
      data-kanban-indicator=''
      className={cn(
        'pointer-events-none absolute inset-x-0 z-10 h-0.5 rounded-full',
        edge === 'before' ? '-top-[5px]' : '-bottom-[5px]',
        over ? 'bg-red-500' : 'bg-primary',
      )}
    />
  )
}

interface KanbanCardProps {
  /** The card's content. Include a `KanbanCardTitle`: it's what picks the card up. */
  children: ReactNode
  className?: string
  item: KanbanItem
}

/**
 * A card that drags from anywhere on it. Buttons and links inside it work on
 * their own and don't start a drag.
 */
function KanbanCard({ children, className, item }: KanbanCardProps) {
  const { drag, exceedsLimit: exceeds, items, onPointerDown } = useKanban()
  const lifted = drag?.id === item.id ? drag.mode : undefined
  const target = drag?.target
  let edge: 'after' | 'before' | undefined
  let over = false
  if (
    drag &&
    target &&
    !target.blocked &&
    !lifted &&
    target.column === item.column &&
    !isSameTarget(target, drag.origin)
  ) {
    const siblings = getColumnItems(items, item.column, drag.id)
    const index = siblings.findIndex((sibling) => sibling.id === item.id)
    if (target.index === index) edge = 'before'
    else if (target.index === siblings.length && index === siblings.length - 1)
      edge = 'after'
    over = exceeds(drag.id, item.column)
  }

  return (
    <li data-kanban-card={item.id} data-lifted={lifted} className='relative'>
      {edge === 'before' && <DropIndicator edge='before' over={over} />}
      <KanbanCardContext.Provider value={item}>
        <div
          onPointerDown={(event) => onPointerDown(event, item.id)}
          className={cn(
            'bg-card text-card-foreground relative flex cursor-grab flex-col gap-2.5 rounded-lg p-3 text-sm shadow-xs ring-1 ring-foreground/10 transition-[box-shadow,translate,scale] select-none [-webkit-touch-callout:none]',
            lifted === 'pointer' &&
              'pointer-events-none z-30 scale-[1.02] shadow-lg transition-none',
            lifted === 'keyboard' && '-translate-y-0.5 shadow-md ring-2 ring-primary',
            !lifted &&
              'has-[[data-kanban-handle]:focus-visible]:ring-3 has-[[data-kanban-handle]:focus-visible]:ring-ring/50',
            className,
          )}
        >
          {children}
        </div>
      </KanbanCardContext.Provider>
      {lifted === 'pointer' && (
        <span
          aria-hidden
          className='border-foreground/15 absolute inset-0 rounded-lg border-2 border-dashed'
        />
      )}
      {edge === 'after' && <DropIndicator edge='after' over={over} />}
    </li>
  )
}

/**
 * The card's title, as the button keyboard and screen reader users move the
 * card with: Space or Enter picks it up. Every card needs one.
 */
function KanbanCardTitle({
  children,
  className,
}: {
  /** @default the item's `title` */
  children?: ReactNode
  className?: string
}) {
  const item = useKanbanCard()
  const { instructionsId, onHandleBlur, onHandleClick, onHandleKeyDown, registerHandle } =
    useKanban()
  return (
    <p className={cn('leading-snug font-medium', className)}>
      <button
        ref={(element) => registerHandle(item.id, element)}
        type='button'
        data-kanban-handle=''
        aria-describedby={instructionsId}
        onBlur={() => onHandleBlur(item.id)}
        onClick={(event) => onHandleClick(event, item.id)}
        onKeyDown={(event) => onHandleKeyDown(event, item.id)}
        className='cursor-grab text-left outline-none'
      >
        {children ?? item.title}
      </button>
    </p>
  )
}

/** A menu that moves the card to another column, or up and down its own. Works with touch and screen readers. */
function KanbanCardMenu({ className }: { className?: string }) {
  const item = useKanbanCard()
  const { canDrop: canMoveTo, columns, items, moveFromMenu } = useKanban()
  const siblings = getColumnItems(items, item.column)
  const index = siblings.findIndex((sibling) => sibling.id === item.id)
  return (
    <DropdownMenuTrigger>
      <Button
        aria-label={`Move ${item.title}`}
        className={cn('text-muted-foreground', className)}
        size='icon-xs'
        variant='ghost'
      >
        <IconPlaceholder
          lucide='EllipsisIcon'
          tabler='IconDots'
          hugeicons='MoreHorizontalCircle01Icon'
          phosphor='DotsThreeOutlineIcon'
          remixicon='RiMoreLine'
        />
      </Button>
      <DropdownMenu placement='bottom end' className='w-auto min-w-44'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {columns
            .filter((column) => column.id !== item.column)
            .map((column) => {
              const full = !canMoveTo(item.id, column.id)
              return (
                <DropdownMenuItem
                  key={column.id}
                  id={`column-${column.id}`}
                  isDisabled={full}
                  textValue={column.title}
                  onAction={() => moveFromMenu(item.id, column.id, 0)}
                >
                  {column.title}
                  {full && (
                    <span className='text-muted-foreground ml-auto pl-4 text-xs'>
                      Full
                    </span>
                  )}
                </DropdownMenuItem>
              )
            })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          id='up'
          isDisabled={index <= 0}
          onAction={() => moveFromMenu(item.id, item.column, index - 1)}
        >
          Move up
        </DropdownMenuItem>
        <DropdownMenuItem
          id='down'
          isDisabled={index === siblings.length - 1}
          onAction={() => moveFromMenu(item.id, item.column, index + 1)}
        >
          Move down
        </DropdownMenuItem>
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

interface KanbanLabelDef {
  name: string
  /** @default 'neutral' */
  tone?: ActivityTone
}

/** Tinted labels in a row that wraps. */
function KanbanLabels({
  className,
  labels,
}: {
  className?: string
  labels: KanbanLabelDef[]
}) {
  return (
    <ul aria-label='Labels' className={cn('flex flex-wrap gap-1', className)}>
      {labels.map((label) => (
        <li
          key={label.name}
          className={cn(
            'rounded-md px-1.5 py-0.5 text-xs font-medium',
            activityToneClasses[label.tone ?? 'neutral'],
          )}
        >
          {label.name}
        </li>
      ))}
    </ul>
  )
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const listFormat = new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' })

/** Assignees' initials in overlapping avatars, with "+2" past `max`. */
function KanbanAssignees({
  className,
  max = 3,
  names,
}: {
  className?: string
  /** @default 3 */
  max?: number
  names: string[]
}) {
  if (names.length === 0) return null
  const shown = names.length > max ? names.slice(0, max - 1) : names
  const rest = names.length - shown.length
  return (
    <span className={cn('inline-flex', className)}>
      <AvatarGroup aria-hidden className='-space-x-1 *:data-[slot=avatar]:ring-card'>
        {shown.map((name) => (
          <Avatar key={name} size='sm' title={name}>
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        ))}
        {rest > 0 && <AvatarGroupCount className='ring-card'>+{rest}</AvatarGroupCount>}
      </AvatarGroup>
      <span className='sr-only'>Assigned to {listFormat.format(names)}</span>
    </span>
  )
}

/**
 * A due date named relative to `now`: "Today", "Tomorrow", "Yesterday" or "Sep 28",
 * red once overdue, amber today and within `soonDays`.
 */
function KanbanDueDate({
  className,
  date,
  done = false,
  now,
  soonDays = 2,
  timeZone = 'UTC',
}: {
  className?: string
  date: Date
  /** Shows the date without urgency, such as for finished work. */
  done?: boolean
  /** Pass a fixed date, so the label renders the same on the server and in the browser. */
  now: Date
  /** @default 2 */
  soonDays?: number
  /** @default 'UTC' */
  timeZone?: string
}) {
  const offset = getDayOffset(date, now, timeZone)
  const label =
    offset === 0
      ? 'Today'
      : offset === 1
        ? 'Tomorrow'
        : offset === -1
          ? 'Yesterday'
          : formatDay(getDay(date, timeZone), { day: 'numeric', month: 'short' })
  const urgency = done ? 'later' : getUrgency(date, now, timeZone, soonDays)
  return (
    <span className={cn('inline-flex', className)}>
      <span className='sr-only'>Due </span>
      <UrgencyBadge urgency={urgency} label={label} />
      {urgency === 'overdue' && <span className='sr-only'>, overdue</span>}
    </span>
  )
}

type KanbanPriorityLevel = 'high' | 'low' | 'medium' | 'urgent'

const priorityConfig: Record<
  KanbanPriorityLevel,
  { className: string; icon: ReactNode; label: string }
> = {
  high: {
    className: 'text-amber-700 dark:text-amber-400',
    icon: (
      <IconPlaceholder
        lucide='ChevronUpIcon'
        tabler='IconChevronUp'
        hugeicons='ArrowUp01Icon'
        phosphor='CaretUpIcon'
        remixicon='RiArrowUpSLine'
        aria-hidden
      />
    ),
    label: 'High',
  },
  low: {
    className: 'text-muted-foreground',
    icon: (
      <IconPlaceholder
        lucide='ChevronDownIcon'
        tabler='IconChevronDown'
        hugeicons='ArrowDown01Icon'
        phosphor='CaretDownIcon'
        remixicon='RiArrowDownSLine'
        aria-hidden
      />
    ),
    label: 'Low',
  },
  medium: {
    className: 'text-muted-foreground',
    icon: (
      <IconPlaceholder
        lucide='MinusIcon'
        tabler='IconMinus'
        hugeicons='MinusSignIcon'
        phosphor='MinusIcon'
        remixicon='RiSubtractLine'
        aria-hidden
      />
    ),
    label: 'Medium',
  },
  urgent: {
    className: 'text-red-700 dark:text-red-400',
    icon: (
      <IconPlaceholder
        lucide='ChevronsUpIcon'
        tabler='IconChevronsUp'
        hugeicons='ArrowUpDoubleIcon'
        phosphor='CaretDoubleUpIcon'
        remixicon='RiArrowUpDoubleLine'
        aria-hidden
      />
    ),
    label: 'Urgent',
  },
}

/** A priority icon, with its name beside it or for screen readers only. */
function KanbanPriority({
  className,
  priority,
  showLabel = false,
}: {
  className?: string
  priority: KanbanPriorityLevel
  showLabel?: boolean
}) {
  const config = priorityConfig[priority]
  return (
    <span
      title={showLabel ? undefined : `${config.label} priority`}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium [&_svg]:size-4 [&_svg]:shrink-0',
        config.className,
        className,
      )}
    >
      {config.icon}
      <span className={cn(!showLabel && 'sr-only')}>
        {config.label}
        <span className='sr-only'> priority</span>
      </span>
    </span>
  )
}

/** A small icon and number, such as comments or attachments. `label` is read instead of the number. */
function KanbanCardStat({
  className,
  icon,
  label,
  value,
}: {
  className?: string
  icon: ReactNode
  /** The whole stat for screen readers, such as "3 comments". */
  label: string
  value: ReactNode
}) {
  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1 text-xs tabular-nums [&_svg]:size-3.5 [&_svg]:shrink-0',
        className,
      )}
    >
      {icon}
      <span aria-hidden>{value}</span>
      <span className='sr-only'>{label}</span>
    </span>
  )
}

/** Comment count with a speech bubble. */
function KanbanComments({ className, count }: { className?: string; count: number }) {
  return (
    <KanbanCardStat
      className={className}
      icon={
        <IconPlaceholder
          lucide='MessageSquareIcon'
          tabler='IconMessage'
          hugeicons='MessageIcon'
          phosphor='ChatCircleIcon'
          remixicon='RiChat1Line'
          aria-hidden
        />
      }
      label={`${count} ${count === 1 ? 'comment' : 'comments'}`}
      value={count}
    />
  )
}

/** Attachment count with a paperclip. */
function KanbanAttachments({ className, count }: { className?: string; count: number }) {
  return (
    <KanbanCardStat
      className={className}
      icon={
        <IconPlaceholder
          lucide='PaperclipIcon'
          tabler='IconPaperclip'
          hugeicons='Attachment01Icon'
          phosphor='PaperclipIcon'
          remixicon='RiAttachment2'
          aria-hidden
        />
      }
      label={`${count} ${count === 1 ? 'attachment' : 'attachments'}`}
      value={count}
    />
  )
}

/** Subtasks done out of the total, "3/5", turning green when all are done. */
function KanbanSubtasks({
  className,
  done,
  total,
}: {
  className?: string
  done: number
  total: number
}) {
  return (
    <KanbanCardStat
      className={cn(
        done === total &&
          'rounded-md bg-emerald-500/10 px-1 text-emerald-700 dark:text-emerald-400',
        className,
      )}
      icon={
        <IconPlaceholder
          lucide='ListChecksIcon'
          tabler='IconListCheck'
          hugeicons='CheckListIcon'
          phosphor='ListChecksIcon'
          remixicon='RiListCheck3'
          aria-hidden
        />
      }
      label={`${done} of ${total} subtasks done`}
      value={`${done}/${total}`}
    />
  )
}

interface KanbanAddCardProps {
  className?: string
  /** @default 'Add card' */
  label?: string
  /** Called with the trimmed title. The form stays open to add another. */
  onAdd: (title: string) => void
  /** @default 'Title' */
  placeholder?: string
}

/** An "Add card" button that opens a one-line form in place. Escape closes it. */
function KanbanAddCard({
  className,
  label = 'Add card',
  onAdd,
  placeholder = 'Title',
}: KanbanAddCardProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  // Move focus into the form when it opens and back to the button when it closes.
  useEffect(() => {
    if (open) inputRef.current?.focus()
    else if (wasOpen.current) buttonRef.current?.focus()
    wasOpen.current = open
  }, [open])

  function close() {
    setOpen(false)
    setValue('')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = value.trim()
    if (!title) return
    onAdd(title)
    setValue('')
    setStatus(`Added ${title}`)
  }

  if (!open) {
    return (
      <Button
        ref={buttonRef}
        variant='ghost'
        size='sm'
        className={cn('text-muted-foreground justify-start', className)}
        onClick={() => setOpen(true)}
      >
        <IconPlaceholder
          lucide='PlusIcon'
          tabler='IconPlus'
          hugeicons='PlusSignIcon'
          phosphor='PlusIcon'
          remixicon='RiAddLine'
        />
        {label}
      </Button>
    )
  }

  return (
    <form onSubmit={submit} className={cn('flex flex-col gap-2', className)}>
      <Input
        ref={inputRef}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return
          event.preventDefault()
          close()
        }}
        className='bg-card'
      />
      <p role='status' className='sr-only'>
        {status}
      </p>
      <div className='flex items-center gap-2'>
        <Button type='submit' size='sm' isDisabled={!value.trim()}>
          {label}
        </Button>
        <Button type='button' variant='ghost' size='sm' onClick={close}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export {
  KanbanAddCard,
  KanbanAssignees,
  KanbanAttachments,
  KanbanBoard,
  KanbanCard,
  KanbanCardMenu,
  KanbanCardStat,
  KanbanCardTitle,
  KanbanColumn,
  KanbanComments,
  KanbanCount,
  KanbanDueDate,
  KanbanLabels,
  KanbanPriority,
  KanbanSubtasks,
  getColumnItems,
  moveItem,
}

export type {
  KanbanAddCardProps,
  KanbanBoardProps,
  KanbanCardProps,
  KanbanColumnDef,
  KanbanColumnProps,
  KanbanItem,
  KanbanItemName,
  KanbanLabelDef,
  KanbanPriorityLevel,
  KanbanWipLimitMode,
}
