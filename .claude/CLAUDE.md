# Project instructions

## Attribution

- Do not add a "Generated with Claude Code" footer or a Claude session link to pull request descriptions.
- Do not add `Co-Authored-By: Claude …` or `Claude-Session: …` trailers to commit messages.
- The GitHub tool appends that footer when it creates a pull request. Right after creating one, read the description back and update it to remove the footer.

## Fresh-eyes verification (cloud agents)

When you run in the cloud (`CLAUDE_CODE_REMOTE=true`, as in Claude Code on the web), have a subagent verify every change before you finish. It checks the code and how the result looks and behaves, not just the diff.

When the work is done and your own checks pass, launch one subagent with none of your session's context. Run `git fetch origin main` first, then give it the branch, the base (`git diff origin/main...HEAD`) and one line on what the change is for. Ask it to report findings without editing files, each with file and line or a screenshot, and to cover:

- **Code:** bugs, edge cases (empty data, zero, one item, long text, dates at month or quarter boundaries), rules from this file and `AGENTS.md`, types, accessibility (labels, roles, focus order, state not shown by colour alone), and anything that would confuse a reader.
- **Checks:** run `pnpm lint`, `pnpm format:check`, `pnpm types:check` and `pnpm registry:build`, and report any failure. The build also regenerates `registry/icons/generated/`, which the dev server needs for new icon names, so run the build, then the UI pass, then restore what the build wrote. The restore is part of the check and the only file change allowed: `git checkout -- public/r registry.json registry/icons/generated && git clean -fdq public/r`. Afterwards `git status` should show nothing beyond what was uncommitted before the build.
- **UI:** use the dev server if one is running (check its port), or start `pnpm dev`. Open every changed page or block with Playwright: it's installed globally (load it from `$(npm root -g)/playwright`) and Chromium is preconfigured, so don't run `playwright install`. Take screenshots at 360, 768 and 1280px wide, in light and dark mode (Playwright's `colorScheme: 'dark'` switches the site's theme), and of each changed block in a narrow card as well (for example, set the card's width to 280px with `locator.evaluate`). Then use it: open menus and filters, switch tabs, trigger empty and error states, and tab through with the keyboard. Look for overflow past the card or page, clipped or overlapping text, wrapping that breaks the layout, contrast in dark mode, and console errors or hydration warnings.
- **Docs:** changed blocks have docs, links and anchors resolve, and the copy matches what the code does.

Then fix every finding you can confirm and rerun the checks. Tell the user what it found, what you fixed and, for anything you left, why. Verify again after a later round of changes to the same pull request, before the last push.

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
- Don't commit `registry.json`, `public/r/` or `registry/icons/generated/`. CI rebuilds and commits them on every pull request, and a local build writes `localhost` URLs into them.
- Look at every new or changed block before committing: at phone (360px), tablet (768px) and desktop (1280px) widths, in light and dark mode, and after using it (open panels, errors, confirmations). Blocks size to their container with `@container`, so check a narrow card as well as a narrow viewport. Nothing may overflow the card; wide tables scroll inside it.
- `pnpm registry:verify` installs every block with the shadcn CLI into Base UI, Radix and React Aria projects, then type-checks and builds them. It needs network and takes a few minutes. CI runs it on every pull request.
