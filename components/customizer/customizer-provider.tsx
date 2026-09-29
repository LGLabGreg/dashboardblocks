'use client'

import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'

import {
  applyConfigToDocument,
  CUSTOMIZER_STORAGE_KEY,
  type CustomizerConfig,
  DEFAULT_CONFIG,
  parseConfig,
} from '@/lib/customizer'

interface CustomizerContextValue {
  /** The saved choice. */
  config: CustomizerConfig
  /** The saved choice with any option previewed on hover, which blocks render with. */
  previewConfig: CustomizerConfig
  reset: () => void
  setConfig: (patch: Partial<CustomizerConfig>) => void
  /** Shows an option without saving it. Pass null to go back to the saved choice. */
  setPreview: (patch: Partial<CustomizerConfig> | null) => void
}

const CustomizerContext = createContext<CustomizerContextValue | null>(null)

/** Site chrome renders with the saved choice, so it doesn't change on hover. */
const SavedConfigContext = createContext(false)

function readStoredConfig(): CustomizerConfig {
  try {
    return parseConfig(JSON.parse(localStorage.getItem(CUSTOMIZER_STORAGE_KEY) ?? '{}'))
  } catch {
    return DEFAULT_CONFIG
  }
}

export function CustomizerProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<CustomizerConfig>(DEFAULT_CONFIG)
  const [preview, setPreviewState] = useState<Partial<CustomizerConfig> | null>(null)

  // The boot script applies the saved style before paint. Apply it again once
  // mounted: if React re-renders <html> (for example after a hydration mismatch
  // caused by an injected toolbar), it drops the classes the script added.
  useEffect(() => {
    const stored = readStoredConfig()
    applyConfigToDocument(stored)
    // oxlint-disable-next-line react-hooks-js/set-state-in-effect
    setConfigState(stored)

    // Keep other tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CUSTOMIZER_STORAGE_KEY) return
      const next = readStoredConfig()
      applyConfigToDocument(next)
      setConfigState(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setConfig = useCallback((patch: Partial<CustomizerConfig>) => {
    setPreviewState(null)
    setConfigState((current) => {
      const next = { ...current, ...patch }
      try {
        localStorage.setItem(CUSTOMIZER_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage can be unavailable (private mode); the choice still applies.
      }
      applyConfigToDocument(next)
      return next
    })
  }, [])

  const reset = useCallback(() => setConfig(DEFAULT_CONFIG), [setConfig])

  const setPreview = useCallback(
    (patch: Partial<CustomizerConfig> | null) => {
      setPreviewState(patch)
      applyConfigToDocument({ ...config, ...patch })
    },
    [config],
  )

  const value = useMemo(
    () => ({
      config,
      previewConfig: preview ? { ...config, ...preview } : config,
      reset,
      setConfig,
      setPreview,
    }),
    [config, preview, reset, setConfig, setPreview],
  )

  return <CustomizerContext value={value}>{children}</CustomizerContext>
}

export function useCustomizer() {
  const context = use(CustomizerContext)
  if (!context) throw new Error('useCustomizer must be used within CustomizerProvider')
  return context
}

/** Renders its children with the saved choice, ignoring hover previews. */
export function SavedCustomizerConfig({ children }: { children: React.ReactNode }) {
  return <SavedConfigContext value>{children}</SavedConfigContext>
}

/** The saved choice, for code that shouldn't follow hover previews. */
export function useSavedCustomizerConfig(): CustomizerConfig {
  return use(CustomizerContext)?.config ?? DEFAULT_CONFIG
}

/**
 * The config to render with, including an option previewed on hover. Falls back
 * to defaults outside the provider, e.g. in isolated renders.
 */
export function useCustomizerConfig(): CustomizerConfig {
  const context = use(CustomizerContext)
  const saved = use(SavedConfigContext)
  if (!context) return DEFAULT_CONFIG
  return saved ? context.config : context.previewConfig
}
