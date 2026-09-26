'use client'

import { PaletteIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
}[] = [
  { key: 'style', label: 'Style', options: STYLES },
  { key: 'base', label: 'Component library', options: BASES },
  { key: 'iconLibrary', label: 'Icon library', options: ICON_LIBRARIES },
  { key: 'radius', label: 'Radius', options: RADII },
]

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            size='sm'
            className={cn('gap-1.5', className)}
            aria-label={`Customize preview: ${style}, ${labelFor(SETTINGS[1], config.base)}, ${labelFor(SETTINGS[2], config.iconLibrary)}`}
          />
        }
      >
        <PaletteIcon />
        {compact ? style : `Customize · ${style}`}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Preview with your setup</DropdownMenuLabel>
          {SETTINGS.map((setting) => (
            <DropdownMenuSub key={setting.key}>
              <DropdownMenuSubTrigger>
                <span className='flex flex-1 items-center justify-between gap-3'>
                  {setting.label}
                  <span className='text-muted-foreground'>
                    {labelFor(setting, config[setting.key])}
                  </span>
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className='min-w-44'>
                <DropdownMenuRadioGroup
                  value={config[setting.key]}
                  onValueChange={(value) =>
                    setConfig({ [setting.key]: value } as Partial<CustomizerConfig>)
                  }
                >
                  {setting.options.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
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
