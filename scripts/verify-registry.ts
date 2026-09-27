/**
 * Installs every registry item into fresh shadcn projects, one per component
 * library, and type-checks and builds them. This is what a user gets from
 * `npx shadcn add`, so it catches blocks that only work with Base UI or Lucide.
 *
 *   pnpm registry:verify                      # base, radix and aria
 *   pnpm registry:verify --base aria --icons phosphor --style lyra
 *
 * Needs network access for the shadcn CLI and npm. Run `pnpm registry:build` first.
 */
import { spawn } from 'child_process'
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'fs'
import { createServer } from 'http'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { encodePreset, type PresetConfig } from 'shadcn/preset'
import { parseArgs } from 'util'

import { REGISTRY_BASE_URL } from '@/lib/config'

const MATRIX: {
  base: string
  iconLibrary: PresetConfig['iconLibrary']
  style: PresetConfig['style']
}[] = [
  { base: 'base', iconLibrary: 'phosphor', style: 'nova' },
  { base: 'radix', iconLibrary: 'tabler', style: 'lyra' },
  { base: 'aria', iconLibrary: 'hugeicons', style: 'maia' },
]

const { values } = parseArgs({
  options: {
    base: { type: 'string' },
    icons: { type: 'string' },
    keep: { type: 'boolean', default: false },
    style: { type: 'string' },
  },
})

const root = process.cwd()
const registryDir = resolve(root, 'public/r')
const port = 4873 + Math.floor(Math.random() * 1000)
const localUrl = `http://localhost:${port}`

// Serves public/r, pointing registry dependencies at this server.
const server = createServer((request, response) => {
  const path = resolve(
    registryDir,
    `.${decodeURIComponent(request.url ?? '').replace(/^\/r/, '')}`,
  )
  if (!path.startsWith(registryDir) || !existsSync(path)) {
    response.writeHead(404).end()
    return
  }
  const body = readFileSync(path, 'utf8').replaceAll(
    `${REGISTRY_BASE_URL}/r/`,
    `${localUrl}/r/`,
  )
  response.writeHead(200, { 'content-type': 'application/json' }).end(body)
})

// Async, so the registry server above keeps answering while the CLI runs.
function run(command: string, args: string[], cwd: string) {
  // oxlint-disable-next-line no-console
  console.log(`$ ${command} ${args.join(' ').slice(0, 160)}`)
  return new Promise<void>((done, fail) => {
    spawn(command, args, {
      cwd,
      env: { ...process.env, CI: '1' },
      stdio: ['ignore', 'inherit', 'inherit'],
    })
      .on('error', fail)
      .on('exit', (code) =>
        code === 0 ? done() : fail(new Error(`${command} exited with ${code}`)),
      )
  })
}

/**
 * Works around bugs in shadcn's own components that fail the type check in a
 * fresh project whatever blocks are installed. Each fix is exact, so it stops
 * applying (and should be removed) once shadcn ships the fix.
 */
function patchUpstream(cwd: string) {
  // React Aria's label imports React without using it, which fails noUnusedLocals.
  const label = join(cwd, 'src/components/ui/label.tsx')
  if (existsSync(label)) {
    const source = readFileSync(label, 'utf8')
    if (
      /import \* as React from ['"]react['"]/.test(source) &&
      !source.includes('React.')
    ) {
      writeFileSync(label, source.replace(/import \* as React from ['"]react['"]\n/, ''))
      // oxlint-disable-next-line no-console
      console.log('  patched shadcn label.tsx: unused React import')
    }
  }
}

async function verify(
  base: string,
  iconLibrary: PresetConfig['iconLibrary'],
  style: PresetConfig['style'],
) {
  const dir = mkdtempSync(join(tmpdir(), `verify-${base}-`))
  const preset = encodePreset({ iconLibrary, style })
  const name = 'app'
  await run(
    'npx',
    [
      'shadcn@latest',
      'init',
      '--template',
      'vite',
      '--base',
      base,
      '--preset',
      preset,
      '--name',
      name,
      '--no-monorepo',
      '-y',
    ],
    dir,
  )
  const cwd = join(dir, name)

  const items = readdirSync(join(registryDir, base))
    .filter((file) => file.endsWith('.json') && file !== 'registry.json')
    .map((file) => `${localUrl}/r/${base}/${file}`)
  await run('npx', ['shadcn@latest', 'add', ...items, '--yes', '--overwrite'], cwd)

  patchUpstream(cwd)
  copyFileSync(resolve(root, 'scripts/verify/App.tsx'), join(cwd, 'src/App.tsx'))
  await run('npx', ['tsc', '-b'], cwd)
  await run('npx', ['vite', 'build'], cwd)
  // oxlint-disable-next-line no-console
  console.log(
    `✓ ${base} / ${style} / ${iconLibrary}: ${items.length} items install, type-check and build`,
  )
  if (values.keep) {
    // oxlint-disable-next-line no-console
    console.log(`  kept at ${cwd}`)
  } else {
    rmSync(dir, { force: true, recursive: true })
  }
}

async function main() {
  await new Promise<void>((done) => server.listen(port, done))
  try {
    const matrix = values.base
      ? [
          {
            base: values.base,
            iconLibrary: (values.icons ?? 'lucide') as PresetConfig['iconLibrary'],
            style: (values.style ?? 'vega') as PresetConfig['style'],
          },
        ]
      : MATRIX
    for (const { base, iconLibrary, style } of matrix)
      await verify(base, iconLibrary, style)
  } finally {
    server.close()
  }
}

main().catch((error: unknown) => {
  // oxlint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
