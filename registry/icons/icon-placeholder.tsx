'use client'

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { useEffect, useState } from 'react'

import {
  useCustomizerConfig,
  useSavedCustomizerConfig,
} from '@/components/customizer/customizer-provider'

import type { IconLibrary } from '@/lib/customizer'

import * as lucide from './generated/lucide'

type IconPlaceholderProps = Record<IconLibrary, string> &
  Omit<React.ComponentProps<'svg'>, 'ref'>

type IconModule = Record<string, unknown>

const loaders: Record<Exclude<IconLibrary, 'lucide'>, () => Promise<IconModule>> = {
  hugeicons: () => import('./generated/hugeicons'),
  phosphor: () => import('./generated/phosphor'),
  remixicon: () => import('./generated/remixicon'),
  tabler: () => import('./generated/tabler'),
}

const loaded: Partial<Record<IconLibrary, IconModule>> = { lucide }
const pending: Partial<Record<IconLibrary, Promise<IconModule>>> = {}

function loadLibrary(library: Exclude<IconLibrary, 'lucide'>) {
  pending[library] ??= loaders[library]().then((module) => (loaded[library] = module))
  return pending[library]
}

function useIconModule(library: IconLibrary, savedLibrary: IconLibrary) {
  const [, setVersion] = useState(0)
  useEffect(() => {
    if (library === 'lucide' || loaded[library]) return
    let active = true
    void loadLibrary(library).then(() => active && setVersion((version) => version + 1))
    return () => {
      active = false
    }
  }, [library])
  if (loaded[library]) return library
  return loaded[savedLibrary] ? savedLibrary : 'lucide'
}

function IconPlaceholder({
  hugeicons,
  lucide: lucideName,
  phosphor,
  remixicon,
  tabler,
  ...props
}: IconPlaceholderProps) {
  const { iconLibrary } = useCustomizerConfig()
  const library = useIconModule(iconLibrary, useSavedCustomizerConfig().iconLibrary)
  const names: Record<IconLibrary, string> = {
    hugeicons,
    lucide: lucideName,
    phosphor,
    remixicon,
    tabler,
  }
  const icon = loaded[library]?.[names[library]]

  if (!icon) return null

  if (library === 'hugeicons') {
    const { strokeWidth, ...rest } = props
    return (
      <HugeiconsIcon
        icon={icon as IconSvgElement}
        strokeWidth={Number(strokeWidth ?? 2)}
        {...rest}
      />
    )
  }

  const Icon = icon as React.ComponentType<Omit<React.ComponentProps<'svg'>, 'ref'>>
  return <Icon {...props} />
}

export { IconPlaceholder }
