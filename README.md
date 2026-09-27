# Dashboardblocks

Dashboardblocks is a collection of high-quality dashboard components built on top of [shadcn/ui](https://ui.shadcn.com). Install only what you need, customize everything, and own your code.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/store-dark.png">
  <img alt="Store dashboard built from Dashboardblocks: stats with sparklines, revenue chart, revenue by channel, top products and a checkout funnel" src=".github/assets/store-light.png">
</picture>

## Installation

Install any block with the shadcn CLI:

```bash
npx shadcn@latest add https://dashboardblocks.com/r/kpi-01.json
```

Or install a full dashboard:

```bash
npx shadcn@latest add https://dashboardblocks.com/r/dashboard-01.json
```

### Use the registry namespace

Add the registry to your `components.json`. The `{style}` placeholder picks the right build for your component library (Base UI, Radix UI or React Aria):

```json
{
  "registries": {
    "@dashboardblocks": "https://dashboardblocks.com/r/{style}/{name}.json"
  }
}
```

Then install blocks by name:

```bash
npx shadcn@latest add @dashboardblocks/kpi-01
```

Blocks work with every shadcn/create style and icon library. See [Compatibility](https://dashboardblocks.com/docs/compatibility).

## Documentation

Visit https://dashboardblocks.com/docs to browse all blocks and view the documentation.

## License

Licensed under the [MIT license](https://github.com/LGLabGreg/dashboardblocks/blob/main/LICENSE.md).
