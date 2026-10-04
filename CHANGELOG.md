# dashboardblocks

## 1.3.0

### Minor Changes

- 8f9db26: Blocks use colour the same way everywhere. Data and categories take your theme's chart colours, starting at `--chart-2`, the 500 shade in shadcn/create's ramps (`--chart-1`, the lightest, comes last; previous periods stay grey). Progress KPI 02's segments, the liquid usage meters, Files 03's storage breakdown, team avatars, leaderboard ranks, the accent activity tone and anomaly insights now use chart colours instead of fixed Tailwind hues, and file kind icons share one muted tint. Heatmap and retention cells stop at 70% of their colour, so their numbers stay readable with any chart colour. Calendar chips show times and locations in a stronger grey, so they stay readable on every tint. Status keeps fixed colours, with `green` replaced by `emerald` and text shades made the same across blocks.
  
  Breaking: `fileKindConfig` no longer has `color` or `soft`, and charts that defaulted to `var(--chart-1)` now default to `var(--chart-2)`.

## 1.2.2

### Patch Changes

- 3c98315: Blocks carry fewer comments: those that only restated the code are gone, and the rest explain browser and library behaviour or mark what to replace with your own data. Data table columns take a new `hideLabelWhenStacked` meta option, for a column of row actions that shouldn't be labelled when the table stacks.

## 1.2.1

### Patch Changes

- 507116f: Forms move focus to the first invalid field on the page after a failed submit: `useSimpleForm` used the order of its values, and the auth, settings and team invite forms left focus on the button. An empty field's error now waits for submit instead of appearing on blur, and so does any field's when you're clicking the submit button: the error moved the button and lost the click. Errors render before focus moves, so screen readers read the field with its error. Submit buttons in the AI assistant and comment composers, the record activity comment box and the kanban add card form stay enabled while empty, and the API keys form shows an error when the key has no name. Fixes for narrow cards and small screens: Inline Edit fields, the waffle breakdown and the chart panel tabs fit a 280px card, data table pagination and integration actions wrap, integration names no longer sit under their status, the page header back link and the usage wave stay inside their card, and the model table and retention grid no longer scroll the page sideways.

## 1.2.0

### Minor Changes

- [#125](https://github.com/LGLabGreg/dashboardblocks/pull/125) [`91eb3df`](https://github.com/LGLabGreg/dashboardblocks/commit/91eb3dfdc72175b1a17e9e0cd5df05c7bc80dd65) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Add a CRM example dashboard with sales stats, open pipeline, monthly bookings, lead conversion, a quarter forecast by rep, deal activity and stuck deals. Widen the value axis in the chart panels so labels of 100K and up aren't clipped, and keep the highlighted bar's label inside narrow cards

- [#127](https://github.com/LGLabGreg/dashboardblocks/pull/127) [`1571748`](https://github.com/LGLabGreg/dashboardblocks/commit/1571748a194fc679b077f44d20ea0915d2fbf6f4) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Add a DevOps example dashboard with live throughput, delivery performance, response time percentiles, open alerts, uptime, build health and recent deployments

- [#128](https://github.com/LGLabGreg/dashboardblocks/pull/128) [`98e2e63`](https://github.com/LGLabGreg/dashboardblocks/commit/98e2e63af4f5f898dc6dbb87ec3ce040dd23563e) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Add `LinkProvider`, which makes the links in the App Shell, Page Header, Notifications and Onboarding blocks render your router's link, for client-side navigation. Links stay plain anchors without it. The mobile sidebar and the notifications panel close when one of their links is followed. The app shell's user menu no longer shows an empty group between two separators when it has no links.

## 1.1.1

### Patch Changes

- [#119](https://github.com/LGLabGreg/dashboardblocks/pull/119) [`d978eb8`](https://github.com/LGLabGreg/dashboardblocks/commit/d978eb8f0060df59db24d740607233b2f8f43571) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - feat: add profile, roles and permissions, share, change plan, two-factor and SSO blocks

- [#121](https://github.com/LGLabGreg/dashboardblocks/pull/121) [`1ea72d7`](https://github.com/LGLabGreg/dashboardblocks/commit/1ea72d79eb0dee7ce6b30490474fa2895619fb9d) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - feat: add error pages and auth families

## 1.1.0

### Minor Changes

- [#114](https://github.com/LGLabGreg/dashboardblocks/pull/114) [`4dbf6d6`](https://github.com/LGLabGreg/dashboardblocks/commit/4dbf6d6c9fc51c3dc1ce6d9ffc7bb18a01f810a1) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - feat: add app shell family

- [#113](https://github.com/LGLabGreg/dashboardblocks/pull/113) [`764e281`](https://github.com/LGLabGreg/dashboardblocks/commit/764e281d48ef70a202ad0388c3b7a94f3b94af0c) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Data Table is now built on TanStack Table v9. `useDataTable` and `DataTableContent` add sorting (with multi-sort), search, facet filters with counts, pagination with page sizes, row selection with a selection bar for bulk actions, and column visibility, laid out from each column's `meta`. New example: Full Featured.
  
  Breaking: `useTableSort` and `DataTableSortHead` are removed, and `DataTableSortMenu` and `DataTablePagination` now take a `table` from `useDataTable`. The layout primitives (`DataTable`, `DataTableRow`, `DataTableCell`…) are unchanged.

- [#115](https://github.com/LGLabGreg/dashboardblocks/pull/115) [`b925377`](https://github.com/LGLabGreg/dashboardblocks/commit/b925377814d46edcdf581d3f246bc24a3389c209) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - feat: add forms family

- [#109](https://github.com/LGLabGreg/dashboardblocks/pull/109) [`a561644`](https://github.com/LGLabGreg/dashboardblocks/commit/a56164433708054cd9398880297dd4280ba11bc6) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - The `@dashboardblocks` registry URL now resolves for projects using the `new-york-v4` style.

- [#112](https://github.com/LGLabGreg/dashboardblocks/pull/112) [`eea543b`](https://github.com/LGLabGreg/dashboardblocks/commit/eea543b5bfaffb0eb3beebf5c4a9d507be0f8809) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - feat: add settings family

- [#116](https://github.com/LGLabGreg/dashboardblocks/pull/116) [`c6972f5`](https://github.com/LGLabGreg/dashboardblocks/commit/c6972f5020bd86389d880ab9361326183b79d35e) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - feat: add page header, record detail, notifications and command menu families

- [#117](https://github.com/LGLabGreg/dashboardblocks/pull/117) [`2b2f692`](https://github.com/LGLabGreg/dashboardblocks/commit/2b2f692ee47684b6756301e904e4d1c379182209) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - feat: add kanban, comments, calendar, files, AI assistant, invoice and onboarding families

## 1.0.0

### Major Changes

- [#108](https://github.com/LGLabGreg/dashboardblocks/pull/108) [`0b36c69`](https://github.com/LGLabGreg/dashboardblocks/commit/0b36c69329f92ec75b944310b02ce115fba3d26f) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Dashboardblocks 1.0: dashboard blocks for any shadcn/ui project, in every style, with Base UI, Radix UI or React Aria, and any of the five icon libraries. From 1.0, renaming or removing a block, or changing its props in a way that breaks existing code, is a major release.

### Minor Changes

- [#104](https://github.com/LGLabGreg/dashboardblocks/pull/104) [`c9034ca`](https://github.com/LGLabGreg/dashboardblocks/commit/c9034cacaf1aa93434c8f0d9fcda8168ce277357) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Refresh KPI, Usage Meter and Activity Feed: changes computed from the previous value, usage statuses with icons and labels, projections and overage, day-grouped activity, record history, notifications and a weekly digest

- [#106](https://github.com/LGLabGreg/dashboardblocks/pull/106) [`80cf33a`](https://github.com/LGLabGreg/dashboardblocks/commit/80cf33adeb03e57721dd072350f19c1aec7aa098) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Add a web analytics example dashboard, and extend the store dashboard with month-to-date revenue and low stock and the SaaS dashboard with MRR by region, MRR movement and retention milestones

### Patch Changes

- [#106](https://github.com/LGLabGreg/dashboardblocks/pull/106) [`9d4bf0e`](https://github.com/LGLabGreg/dashboardblocks/commit/9d4bf0e4dbed3e903ac46061cf0cff884ccc1a6a) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Chart Panel Breakdown Donut: place the legend beside the donut based on the card's width rather than the viewport, so it no longer overflows narrow cards

## 0.11.0

### Minor Changes

- [#103](https://github.com/LGLabGreg/dashboardblocks/pull/103) [`27980df`](https://github.com/LGLabGreg/dashboardblocks/commit/27980dfa96ce2e3f31071766e21f5fb1b246935a) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: AI Usage

- [#99](https://github.com/LGLabGreg/dashboardblocks/pull/99) [`600e1c3`](https://github.com/LGLabGreg/dashboardblocks/commit/600e1c36a19dd294768cb7a8877b5fa024a92c8d) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Deployments

- [#93](https://github.com/LGLabGreg/dashboardblocks/pull/93) [`2d769c5`](https://github.com/LGLabGreg/dashboardblocks/commit/2d769c5b9c4e91a0d91230e91866dd1e9b3346aa) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Distribution

- [#89](https://github.com/LGLabGreg/dashboardblocks/pull/89) [`9edf71b`](https://github.com/LGLabGreg/dashboardblocks/commit/9edf71be64f4240f9dd5b083f272787365ba9bf4) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Blocks now install into any shadcn/ui project: every style, Base UI, Radix UI or React Aria, and Lucide, Tabler, HugeIcons, Phosphor or Remix Icon. Add a customizer to preview blocks with your setup.

- [#98](https://github.com/LGLabGreg/dashboardblocks/pull/98) [`74aeac0`](https://github.com/LGLabGreg/dashboardblocks/commit/74aeac0625239773d08e813898d04b34129a82b0) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Feedback

- [#95](https://github.com/LGLabGreg/dashboardblocks/pull/95) [`e13c555`](https://github.com/LGLabGreg/dashboardblocks/commit/e13c555918e8683adf6eba89745b56cf02cd2edf) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Flow

- [#102](https://github.com/LGLabGreg/dashboardblocks/pull/102) [`ec8caad`](https://github.com/LGLabGreg/dashboardblocks/commit/ec8caadf58183c947bf1b0ed67dacd55742d3361) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Inventory

- [#97](https://github.com/LGLabGreg/dashboardblocks/pull/97) [`33783c2`](https://github.com/LGLabGreg/dashboardblocks/commit/33783c21d18b226c3c85c5df05f7e516ddad8008) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Realtime

- [#92](https://github.com/LGLabGreg/dashboardblocks/pull/92) [`500936c`](https://github.com/LGLabGreg/dashboardblocks/commit/500936cecaaa9c076c4fac9bab336371f22728d4) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Retention

- [#100](https://github.com/LGLabGreg/dashboardblocks/pull/100) [`5a8fa15`](https://github.com/LGLabGreg/dashboardblocks/commit/5a8fa15552e913ab25f88110f726cfd5e658c09b) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Scatter

- [#101](https://github.com/LGLabGreg/dashboardblocks/pull/101) [`8a3f27e`](https://github.com/LGLabGreg/dashboardblocks/commit/8a3f27e32ac0e7f167c6ce527eeb4f28c39de0fd) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Security

- [#94](https://github.com/LGLabGreg/dashboardblocks/pull/94) [`a08c1f6`](https://github.com/LGLabGreg/dashboardblocks/commit/a08c1f6dce31a2b2708326cd409c301958364d0a) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Spend

- [#96](https://github.com/LGLabGreg/dashboardblocks/pull/96) [`12f8e87`](https://github.com/LGLabGreg/dashboardblocks/commit/12f8e876e8c84d62594e598da27140ac4a72c59f) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Timeline

## 0.10.0

### Minor Changes

- [#83](https://github.com/LGLabGreg/dashboardblocks/pull/83) [`7b203a7`](https://github.com/LGLabGreg/dashboardblocks/commit/7b203a7fb1443435e9241a4fc1014625f8326160) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Billing

- [#84](https://github.com/LGLabGreg/dashboardblocks/pull/84) [`230c055`](https://github.com/LGLabGreg/dashboardblocks/commit/230c05504a3b01a54c4d5b281a76f4fe44c4ed48) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Checklist

- [#85](https://github.com/LGLabGreg/dashboardblocks/pull/85) [`9a70f12`](https://github.com/LGLabGreg/dashboardblocks/commit/9a70f126410beb41fe6152ffbc1a1ec2c95563f6) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Forecast

- [#85](https://github.com/LGLabGreg/dashboardblocks/pull/85) [`ba5d944`](https://github.com/LGLabGreg/dashboardblocks/commit/ba5d944613b7c2d0096d00e71e6bb3df23299dfd) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Gauge

- [#83](https://github.com/LGLabGreg/dashboardblocks/pull/83) [`f853be7`](https://github.com/LGLabGreg/dashboardblocks/commit/f853be74f886f242a49bdcb509fb6af2d660827f) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Geo

- [#83](https://github.com/LGLabGreg/dashboardblocks/pull/83) [`305718a`](https://github.com/LGLabGreg/dashboardblocks/commit/305718a40c2416d6a755b01dae2927a77aa8190f) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Insights

- [#85](https://github.com/LGLabGreg/dashboardblocks/pull/85) [`78fe805`](https://github.com/LGLabGreg/dashboardblocks/commit/78fe805bdd7b212470bbca8750d034baf1049e2c) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Metric List

- [#84](https://github.com/LGLabGreg/dashboardblocks/pull/84) [`9d5270d`](https://github.com/LGLabGreg/dashboardblocks/commit/9d5270d083550a0a629bf1763c2154da85627d4e) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Pipeline

- [#84](https://github.com/LGLabGreg/dashboardblocks/pull/84) [`0f60d7e`](https://github.com/LGLabGreg/dashboardblocks/commit/0f60d7ec2dab71fd51c8350c2a039eeb5d2722f1) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Schedule

- [#84](https://github.com/LGLabGreg/dashboardblocks/pull/84) [`26d27aa`](https://github.com/LGLabGreg/dashboardblocks/commit/26d27aa222e51a9c2d02323e1f820d1d2e1e9354) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Team

## 0.9.0

### Minor Changes

- [#82](https://github.com/LGLabGreg/dashboardblocks/pull/82) [`a19c7e9`](https://github.com/LGLabGreg/dashboardblocks/commit/a19c7e9cd5296f21c6e3b5dd801c15ef911f1a5e) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Alerts

- [#78](https://github.com/LGLabGreg/dashboardblocks/pull/78) [`4555081`](https://github.com/LGLabGreg/dashboardblocks/commit/4555081f9c9ec973c1526d04e2f9815a3bedee87) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New components: Breakdown and Funnel

- [#76](https://github.com/LGLabGreg/dashboardblocks/pull/76) [`c887402`](https://github.com/LGLabGreg/dashboardblocks/commit/c8874021f45cd87ca3d8fa75ff02d3d6dc07e202) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Chart Panel

- [#82](https://github.com/LGLabGreg/dashboardblocks/pull/82) [`c1c170a`](https://github.com/LGLabGreg/dashboardblocks/commit/c1c170ada31fc7a7a093095295e3001eef1e36df) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Comparison

- [#81](https://github.com/LGLabGreg/dashboardblocks/pull/81) [`f79eab8`](https://github.com/LGLabGreg/dashboardblocks/commit/f79eab80878e0284592fd40383244521382b0b68) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New dashboard examples (store and SaaS) built from the blocks, and a `showPrevious` option for Chart Panel 01

- [#81](https://github.com/LGLabGreg/dashboardblocks/pull/81) [`288b7f9`](https://github.com/LGLabGreg/dashboardblocks/commit/288b7f968462d0d9659066249d0da5f26a943919) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Data Table

- [#82](https://github.com/LGLabGreg/dashboardblocks/pull/82) [`a67f25e`](https://github.com/LGLabGreg/dashboardblocks/commit/a67f25e2f247149d42a7d9bad93ab8b3cad22bfa) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Goals

- [#81](https://github.com/LGLabGreg/dashboardblocks/pull/81) [`aec422c`](https://github.com/LGLabGreg/dashboardblocks/commit/aec422ce1dab89dac6954c992f08d136b76b9d71) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Heatmap

- [#80](https://github.com/LGLabGreg/dashboardblocks/pull/80) [`0273faa`](https://github.com/LGLabGreg/dashboardblocks/commit/0273faa08193dab0847aa1b0fc58261950bf0a33) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New components: Stat Group and Dashboard Header

- [#81](https://github.com/LGLabGreg/dashboardblocks/pull/81) [`f774aee`](https://github.com/LGLabGreg/dashboardblocks/commit/f774aee6f96e37337456d00de931aabef1efd0d2) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: States (loading, refreshing, empty and error)

- [#79](https://github.com/LGLabGreg/dashboardblocks/pull/79) [`dac90b0`](https://github.com/LGLabGreg/dashboardblocks/commit/dac90b03febec67020436b3f1328e181fb0710a3) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Status

### Patch Changes

- [#80](https://github.com/LGLabGreg/dashboardblocks/pull/80) [`4546e59`](https://github.com/LGLabGreg/dashboardblocks/commit/4546e597bf2350ec832be7c45a05f847c8e4cd23) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Chart Panel: the screen-reader data table no longer widens the page on narrow screens

- [#82](https://github.com/LGLabGreg/dashboardblocks/pull/82) [`a19c7e9`](https://github.com/LGLabGreg/dashboardblocks/commit/a19c7e9cd5296f21c6e3b5dd801c15ef911f1a5e) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Data Table: vertical padding for cells that wrap onto several lines

- [#82](https://github.com/LGLabGreg/dashboardblocks/pull/82) [`a67f25e`](https://github.com/LGLabGreg/dashboardblocks/commit/a67f25e2f247149d42a7d9bad93ab8b3cad22bfa) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Ring: respect reduced motion when the ring fills

- [#81](https://github.com/LGLabGreg/dashboardblocks/pull/81) [`da0f458`](https://github.com/LGLabGreg/dashboardblocks/commit/da0f4583679f778537e4838c42a08e46d6d21b28) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Trend, Leaderboard and Usage Meter: darker change and status text so small figures meet WCAG AA contrast

## 0.8.0

### Minor Changes

- [#73](https://github.com/LGLabGreg/dashboardblocks/pull/73) [`c97c901`](https://github.com/LGLabGreg/dashboardblocks/commit/c97c9016ce0b74da7fef9033d72fab3a402e6a8b) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Leaderboard

### Patch Changes

- [#72](https://github.com/LGLabGreg/dashboardblocks/pull/72) [`f5f8339`](https://github.com/LGLabGreg/dashboardblocks/commit/f5f8339ca5af1541c277229cd48b89594f81662f) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Polish dashboard components: animated numbers retarget from the current value when data changes, usage-meter-08 gauge reflects real usage, liquid gauges use theme-aware colors, bars and rings share the count-up easing, chart tooltips no longer slide and use theme-aware cursors, trend badges drop their border, and secondary numbers render statically

- [#72](https://github.com/LGLabGreg/dashboardblocks/pull/72) [`f5f8339`](https://github.com/LGLabGreg/dashboardblocks/commit/f5f8339ca5af1541c277229cd48b89594f81662f) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Migrate docs site to shadcn Base UI (base-vega) and make blocks work with both Radix and Base UI shadcn setups: drop `asChild` from activity-feed-04, use `gap` instead of `space-y` on card content, and mark trailing button icons with `data-icon`

## 0.7.1

### Patch Changes

- [#69](https://github.com/LGLabGreg/dashboardblocks/pull/69) [`dc77c5f`](https://github.com/LGLabGreg/dashboardblocks/commit/dc77c5f66100308bd68ba1d28464fe843c440463) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Polish dashboard components: fix invalid ring/segment colors, dark mode status tints, progress easing, and icon sizing

## 0.7.0

### Minor Changes

- [#31](https://github.com/LGLabGreg/dashboardblocks/pull/31) [`1cf07ac`](https://github.com/LGLabGreg/dashboardblocks/commit/1cf07ac961e91c5fd2562f6dc79b7f0fa430cb9a) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Improve KPIs

## 0.6.0

### Minor Changes

- [#28](https://github.com/LGLabGreg/dashboardblocks/pull/28) [`c3a6958`](https://github.com/LGLabGreg/dashboardblocks/commit/c3a69583f15d5cde468e08bab3318d1c77f82ca4) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Animated Number

## 0.5.0

### Minor Changes

- [#26](https://github.com/LGLabGreg/dashboardblocks/pull/26) [`f40c7f8`](https://github.com/LGLabGreg/dashboardblocks/commit/f40c7f87f7d11e01b9661a714c7369300dc015e9) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Usage Meter

## 0.4.1

### Patch Changes

- [#24](https://github.com/LGLabGreg/dashboardblocks/pull/24) [`d852314`](https://github.com/LGLabGreg/dashboardblocks/commit/d852314fe2b893a5bd5b9733ff4013e8c78047f5) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Remove console.log

## 0.4.0

### Minor Changes

- [#22](https://github.com/LGLabGreg/dashboardblocks/pull/22) [`423789d`](https://github.com/LGLabGreg/dashboardblocks/commit/423789d10464cb364f3b2b29534bc070feb05d5d) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: Activity Feed

## 0.3.2

### Patch Changes

- [#20](https://github.com/LGLabGreg/dashboardblocks/pull/20) [`35d3311`](https://github.com/LGLabGreg/dashboardblocks/commit/35d3311ead6bde0c14518653254d07b46d6a3668) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Improve preview toolbar

## 0.3.1

### Patch Changes

- [#18](https://github.com/LGLabGreg/dashboardblocks/pull/18) [`f3dbea8`](https://github.com/LGLabGreg/dashboardblocks/commit/f3dbea8a0259ab91053751d470bc6f4f04e920d9) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Fix preview + circular dep

## 0.3.0

### Minor Changes

- [#16](https://github.com/LGLabGreg/dashboardblocks/pull/16) [`4468665`](https://github.com/LGLabGreg/dashboardblocks/commit/446866513aafb9faeb1d4f691f7a4ce6ef12a23c) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Refactor registry structure

## 0.2.0

### Minor Changes

- [#14](https://github.com/LGLabGreg/dashboardblocks/pull/14) [`f2eade4`](https://github.com/LGLabGreg/dashboardblocks/commit/f2eade43cbea4fb2b96ca51c84a8b1744ddf780a) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - New component: KPIAreaChart

## 0.1.0

### Minor Changes

- [#12](https://github.com/LGLabGreg/dashboardblocks/pull/12) [`323bd4f`](https://github.com/LGLabGreg/dashboardblocks/commit/323bd4f69719f863a3a93334087ac087c8b15a78) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Add KPI components

## 0.0.2

### Patch Changes

- [#9](https://github.com/LGLabGreg/dashboardblocks/pull/9) [`0cf33cd`](https://github.com/LGLabGreg/dashboardblocks/commit/0cf33cdfc2004434b7afa2a10e2fb80233107ed8) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Fix registry

## 0.0.1

### Patch Changes

- [#3](https://github.com/LGLabGreg/dashboardblocks/pull/3) [`eb8f223`](https://github.com/LGLabGreg/dashboardblocks/commit/eb8f223b5e5f2baefde49fcd3e2baf16c83e1596) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Initial release

- [#4](https://github.com/LGLabGreg/dashboardblocks/pull/4) [`73b9238`](https://github.com/LGLabGreg/dashboardblocks/commit/73b92385409171a64f7aee94370e7836f22d59d0) Thanks [@LGLabGreg](https://github.com/LGLabGreg)! - Initial release
