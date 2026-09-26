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
  config: CustomizerConfig
  reset: () => void
  setConfig: (patch: Partial<CustomizerConfig>) => void
}

const CustomizerContext = createContext<CustomizerContextValue | null>(null)

function readStoredConfig(): CustomizerConfig {
  try {
    return parseConfig(JSON.parse(localStorage.getItem(CUSTOMIZER_STORAGE_KEY) ?? '{}'))
  } catch {
    return DEFAULT_CONFIG
  }
}

export function CustomizerProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<CustomizerConfig>(DEFAULT_CONFIG)

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

  const value = useMemo(() => ({ config, reset, setConfig }), [config, reset, setConfig])

  return <CustomizerContext value={value}>{children}</CustomizerContext>
}

export function useCustomizer() {
  const context = use(CustomizerContext)
  if (!context) throw new Error('useCustomizer must be used within CustomizerProvider')
  return context
}

/** Falls back to defaults outside the provider, e.g. in isolated renders. */
export function useCustomizerConfig(): CustomizerConfig {
  return use(CustomizerContext)?.config ?? DEFAULT_CONFIG
}
