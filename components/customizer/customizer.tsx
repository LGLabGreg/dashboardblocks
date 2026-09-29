'use client'

import { PaletteIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  applyConfigToDocument,
  BASES,
  type CustomizerConfig,
  ICON_LIBRARIES,
  RADII,
  STYLES,
} from '@/lib/customizer'
import { cn } from '@/lib/utils'

import { useCustomizer } from './customizer-provider'

const SETTINGS: {
  key: keyof CustomizerConfig
  label: string
  options: ReadonlyArray<{ label: string; value: string }>
  /** Applied to <html> alone, so it can be previewed on hover without re-rendering. */
  preview?: boolean
}[] = [
  { key: 'style', label: 'Style', options: STYLES, preview: true },
  { key: 'base', label: 'Component library', options: BASES },
  { key: 'iconLibrary', label: 'Icon library', options: ICON_LIBRARIES },
  { key: 'radius', label: 'Radius', options: RADII, preview: true },
]

const PREVIEW_DELAY = 150

/**
 * Previews an option while the pointer rests on it, like ui.shadcn.com/create,
 * and puts the saved config back when it leaves or the menu closes. Moving
 * between options keeps the preview until the next one applies, so it doesn't
 * flash back to the saved style in between.
 */
function useHoverPreview(config: CustomizerConfig) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previewing = useRef<string | null>(null)
  const pointer = useRef({ x: NaN, y: NaN })

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const schedule = (patch: Partial<CustomizerConfig> | null) => {
    clear()
    timer.current = setTimeout(() => {
      previewing.current = patch && JSON.stringify(patch)
      applyConfigToDocument({ ...config, ...patch })
    }, PREVIEW_DELAY)
  }

  const revert = () => {
    clear()
    if (!previewing.current) return
    previewing.current = null
    applyConfigToDocument(config)
  }

  // Previewing a style resizes the menu, and browsers send pointer events when
  // the layout moves under a still pointer. Only count events where the
  // pointer moved, so the preview doesn't flip back and forth on its own.
  const moved = (event: React.PointerEvent) =>
    event.pointerType === 'mouse' &&
    (event.clientX !== pointer.current.x || event.clientY !== pointer.current.y)

  useEffect(() => clear, [])

  return {
    revert,
    optionProps: (patch: Partial<CustomizerConfig>) => ({
      onPointerMove: (event: React.PointerEvent) => {
        if (!moved(event)) return
        pointer.current = { x: event.clientX, y: event.clientY }
        if (previewing.current === JSON.stringify(patch)) clear()
        else schedule(patch)
      },
      onPointerLeave: (event: React.PointerEvent) => {
        if (moved(event)) schedule(null)
      },
    }),
  }
}

function labelFor(setting: (typeof SETTINGS)[number], value: string) {
  return setting.options.find((option) => option.value === value)?.label ?? value
}

/**
 * Previews blocks with the options from https://ui.shadcn.com/create. Installed
 * blocks follow the user's components.json, so this only changes the preview
 * and which component library the install command targets.
 */
export function Customizer({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { config, reset, setConfig } = useCustomizer()
  const style = labelFor(SETTINGS[0], config.style)
  const { optionProps, revert } = useHoverPreview(config)

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) revert()
      }}
    >
      {/* Site chrome, so it keeps the same look whichever style is picked. */}
      <DropdownMenuTrigger
        className={cn(
          'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground data-popup-open:bg-fd-accent inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
          className,
        )}
        aria-label={`Customize preview: ${style}, ${labelFor(SETTINGS[1], config.base)}, ${labelFor(SETTINGS[2], config.iconLibrary)}`}
      >
        <PaletteIcon className='size-4' />
        {!compact && 'Customize'}
        <span className='bg-fd-secondary text-fd-secondary-foreground ms-auto rounded border px-1.5 py-px text-xs leading-4 font-medium'>
          {style}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-80 min-w-(--anchor-width)'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Preview with your setup</DropdownMenuLabel>
          {SETTINGS.map((setting) => (
            <DropdownMenuSub key={setting.key}>
              <DropdownMenuSubTrigger>
                <span className='flex flex-1 items-center justify-between gap-3 whitespace-nowrap'>
                  {setting.label}
                  <span className='text-muted-foreground'>
                    {labelFor(setting, config[setting.key])}
                  </span>
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className='min-w-52'>
                <DropdownMenuRadioGroup
                  value={config[setting.key]}
                  onValueChange={(value) => {
                    revert()
                    setConfig({
                      [setting.key]: value,
                    } as Partial<CustomizerConfig>)
                  }}
                >
                  {setting.options.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      {...(setting.preview
                        ? optionProps({ [setting.key]: option.value })
                        : {})}
                    >
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <p className='text-muted-foreground px-2 py-1.5 text-xs leading-relaxed'>
            Blocks install with the style, component library and icons in your
            components.json. No changes needed.
          </p>
          <DropdownMenuItem onClick={reset}>Reset</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
