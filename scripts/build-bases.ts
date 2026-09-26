/**
 * Writes a copy of the built registry for each component library under
 * public/r/{base}/. Base UI is the source of truth; Radix UI and React Aria
 * copies are derived with the transforms in ./lib/bases.ts, or taken from a
 * hand-written override in registry/bases/{base}/ when a block needs one.
 *
 * Overrides start with a header naming the hash of the Base UI file they were
 * written against, so the build fails when the source changes under them.
 */
import { execFileSync } from 'child_process'
import { createHash } from 'crypto'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs'
import { tmpdir } from 'os'
import { dirname, join, resolve } from 'path'

import { REGISTRY_BASE_URL } from '@/lib/config'

import { type Base, BASES, transformForBase } from './lib/bases'

interface RegistryFile {
  content?: string
  path: string
}

interface RegistryItem {
  files?: RegistryFile[]
  registryDependencies?: string[]
}

const root = process.cwd()
const outputDir = resolve(root, 'public/r')
const itemPrefix = `${REGISTRY_BASE_URL}/r/`
const HEADER = /^\/\/ Override of (\S+) for [^\n]+\n\/\/ source-hash: (\w+)\n\n?/

export function hashSource(source: string) {
  return createHash('sha256').update(source).digest('hex').slice(0, 12)
}

function readOverride(base: Base, path: string, source: string) {
  const overridePath = resolve(
    root,
    'registry/bases',
    base,
    path.replace(/^registry\//, ''),
  )
  if (!existsSync(overridePath)) return null
  const content = readFileSync(overridePath, 'utf8')
  const header = HEADER.exec(content)
  const hash = hashSource(source)
  if (!header || header[1] !== path) {
    throw new Error(
      `${overridePath} must start with:\n// Override of ${path} for ${base}\n// source-hash: ${hash}`,
    )
  }
  if (header[2] !== hash) {
    throw new Error(
      `${path} changed since its ${base} override was written. Port the change to ` +
        `registry/bases/${base}/${path.replace(/^registry\//, '')}, then set its source-hash to ${hash}.`,
    )
  }
  return content.slice(header[0].length)
}

function withBase(dependency: string, base: Base) {
  return dependency.startsWith(itemPrefix)
    ? `${itemPrefix}${base}/${dependency.slice(itemPrefix.length)}`
    : dependency
}

/** Formats generated sources with the repo's formatter, so they read like the originals. */
function format(sources: Map<string, string>) {
  if (sources.size === 0) return sources
  const dir = mkdtempSync(join(tmpdir(), 'dashboardblocks-'))
  try {
    const paths = [...sources.keys()]
    paths.forEach((path, index) =>
      writeFileSync(join(dir, `${index}.tsx`), sources.get(path)!),
    )
    execFileSync(
      resolve(root, 'node_modules/.bin/oxfmt'),
      ['--config', resolve(root, '.oxfmtrc.json'), dir],
      {
        stdio: 'pipe',
      },
    )
    return new Map(
      paths.map((path, index) => [path, readFileSync(join(dir, `${index}.tsx`), 'utf8')]),
    )
  } finally {
    rmSync(dir, { force: true, recursive: true })
  }
}

// Only items in the registry: public/r can hold files from items since removed.
const registry = JSON.parse(readFileSync(resolve(root, 'registry.json'), 'utf8')) as {
  items: { name: string }[]
}
const itemFiles = ['registry.json', ...registry.items.map((item) => `${item.name}.json`)]
const items = new Map(
  itemFiles.map((file) => [
    file,
    JSON.parse(readFileSync(join(outputDir, file), 'utf8')) as RegistryItem,
  ]),
)

for (const base of BASES) {
  const baseDir = join(outputDir, base)
  rmSync(baseDir, { force: true, recursive: true })
  mkdirSync(baseDir, { recursive: true })

  const generated = new Map<string, string>()
  const outputs = new Map<string, RegistryItem>()

  for (const [file, item] of items) {
    const copy = structuredClone(item) as RegistryItem & { items?: RegistryItem[] }
    for (const entry of [copy, ...(copy.items ?? [])]) {
      entry.registryDependencies = entry.registryDependencies?.map((dependency) =>
        withBase(dependency, base),
      )
      for (const registryFile of entry.files ?? []) {
        if (registryFile.content === undefined || !registryFile.path.endsWith('.tsx'))
          continue
        const override = readOverride(base, registryFile.path, registryFile.content)
        if (override !== null) {
          registryFile.content = override
          continue
        }
        const content = transformForBase(registryFile.content, base, registryFile.path)
        if (content !== registryFile.content) {
          generated.set(registryFile.path, content)
          registryFile.content = content
        }
      }
    }
    outputs.set(file, copy)
  }

  const formatted = format(generated)
  for (const [file, item] of outputs) {
    for (const registryFile of item.files ?? []) {
      registryFile.content = formatted.get(registryFile.path) ?? registryFile.content
    }
    const target = join(baseDir, file)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, `${JSON.stringify(item, null, 2)}\n`)
  }

  // oxlint-disable-next-line no-console
  console.log(
    `✓ Built ${outputs.size} items for ${base} (${generated.size} files transformed)`,
  )
}
