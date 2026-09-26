# Project instructions

## Attribution

- Do not add a "Generated with Claude Code" footer or a Claude session link to pull request descriptions.
- Do not add `Co-Authored-By: Claude …` or `Claude-Session: …` trailers to commit messages.
- The GitHub tool appends that footer when it creates a pull request. Right after creating one, read the description back and update it to remove the footer.

## Registry blocks

Every block must install unchanged into any shadcn/create project: any style, Base UI, Radix UI or React Aria, and any of the five icon libraries. See `content/docs/compatibility.mdx`.

### Icons

- Never import from `lucide-react` (or any icon package) in `registry/`. Use `IconPlaceholder` from `@/registry/icons/icon-placeholder`, naming the icon in all five libraries:
  `<IconPlaceholder lucide='CheckIcon' tabler='IconCheck' hugeicons='Tick02Icon' phosphor='CheckIcon' remixicon='RiCheckLine' />`
- Reuse names already in the registry, or shadcn's own (`https://ui.shadcn.com/r/styles/base-vega/<item>.json`). `scripts/generate-icons.ts` fails the build if a library is missing or a name doesn't exist.
- Icons in data or props are elements (`icon: React.ReactNode`), never component references. Size them from the parent with `[&_svg]:size-4`.
- Don't list icon packages in `dependencies`; the user's project already has one.

### Component libraries

- Write blocks against Base UI, the components in `components/ui`. That source is published as-is for Base UI, and `scripts/build-bases.ts` derives the other two:
  - Radix UI: `render={<Button />}` becomes `asChild`, and `closeOnClick` is dropped. Nothing to do.
  - React Aria: `Tabs`, `Switch` and `Button` props are renamed automatically. Dropdown menus can't be converted: a file that uses them needs a hand-written override at `registry/bases/aria/<same path under registry/>`.
- Keep menus in primitives (such as `FilterMenu` and `AddFilterMenu` in `dashboard-header.tsx`) so examples don't need their own override.
- Overrides start with `// Override of <path> for React Aria` and `// source-hash: <hash>`. When the build says the source changed, port the change to the override, then set the hash it prints.
- Don't wrap a `Switch` in a `<label>` (React Aria's switch is a label). Name it with `aria-label` or `aria-labelledby`.

### Code that works in any project

- Use `import type { … }` for type-only imports. Vite projects use `verbatimModuleSyntax`, and oxlint enforces this in `registry/**/*.tsx`.
- No Node-only types such as `NodeJS.Timeout`; use `ReturnType<typeof setTimeout>`.
- Don't restyle the shape of shadcn primitives (padding, radius, height). Leave that to the user's style.
- In `registry.ts`, list shadcn components by name and dashboardblocks items with `registryUrl()`.

### Checks

- `pnpm registry:build` regenerates icons and the `/r/{base}/` copies, and fails on missing icon names or stale overrides.
- `pnpm registry:verify` installs every block with the shadcn CLI into Base UI, Radix and React Aria projects, then type-checks and builds them. It needs network and takes a few minutes. CI runs it on every pull request.
