'use client'

import { PaletteIcon } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

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
  siteChrome,
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
 * and puts the saved config back when it moves off or the menu closes. Moving
 * between options keeps the preview until the next one applies, so it doesn't
 * flash back to the saved style in between. Options opt in with
 * `data-preview-key` and `data-preview-value`.
 */
function useHoverPreview(config: CustomizerConfig, open: boolean) {
  const saved = useRef(config)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previewing = useRef<string | null>(null)

  // A layout effect, so it runs before the cleanup below when a choice (such
  // as Reset) also closes the menu. Otherwise that cleanup puts the old config back.
  useLayoutEffect(() => {
    saved.current = config
  }, [config])

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const revert = () => {
    clear()
    if (!previewing.current) return
    previewing.current = null
    applyConfigToDocument(saved.current)
  }

  useEffect(() => {
    if (!open) return
    // What the pointer is over: an option's id, null off the options, or
    // undefined before the first move. Only a change restarts the delay.
    let hovered: string | null | undefined

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const option =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-preview-key]')
          : null
      const patch = option
        ? { [option.dataset.previewKey!]: option.dataset.previewValue }
        : null
      const id = patch && JSON.stringify(patch)
      if (id === hovered) return
      hovered = id
      clear()
      if (id === previewing.current) return
      timer.current = setTimeout(() => {
        previewing.current = id
        applyConfigToDocument({ ...saved.current, ...patch })
      }, PREVIEW_DELAY)
    }

    document.addEventListener('pointermove', onPointerMove)
    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      revert()
    }
  }, [open])

  return revert
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
  const [open, setOpen] = useState(false)
  const revertPreview = useHoverPreview(config, open)

  return (
    <DropdownMenu onOpenChange={setOpen}>
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
      <DropdownMenuContent align='start' {...siteChrome('w-80 min-w-(--anchor-width)')}>
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
              <DropdownMenuSubContent {...siteChrome('min-w-52')}>
                <DropdownMenuRadioGroup
                  value={config[setting.key]}
                  onValueChange={(value) => {
                    revertPreview()
                    setConfig({
                      [setting.key]: value,
                    } as Partial<CustomizerConfig>)
                  }}
                >
                  {setting.options.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      {...(setting.preview && {
                        'data-preview-key': setting.key,
                        'data-preview-value': option.value,
                      })}
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
