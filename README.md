# Dashboardblocks

Dashboardblocks is a collection of high-quality dashboard components built on top of [shadcn/ui](https://ui.shadcn.com). Install only what you need, customize everything, and own your code.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/store-dark.png">
  <img alt="Store dashboard built from Dashboardblocks: stats with sparklines, revenue chart, revenue by channel, top products and a checkout funnel" src=".github/assets/store-light.png">
</picture>

## Installation

Install any block with the shadcn CLI:

```bash
npx shadcn@latest add @dashboardblocks/kpi-01
```

Or install a full dashboard:

```bash
npx shadcn@latest add @dashboardblocks/dashboard-01
```

`@dashboardblocks` is listed in the [shadcn registry directory](https://ui.shadcn.com/docs/directory), so there's nothing to set up. The CLI picks the build for your component library (Base UI, Radix UI or React Aria), and blocks work with every shadcn/create style and icon library. See [Compatibility](https://www.dashboardblocks.com/docs/compatibility).

## Documentation

Visit https://www.dashboardblocks.com/docs to browse all blocks and view the documentation.

## Issues and contributions

Report bugs and request blocks in [Issues](https://github.com/LGLabGreg/dashboardblocks/issues).

The public repository, [LGLabGreg/dashboardblocks](https://github.com/LGLabGreg/dashboardblocks), holds the free registry: the block source and the built files in `public/r`. It's published automatically from a private repository on each release, so pull requests can't be merged there. Accepted changes are ported by hand. Releases are listed in [CHANGELOG.md](./CHANGELOG.md).

The docs site's source used to be in the public repository too. It moved out on the first sync, so a fork that merges from upstream will see it deleted. The mirrored source is for reading: installs use the built files in `public/r`, and `registry/icons/icon-placeholder.tsx` imports generated icon files that aren't published.

## License

Licensed under the [MIT license](https://github.com/LGLabGreg/dashboardblocks/blob/main/LICENSE.md).
