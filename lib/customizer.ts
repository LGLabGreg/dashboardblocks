/**
 * Options mirrored from https://ui.shadcn.com/create. Blocks are written once and
 * adapt to whichever combination a project was initialised with.
 */

export const STYLES = [
  { value: 'vega', label: 'Vega' },
  { value: 'nova', label: 'Nova' },
  { value: 'maia', label: 'Maia' },
  { value: 'lyra', label: 'Lyra' },
  { value: 'mira', label: 'Mira' },
  { value: 'luma', label: 'Luma' },
  { value: 'sera', label: 'Sera' },
  { value: 'rhea', label: 'Rhea' },
] as const

export const BASES = [
  { value: 'base', label: 'Base UI' },
  { value: 'radix', label: 'Radix UI' },
  { value: 'aria', label: 'React Aria' },
] as const

export const ICON_LIBRARIES = [
  { value: 'lucide', label: 'Lucide' },
  { value: 'tabler', label: 'Tabler Icons' },
  { value: 'hugeicons', label: 'HugeIcons' },
  { value: 'phosphor', label: 'Phosphor Icons' },
  { value: 'remixicon', label: 'Remix Icon' },
] as const

export const RADII = [
  { value: 'default', label: 'Default', css: null },
  { value: 'none', label: 'None', css: '0' },
  { value: 'small', label: 'Small', css: '0.45rem' },
  { value: 'large', label: 'Large', css: '0.875rem' },
] as const

export type Style = (typeof STYLES)[number]['value']
export type Base = (typeof BASES)[number]['value']
export type IconLibrary = (typeof ICON_LIBRARIES)[number]['value']
export type Radius = (typeof RADII)[number]['value']

export interface CustomizerConfig {
  base: Base
  iconLibrary: IconLibrary
  radius: Radius
  style: Style
}

export const DEFAULT_CONFIG: CustomizerConfig = {
  base: 'base',
  iconLibrary: 'lucide',
  radius: 'default',
  style: 'vega',
}

export const CUSTOMIZER_STORAGE_KEY = 'dashboardblocks-config'

export function parseConfig(value: unknown): CustomizerConfig {
  const input = (typeof value === 'object' && value !== null ? value : {}) as Record<
    string,
    unknown
  >
  const pick = <T extends string>(
    options: ReadonlyArray<{ value: T }>,
    candidate: unknown,
    fallback: T,
  ): T => options.find((option) => option.value === candidate)?.value ?? fallback

  return {
    base: pick(BASES, input.base, DEFAULT_CONFIG.base),
    iconLibrary: pick(ICON_LIBRARIES, input.iconLibrary, DEFAULT_CONFIG.iconLibrary),
    radius: pick(RADII, input.radius, DEFAULT_CONFIG.radius),
    style: pick(STYLES, input.style, DEFAULT_CONFIG.style),
  }
}

/** Applies the style and radius to <html>. Kept in sync with the inline boot script. */
export function applyConfigToDocument(config: CustomizerConfig) {
  const root = document.documentElement
  for (const style of STYLES) root.classList.remove(`style-${style.value}`)
  root.classList.add(`style-${config.style}`)
  const radius = RADII.find((option) => option.value === config.radius)?.css
  if (radius) root.style.setProperty('--radius', radius)
  else root.style.removeProperty('--radius')
}

/**
 * Runs before hydration so the saved style and radius apply on first paint.
 * Serialised into a <script> tag, so it only uses its arguments.
 */
function bootCustomizer(
  storageKey: string,
  styles: string[],
  radii: Record<string, string>,
  fallback: string,
) {
  const root = document.documentElement
  let saved: { radius?: string; style?: string } = {}
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
  } catch {}
  const style = saved.style && styles.includes(saved.style) ? saved.style : fallback
  for (const name of styles) root.classList.remove(`style-${name}`)
  root.classList.add(`style-${style}`)
  if (saved.radius && radii[saved.radius])
    root.style.setProperty('--radius', radii[saved.radius])
}

export const customizerBootScript = `(${bootCustomizer.toString()})(${[
  CUSTOMIZER_STORAGE_KEY,
  STYLES.map((style) => style.value),
  Object.fromEntries(
    RADII.flatMap((radius) => (radius.css ? [[radius.value, radius.css]] : [])),
  ),
  DEFAULT_CONFIG.style,
]
  .map((value) => JSON.stringify(value))
  .join(',')})`

/** The registry URL for an item, built for the selected component library. */
export function registryItemUrl(name: string, base: Base) {
  return `https://dashboardblocks.com/r/${base}/${name}.json`
}
