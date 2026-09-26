import { type IconLibrary } from './customizer'

/**
 * Mirrors what the shadcn CLI does to a block's source on install, so the code
 * shown on the site matches what lands in the user's project.
 */

const ICON_LIBRARY_KEYS = [
  'lucide',
  'tabler',
  'hugeicons',
  'phosphor',
  'remixicon',
] as const

const ICON_PACKAGES: Record<IconLibrary, string> = {
  hugeicons: '@hugeicons/core-free-icons',
  lucide: 'lucide-react',
  phosphor: '@phosphor-icons/react',
  remixicon: '@remixicon/react',
  tabler: '@tabler/icons-react',
}

/** Extra props the CLI gives each library's icons, unless the usage sets them. */
const ICON_DEFAULT_PROPS: Partial<Record<IconLibrary, string[]>> = {
  hugeicons: ['strokeWidth={2}'],
}

interface JsxAttribute {
  name: string | null
  text: string
  value: string | null
}

/** Splits the attributes of a self-closing JSX tag, keeping each one's source text. */
function parseAttributes(source: string): JsxAttribute[] {
  const attributes: JsxAttribute[] = []
  let index = 0
  const skipSpace = () => {
    while (index < source.length && /\s/.test(source[index])) index++
  }
  const readBraces = () => {
    const start = index
    let depth = 0
    do {
      if (source[index] === '{') depth++
      else if (source[index] === '}') depth--
      index++
    } while (depth > 0 && index < source.length)
    return source.slice(start, index)
  }

  skipSpace()
  while (index < source.length) {
    if (source[index] === '{') {
      const text = readBraces()
      attributes.push({ name: null, text, value: null })
    } else {
      const start = index
      while (index < source.length && /[\w:-]/.test(source[index])) index++
      const name = source.slice(start, index)
      let value: string | null = null
      if (source[index] === '=') {
        index++
        if (source[index] === '{') {
          value = readBraces()
        } else {
          const quote = source[index]
          const end = source.indexOf(quote, index + 1)
          value = source.slice(index, end + 1)
          index = end + 1
        }
      }
      if (!name) break
      attributes.push({ name, text: source.slice(start, index), value })
    }
    skipSpace()
  }
  return attributes
}

function unquote(value: string | null) {
  return value?.replace(/^['"{]|['"}]$/g, '') ?? ''
}

export function transformIcons(source: string, library: IconLibrary) {
  const used = new Set<string>()

  const code = source.replace(
    /^([ \t]*)(.*?)<IconPlaceholder\b([\s\S]*?)\/>/gm,
    (_match, indent: string, before: string, body: string) => {
      const attributes = parseAttributes(body)
      const icon = unquote(
        attributes.find((item) => item.name === library)?.value ?? null,
      )
      used.add(icon)
      const rest = attributes.filter(
        (item) => !ICON_LIBRARY_KEYS.includes(item.name as IconLibrary),
      )
      const names = new Set(rest.map((item) => item.name))
      const defaults = (ICON_DEFAULT_PROPS[library] ?? []).filter(
        (prop) => !names.has(prop.slice(0, prop.indexOf('='))),
      )
      const [tag, props] =
        library === 'hugeicons'
          ? [
              'HugeiconsIcon',
              [`icon={${icon}}`, ...defaults, ...rest.map((item) => item.text)],
            ]
          : [icon, [...defaults, ...rest.map((item) => item.text)]]

      const multiline = body.includes('\n')
      if (!multiline || props.length === 0) {
        return `${indent}${before}<${tag}${props.map((prop) => ` ${prop}`).join('')} />`
      }
      const propIndent = `${indent}${' '.repeat(before.length)}  `
      return `${indent}${before}<${tag}\n${props.map((prop) => `${propIndent}${prop}`).join('\n')}\n${indent}${' '.repeat(before.length)}/>`
    },
  )

  if (used.size === 0) return source

  const imports = [
    ...(library === 'hugeicons'
      ? ["import { HugeiconsIcon } from '@hugeicons/react'"]
      : []),
    `import { ${[...used].join(', ')} } from '${ICON_PACKAGES[library]}'`,
  ].join('\n')

  return code.replace(
    /^import \{ IconPlaceholder \} from '[^']*icon-placeholder'$/m,
    imports,
  )
}

/** The code as it appears in a project: registry paths become component paths. */
export function toProjectCode(source: string, library: IconLibrary) {
  return transformIcons(source, library).replaceAll('registry/components/', 'components/')
}
