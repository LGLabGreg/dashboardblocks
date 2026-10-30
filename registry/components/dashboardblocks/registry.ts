import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const components: Registry['items'] = [
  {
    name: 'activity-feed',
    type: 'registry:component',
    registryDependencies: [registryUrl('format')],
    title: 'Activity Feed',
    description:
      'Primitives for activity feeds: a list with connectors that line up with the markers, tinted icons by tone, an unread dot, relative times and "Today" and "Yesterday" day headings that take a fixed now and a time zone, and grouping by day.',
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-usage',
    type: 'registry:component',
    title: 'AI Usage',
    description:
      'Primitives for LLM usage: token cost at per-million prices with cached input billed separately, cache savings and hit rate, compact token and dollar formatting, model colours in a fixed order and an input, cached and output token bar.',
    registryDependencies: [registryUrl('format'), registryUrl('block-state')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-usage.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'alerts',
    type: 'registry:component',
    title: 'Alerts',
    description:
      'Primitives for alerts: critical, warning, info and resolved severities written as coloured words, plus relative time formatting.',
    registryDependencies: [registryUrl('status-label')],
    files: [
      {
        path: 'registry/components/dashboardblocks/alerts.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'animated-number',
    type: 'registry:component',
    title: 'Animated Number',
    description: 'An animated number component.',
    registryDependencies: [registryUrl('use-animated-number'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/animated-number.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'animated-wave',
    type: 'registry:component',
    title: 'Animated Wave',
    description: 'An animated wave component.',
    files: [
      {
        path: 'registry/components/dashboardblocks/animated-wave.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'app-shell',
    type: 'registry:component',
    title: 'App Shell',
    description:
      'Primitives for app shells built on the shadcn sidebar: navigation sections from data with active links, badges and collapsible child links, a brand link, a workspace switcher, sidebar and avatar user menus, a top bar, breadcrumbs, a search button with a keyboard shortcut, a notifications bell, a side panel with its header button, plan usage and a top navigation row.',
    registryDependencies: [
      'avatar',
      'breadcrumb',
      'button',
      'collapsible',
      'dropdown-menu',
      'kbd',
      'progress',
      'sheet',
      'sidebar',
      'tooltip',
      registryUrl('format'),
      registryUrl('link'),
      registryUrl('tag'),
      registryUrl('page-header'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/app-shell.tsx',
        type: 'registry:component',
      },
      {
        path: 'registry/hooks/use-mobile.ts',
        type: 'registry:hook',
      },
    ],
  },
  {
    name: 'chart',
    type: 'registry:component',
    title: 'Chart',
    description: 'Chart components.',
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('block-state'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'auth',
    type: 'registry:component',
    title: 'Auth',
    description:
      "Primitives for signing in and joining a workspace: a full-page frame with one narrow centred column, the icon over a page's title, a one-time code input with a box per digit that handles paste, autofill and Backspace, a password input you can show, a password strength meter with the rules it still needs, a row of sign-in providers, a send-again button that counts down, the row at the bottom that leads to another way in, Google, X and GitHub logos, a square workspace avatar with a logo, a mark or initials, and an email masking helper.",
    registryDependencies: [
      'button',
      'input',
      'input-group',
      registryUrl('format'),
      registryUrl('rolling-text'),
      registryUrl('team'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/auth.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'billing',
    type: 'registry:component',
    title: 'Billing',
    description:
      'Primitives for subscription billing: billing dates, MRR movement from starting to ending MRR, net revenue retention, a waterfall chart of the movement and an invoice status label.',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('format'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/billing.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'block-state',
    type: 'registry:component',
    title: 'Block State',
    description:
      'Primitives for loading, refreshing, empty and error states: a skeleton, a dimmed frame that keeps its layout while it refreshes, a message with an action, and a data-loading hook.',
    files: [
      {
        path: 'registry/components/dashboardblocks/block-state.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'breakdown',
    type: 'registry:component',
    title: 'Breakdown',
    description:
      'Primitives for part-to-whole breakdowns: a segmented 100% bar, legend keys and share formatting.',
    registryDependencies: [
      registryUrl('chart-panel'),
      registryUrl('table'),
      registryUrl('use-reveal'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/breakdown.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'chart-panel',
    type: 'registry:component',
    title: 'Chart Panel',
    description:
      'Primitives for full-size chart panels: tooltip, legend, axis defaults and an accessible data table.',
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('chart'), registryUrl('table')],
    files: [
      {
        path: 'registry/components/dashboardblocks/chart-panel.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'checklist',
    type: 'registry:component',
    title: 'Checklist',
    description:
      'Primitives for checklists and steppers: done, in progress, to do and skipped states, each with a marker shape and a status word, progress maths and wording that leave skipped steps out, and a styled checkbox.',
    registryDependencies: [registryUrl('status-label'), registryUrl('tag')],
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'table',
    type: 'registry:component',
    title: 'Table',
    description:
      'The parts every table is drawn with: rows, headers, row headers, group headers and cells that pad the edges of the table, numbers aligned to the end, a compact density for a small table in a headline block, rows that open a record or a page on click, a sticky first column, a sideways scroller, inline bars, a pager, and loading, empty and error rows.',
    registryDependencies: [
      'button',
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('format'),
      registryUrl('link'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/table.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'data-table',
    type: 'registry:component',
    title: 'Data Table',
    description:
      'Dashboard tables on TanStack Table: sorting, search, facet filters, pagination, row selection and column visibility, with inline bars, scrolling sideways when wider than its card.',
    dependencies: ['@tanstack/react-table@^9.2.4'],
    registryDependencies: [
      registryUrl('block-state'),
      'button',
      'checkbox',
      'dropdown-menu',
      'input',
      registryUrl('details'),
      registryUrl('table'),
      registryUrl('tag'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'command-menu',
    type: 'registry:component',
    title: 'Command Menu',
    description:
      'Primitives for a command menu: a search dialog of pages, actions and records that filters as you type or shows results you fetch, with descriptions, shortcuts and a searching state, a search button with ⌘K, and a shortcut hook.',
    registryDependencies: ['button', 'command', 'kbd'],
    files: [
      {
        path: 'registry/components/dashboardblocks/command-menu.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'comparison',
    type: 'registry:component',
    title: 'Comparison',
    description:
      'Primitives for comparisons: deltas, a two-proportion test with a 95% interval, diverging bars, dumbbells and an interval bar.',
    registryDependencies: [registryUrl('kpi'), registryUrl('use-reveal')],
    files: [
      {
        path: 'registry/components/dashboardblocks/comparison.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dashboard-header',
    type: 'registry:component',
    title: 'Dashboard Header',
    description:
      'Primitives for dashboard headers: a date range preset menu, a compare switch, filter menus, filter chips and an export menu.',
    registryDependencies: ['button', 'dropdown-menu', 'switch', registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/dashboard-header.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'deployments',
    type: 'registry:component',
    title: 'Deployments',
    description:
      'Primitives for deployments: ready, failed, building, queued and rolled back statuses written as coloured words, duration and short commit formatting, DORA bands for deployment frequency, lead time, change failure rate and time to restore, a DORA band label and a run history strip.',
    registryDependencies: [registryUrl('status-label')],
    files: [
      {
        path: 'registry/components/dashboardblocks/deployments.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'distribution',
    type: 'registry:component',
    title: 'Distribution',
    description:
      'Primitives for distributions: quantiles from raw values or from binned counts, binning, a five-number summary, the share above a limit, round ticks, a histogram with labelled percentile and threshold lines and a line for an earlier period, box plots and legend keys.',
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('chart')],
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'email',
    type: 'registry:component',
    title: 'Email',
    description:
      'Primitives for emails built with React Email: a layout with your brand and footer, a title with a sentence, a dark panel for the one thing the email is about with its value, a money value with smaller cents, a usage meter drawn as table cells, a note and a button, sections a rule opens, label and value rows with a total, and a render helper that returns the HTML and its plain-text copy.',
    dependencies: ['react-email'],
    registryDependencies: [registryUrl('email-theme')],
    files: [
      {
        path: 'registry/components/dashboardblocks/email.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'email-theme',
    type: 'registry:lib',
    title: 'Email Theme',
    description:
      'Your shadcn theme for emails: paste the :root and .dark blocks of your globals.css, and every email uses the same colour names as your app, turned into values mail apps can read.',
    dependencies: ['react-email'],
    files: [
      {
        path: 'registry/lib/dashboardblocks/email-theme.ts',
        type: 'registry:lib',
      },
    ],
  },
  {
    name: 'error-pages',
    type: 'registry:component',
    title: 'Error Pages',
    description:
      'Primitives for error and interruption pages: a full-page frame with your brand, a centred message, an optional code and icon, actions and footer links, plus UTC time and duration formatting.',
    files: [
      {
        path: 'registry/components/dashboardblocks/error-pages.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'feedback',
    type: 'registry:component',
    title: 'Feedback',
    description:
      'Primitives for customer feedback: a rating summary with the average and share of each rating, CSAT as the share of 4 and 5 ratings, net sentiment, stars filled to a fractional rating, and a recharts diverging bar chart of sentiment by topic with a tooltip.',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('chart'),
      registryUrl('chart-panel'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/feedback.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'flow',
    type: 'registry:component',
    title: 'Flow',
    description:
      "Primitives for flows: a recharts Sankey chart that keeps each flow's colour downstream, draws drop-offs muted and highlights what a hovered node or band connects, with a tooltip, plus path steps joined by arrows.",
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('chart'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/flow.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'forecast',
    type: 'registry:component',
    title: 'Forecast',
    description:
      'Primitives for forecasts: a straight-line fit with a prediction interval that widens with the horizon, run-rate projection, date-to-target solving, a striped projection bar, legend keys, a tooltip and a status label.',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('chart'),
      registryUrl('format'),
      registryUrl('status-label'),
      registryUrl('use-reveal'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/forecast.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'forms',
    type: 'registry:component',
    title: 'Forms',
    description:
      'Primitives for forms without a form library: a form state hook with validation on blur and submit, server errors, dirty and submitting flags, a titled form section, a sticky save bar, wizard steps, a form in a side sheet, an inline edit field and an email check.',
    registryDependencies: ['button', 'input', 'sheet', registryUrl('checklist')],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'format',
    type: 'registry:lib',
    title: 'Format',
    description:
      'en-US formatting for numbers, compact numbers, currency, percentages from ratios, signed differences with a real minus, percentage points, UTC date ranges and details joined with a middle dot.',
    files: [
      {
        path: 'registry/lib/dashboardblocks/format.ts',
        type: 'registry:lib',
      },
    ],
  },
  {
    name: 'funnel',
    type: 'registry:component',
    title: 'Funnel',
    description:
      'Primitives for conversion funnels: step conversion maths, the biggest drop and a stage bar.',
    registryDependencies: [
      registryUrl('format'),
      registryUrl('use-reveal'),
      registryUrl('block-state'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/funnel.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'gauge',
    type: 'registry:component',
    title: 'Gauge',
    description:
      'Primitives for gauges and scores: a semicircle or three-quarter arc gauge built as a meter, with labelled bands, a target tick and an animated fill, band labels as coloured words, plus band, weighted score and NPS helpers.',
    registryDependencies: [
      registryUrl('format'),
      registryUrl('status-label'),
      registryUrl('use-reveal'),
      registryUrl('block-state'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'address-fields',
    type: 'registry:component',
    title: 'Address Fields',
    description:
      'Country first, then the fields its addresses use, named its way and in its order, with a list of states or provinces where the country has one and a check of the postal code.',
    registryDependencies: [
      'field',
      'input',
      registryUrl('countries'),
      registryUrl('country-flag'),
      registryUrl('option-select'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/address-fields.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'countries',
    type: 'registry:lib',
    title: 'Countries',
    description:
      'Every country’s two-letter code and English name, in alphabetical order.',
    files: [
      {
        path: 'registry/lib/dashboardblocks/countries.ts',
        type: 'registry:lib',
      },
    ],
  },
  {
    name: 'country-flag',
    type: 'registry:component',
    title: 'Country Flag',
    description:
      "A country's flag from its two-letter code, drawn as SVG so it shows on Windows too, with a globe for a code it has no flag for.",
    dependencies: ['country-flag-icons'],
    files: [
      {
        path: 'registry/components/dashboardblocks/country-flag.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'geo',
    type: 'registry:component',
    title: 'Geo',
    description:
      'Primitives for location metrics: a US state tile map and a dotted world map from an embedded land mask with markers sized by value, both with the shared chart tooltip, a marker size legend and country flags.',
    registryDependencies: [
      registryUrl('chart'),
      registryUrl('country-flag'),
      registryUrl('format'),
      registryUrl('heatmap'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/geo.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'goals',
    type: 'registry:component',
    title: 'Goals',
    description:
      'Primitives for goals and targets: pace against a straight line to the target, a progress bar with an expected-by-now marker and the projection hatched, and the pace as a coloured word.',
    registryDependencies: [
      registryUrl('status-label'),
      registryUrl('use-reveal'),
      registryUrl('block-state'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/goals.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'heatmap',
    type: 'registry:component',
    title: 'Heatmap',
    description:
      'Primitives for heatmaps: a single-hue colour scale, a keyboard-readable grid of squares or dots with the shared chart tooltip, optional bars above its columns, dots on flagged cells, a ripple out from one cell, and a legend.',
    registryDependencies: [registryUrl('chart'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/heatmap.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'icon',
    type: 'registry:component',
    title: 'Icon',
    description: 'An icon component.',
    dependencies: ['class-variance-authority'],
    files: [
      {
        path: 'registry/components/dashboardblocks/icon.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'insights',
    type: 'registry:component',
    title: 'Insights',
    description:
      'Primitives for insights: positive, negative, neutral and anomaly kinds, each named by a coloured word, sentences with their metrics picked out in colour, and a "why" line of drivers.',
    registryDependencies: [registryUrl('status-label')],
    files: [
      {
        path: 'registry/components/dashboardblocks/insights.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'inventory',
    type: 'registry:component',
    title: 'Inventory',
    description:
      'Primitives for inventory: out of stock, low, in stock and overstock from on-hand stock and the reorder point, each as a coloured label, days of cover, a reorder quantity for the lead time plus a target, and a stock bar with a reorder point tick.',
    registryDependencies: [registryUrl('status-label'), registryUrl('use-reveal')],
    files: [
      {
        path: 'registry/components/dashboardblocks/inventory.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'kpi',
    type: 'registry:component',
    title: 'KPI',
    description:
      'Primitives for KPIs: a block with a top rule, a value that counts up with the final value read out, the change vs the previous period written as a sentence, in percent or percentage points with the good direction, a chart wrapper with a text alternative, and named en-US formats.',
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('animated-number'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'kpi-provenance',
    type: 'registry:component',
    title: 'KPI Provenance',
    description:
      'A button beside a number that shows how it was computed: what’s counted, the date range, the filters, the query’s name and a link to the rows.',
    registryDependencies: [
      'button',
      'popover',
      registryUrl('link'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi-provenance.tsx',
        type: 'registry:component',
      },
      {
        path: 'registry/components/dashboardblocks/kpi-provenance-format.ts',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'leaderboard',
    type: 'registry:component',
    title: 'Leaderboard',
    description: 'Primitives for composing ranked lists and leaderboards.',
    dependencies: ['class-variance-authority'],
    registryDependencies: [registryUrl('use-reveal')],
    files: [
      {
        path: 'registry/components/dashboardblocks/leaderboard.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'link',
    type: 'registry:component',
    title: 'Link',
    description:
      "A link provider that makes every primitive render your router's link, for client-side navigation, with plain anchors as the default.",
    files: [
      {
        path: 'registry/components/dashboardblocks/link.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'metric-list',
    type: 'registry:component',
    title: 'Metric List',
    description:
      'Primitives for compact lists of metrics: a row with value, the change written as words and a sparkline, a bar against a target with its status, and value formatting helpers.',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('chart'),
      registryUrl('kpi'),
      registryUrl('status-label'),
      registryUrl('use-reveal'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/metric-list.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'notifications',
    type: 'registry:component',
    title: 'Notifications',
    description:
      'Primitives for notifications: a bell with an unread count that opens a panel, a header with an action, and a notification row that opens as a whole while its own buttons still work, with relative times and an unread dot.',
    registryDependencies: [
      'button',
      'popover',
      registryUrl('activity-feed'),
      registryUrl('link'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/notifications.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'tag',
    type: 'registry:component',
    title: 'Tag',
    description:
      "A small tinted tag for a count or short word beside a sidebar link, tab, menu item or group heading, or an item's label with its dot: neutral, or a status tone when it needs attention.",
    registryDependencies: [registryUrl('format'), registryUrl('status-label')],
    files: [
      {
        path: 'registry/components/dashboardblocks/tag.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'page-header',
    type: 'registry:component',
    title: 'Page Header',
    description:
      'Primitives for page headers: a heading with a badge, media and description, actions that wrap, a row of key numbers, a back link, section tabs that put what doesn’t fit under More, and a more-actions menu.',
    registryDependencies: [
      'button',
      'dropdown-menu',
      registryUrl('link'),
      registryUrl('tag'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/page-header.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'pipeline',
    type: 'registry:component',
    title: 'Pipeline',
    description:
      'Primitives for pipelines of work in flight: stage summaries with count, value and weighted value, days in stage with a stuck state, a stage header, an item card, an owner with their photo and age formatting.',
    registryDependencies: [registryUrl('tag'), registryUrl('team')],
    files: [
      {
        path: 'registry/components/dashboardblocks/pipeline.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'progress-bar',
    type: 'registry:component',
    title: 'Progress Bar',
    description: 'A progress bar component.',
    registryDependencies: [registryUrl('block-state'), registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/progress-bar.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'realtime',
    type: 'registry:component',
    title: 'Realtime',
    description:
      'Primitives for live data: an interval hook, a seeded random generator for demo streams, a rolling window, a pulsing live label that stays still for reduced motion, a number that counts to each new value, rolling bars on recharts and a short time-ago format.',
    registryDependencies: [
      registryUrl('chart'),
      registryUrl('format'),
      registryUrl('status-label'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/realtime.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'record-detail',
    type: 'registry:component',
    title: 'Record Detail',
    description:
      "Primitives for a record's page or panel: a layout with a details column beside the main content, the number that leads the record, titled sections under a rule and a list of labelled properties.",
    registryDependencies: [registryUrl('block-state'), registryUrl('kpi')],
    files: [
      {
        path: 'registry/components/dashboardblocks/record-detail.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'retention',
    type: 'registry:component',
    title: 'Retention',
    description:
      'Primitives for retention: rates per cohort, a size-weighted average curve, where the curve levels off, the growth accounting quick ratio, a shaded cohort table with a hover tooltip, a bar and a change in percentage points.',
    registryDependencies: [
      registryUrl('chart'),
      registryUrl('heatmap'),
      registryUrl('use-reveal'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/retention.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ring',
    type: 'registry:component',
    title: 'Ring',
    description: 'A ring component.',
    registryDependencies: [registryUrl('block-state'), registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/ring.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'scatter',
    type: 'registry:component',
    title: 'Scatter',
    description:
      'Primitives for scatter plots and matrices: a least-squares line with the correlation coefficient described in words, a median, categorical colours in a fixed order, point tooltip content, and risk levels from likelihood and impact with a labelled swatch.',
    registryDependencies: [registryUrl('chart')],
    files: [
      {
        path: 'registry/components/dashboardblocks/scatter.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'schedule',
    type: 'registry:component',
    title: 'Schedule',
    description:
      'Primitives for schedules: date helpers that take a fixed now and a time zone, an event row, urgency labels and badges, and a keyboard-navigable month calendar.',
    registryDependencies: [registryUrl('status-label'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/schedule.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'security',
    type: 'registry:component',
    title: 'Security',
    description:
      'Primitives for security: info, warning and critical audit severities and passing, attention and failing check results as coloured words, a desktop or phone device icon, and a weighted security score.',
    registryDependencies: [registryUrl('status-label')],
    files: [
      {
        path: 'registry/components/dashboardblocks/security.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'settings',
    type: 'registry:component',
    title: 'Settings',
    description:
      'Primitives for settings pages: owner, admin, member and viewer roles with what each can do and a menu to pick one, a row that puts a label and description beside its control, connected, needs attention, paused and not connected statuses each with an icon and label, secret masking, a copy button that announces itself, and relative and UTC date formatting.',
    registryDependencies: ['button', 'dropdown-menu', registryUrl('status-label')],
    files: [
      {
        path: 'registry/components/dashboardblocks/settings.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'spend',
    type: 'registry:component',
    title: 'Spend',
    description:
      'Primitives for spend and budgets: pace against an even spend of the budget with a projected total and a status, runway at the current net burn, a budget bar with overspend and a striped projection, the status as a coloured word, and legend keys.',
    registryDependencies: [
      registryUrl('status-label'),
      registryUrl('use-reveal'),
      registryUrl('block-state'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/spend.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'option-select',
    type: 'registry:component',
    title: 'Option Select',
    description:
      'A select for one value from a list of options, each with an optional icon such as a flag, with a placeholder, built on the shadcn Select so its menu follows your style and font.',
    registryDependencies: ['select'],
    files: [
      {
        path: 'registry/components/dashboardblocks/option-select.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'multi-select',
    type: 'registry:component',
    title: 'Multi-select',
    description:
      'A field for several values from a searchable list, shown as chips you can remove, built on the shadcn Combobox so its list follows your style and font.',
    dependencies: ['@base-ui/react'],
    registryDependencies: ['button', 'combobox'],
    files: [
      {
        path: 'registry/components/dashboardblocks/multi-select.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'choice-cards',
    type: 'registry:component',
    title: 'Choice Cards',
    description:
      'One or several options drawn as cards on native radio and checkbox inputs, each with its title, a line of detail, an optional icon, a label and a value to compare, such as a price.',
    registryDependencies: ['field', registryUrl('tag')],
    files: [
      {
        path: 'registry/components/dashboardblocks/choice-cards.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'number-field',
    type: 'registry:component',
    title: 'Number Field',
    description:
      'A number with its unit or currency, formatted when the field loses focus, kept between its minimum and maximum, with arrow keys and optional minus and plus buttons.',
    registryDependencies: ['input-group', registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/number-field.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'details',
    type: 'registry:component',
    title: 'Details',
    description:
      'Two or three short facts about one subject on one line, joined by a middle dot that screen readers skip and that never ends a line.',
    files: [
      {
        path: 'registry/components/dashboardblocks/details.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'rolling-text',
    type: 'registry:component',
    title: 'Rolling Text',
    description:
      'Text that rolls up to its next value: the old text slides out the top as the new one slides in, and it swaps in place under reduced motion.',
    files: [
      {
        path: 'registry/components/dashboardblocks/rolling-text.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'status-label',
    type: 'registry:component',
    title: 'Status Label',
    description:
      'A status written as a coloured word: good, warning, bad, info and neutral tones in the shades every block uses.',
    files: [
      {
        path: 'registry/components/dashboardblocks/status-label.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'stat-group',
    type: 'registry:component',
    title: 'Stat Group',
    description:
      'Primitives for a row of related stats: ruled columns, labels, light values, the change vs the previous period as a sentence or an arrow, and sparklines.',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('block-state'),
      registryUrl('chart'),
      registryUrl('kpi'),
      registryUrl('trend'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/stat-group.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'status',
    type: 'registry:component',
    title: 'Status',
    description:
      'Primitives for service status: status levels written as a coloured dot and word, a legend, and a 90-day uptime bar with a tooltip for each day.',
    registryDependencies: [registryUrl('chart'), registryUrl('status-label')],
    files: [
      {
        path: 'registry/components/dashboardblocks/status.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'team',
    type: 'registry:component',
    title: 'Team',
    description:
      'Primitives for people: avatars with initials and a colour picked from the name, presence as a dot on the avatar and a coloured word, and an avatar stack with a "+N" overflow.',
    registryDependencies: ['avatar', registryUrl('status-label')],
    files: [
      {
        path: 'registry/components/dashboardblocks/team.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'timeline',
    type: 'registry:component',
    title: 'Timeline',
    description:
      'Primitives for timelines on recharts: a UTC date scale, week, month and quarter ticks, days between dates, done, in progress, planned and at risk statuses each with an icon and label, an axis tick, a today label, a chart of dated rows with tooltips, and a Gantt-style timeline with grouped rows and progress fills.',
    dependencies: ['recharts'],
    registryDependencies: [
      registryUrl('chart'),
      registryUrl('status-label'),
      registryUrl('details'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/timeline.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'trend',
    type: 'registry:component',
    title: 'Trend',
    description: 'A trend indicator component.',
    dependencies: ['class-variance-authority'],
    registryDependencies: [registryUrl('animated-number'), registryUrl('format')],
    files: [
      {
        path: 'registry/components/dashboardblocks/trend.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'usage-meter',
    type: 'registry:component',
    title: 'Usage Meter',
    description:
      'Primitives for usage against a limit: within limit, nearing it, critical and over limit, each with a label (a coloured word, or a badge with an icon), the share used, usage projected to the end of the period, days left at a daily rate, en-US number formatting, and a usage bar with overage, a striped projection and a limit tick.',
    registryDependencies: [
      registryUrl('format'),
      registryUrl('status-label'),
      registryUrl('use-reveal'),
      registryUrl('block-state'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'kanban',
    type: 'registry:component',
    title: 'Kanban',
    description:
      'Primitives for kanban boards: a board of columns with drag and drop by mouse, touch and keyboard and announced moves, columns with counts, WIP limits that warn or block and collapsing, cards with a move menu, labels, assignees, due dates, priorities, stats and subtasks, an inline add-card form and a helper that moves a card in your array.',
    registryDependencies: [
      'avatar',
      'button',
      'dropdown-menu',
      'input',
      'kbd',
      registryUrl('activity-feed'),
      registryUrl('schedule'),
      registryUrl('tag'),
      registryUrl('status-label'),
      registryUrl('block-state'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/kanban.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'comments',
    type: 'registry:component',
    title: 'Comments',
    description:
      'Primitives for comments: threads with one level of replies joined by a line, a composer that suggests people after @ and submits with ⌘ Enter, highlighted mentions, reaction toggles with an emoji picker, an edit and delete menu, and resolved threads that collapse to a summary.',
    registryDependencies: [
      'avatar',
      'button',
      'dropdown-menu',
      'input-group',
      registryUrl('activity-feed'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/comments.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'calendar',
    type: 'registry:component',
    title: 'Calendar',
    description:
      'Primitives for calendars: a toolbar with today, previous, next and a view switch, a keyboard-navigable month grid with event chips, multi-day bars and "+N more", week and resource views on an hour axis with overlapping events side by side and a now line, an event list for narrow screens, inline event details, a legend that can filter calendars, and date helpers for weeks, event days and lanes.',
    registryDependencies: [
      'button',
      'button-group',
      'tabs',
      registryUrl('schedule'),
      registryUrl('team'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/calendar.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'files',
    type: 'registry:component',
    title: 'Files',
    description:
      'Primitives for files: a dropzone around a real file input that checks type, size and count, a provider-agnostic upload hook with progress, cancel, retry and a concurrency limit, ruled upload rows with a progress bar and their status in words, icons for eleven kinds of file from the name or MIME type, en-US file sizes, a file actions menu and folder breadcrumbs.',
    registryDependencies: [
      'button',
      'dropdown-menu',
      registryUrl('format'),
      registryUrl('status-label'),
      registryUrl('details'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/files.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'disclosure',
    type: 'registry:component',
    title: 'Disclosure',
    description:
      'A line of muted text with a chevron that shows or hides what is under it, such as a tool call’s input and output or a model’s reasoning.',
    files: [
      {
        path: 'registry/components/dashboardblocks/disclosure.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'highlighted-code',
    type: 'registry:component',
    title: 'Highlighted Code',
    description:
      'Code in a code block with copy, highlighted with Shiki in the theme’s own colours: syntax muted, values in the chart colour, and any text you name marked, such as a key to check. It highlights code as a model streams it.',
    dependencies: ['shiki@^4.5.0'],
    registryDependencies: ['code-block'],
    files: [
      {
        path: 'registry/components/dashboardblocks/highlighted-code.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-chat',
    type: 'registry:component',
    title: 'AI Chat',
    description:
      'The parts every AI block shares: message types that take the Vercel AI SDK’s useChat and UIMessage as they are, Markdown from a model drawn with safe links and no HTML while it streams, each word fading in as it arrives, thinking that collapses to one line, tool calls with their state, approval and details, attached files, and numbered sources and citations.',
    dependencies: ['marked@^18.1.0', 'remend@^1.4.0'],
    registryDependencies: [
      'attachment',
      'button',
      'marker',
      registryUrl('disclosure'),
      registryUrl('format'),
      registryUrl('highlighted-code'),
      registryUrl('link'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-message.ts',
        type: 'registry:component',
      },
      {
        path: 'registry/components/dashboardblocks/ai-sources.tsx',
        type: 'registry:component',
      },
      {
        path: 'registry/components/dashboardblocks/ai-markdown.tsx',
        type: 'registry:component',
      },
      {
        path: 'registry/components/dashboardblocks/ai-parts.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-assistant',
    type: 'registry:component',
    title: 'AI Assistant',
    description:
      'Primitives for AI chat that take the Vercel AI SDK’s useChat as it is: a scrolling log that puts each new question at the top with its reply growing below, opens a saved conversation at its last question and reads each reply out once it has finished, messages that show thinking, tool calls, Markdown, files and sources, copy, regenerate and feedback actions, suggested prompts, a welcome, an error with retry, context chips, a message box that attaches files and where Enter sends and Stop halts a reply, and a hook that runs the same chat from any function that streams.',
    registryDependencies: [
      'attachment',
      'bubble',
      'button',
      'input-group',
      'message',
      'message-scroller',
      registryUrl('ai-chat'),
      registryUrl('format'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/ai-assistant.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'invoice',
    type: 'registry:component',
    title: 'Invoice',
    description:
      'Primitives for printable documents such as invoices, receipts, quotes and packing slips: totals that add up to the cent with discounts, tax per rate, shipping and balance due, a sheet that prints black on white, a toolbar hidden in print, a header, a headline amount with a sentence, parties, dates, a line items table with optional checkboxes, totals, notes and a Code 39 barcode.',
    registryDependencies: [
      'button',
      'checkbox',
      registryUrl('format'),
      registryUrl('block-state'),
      registryUrl('details'),
      registryUrl('table'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/invoice.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'onboarding',
    type: 'registry:component',
    title: 'Onboarding',
    description:
      'Primitives for first-run setup: a full-page frame with step progress and Back, Skip and Continue actions that moves focus to each new step, an invite list of email and role rows that splits pasted lists and checks for invalid and duplicate addresses, action rows for quick starts, and a URL slug helper.',
    registryDependencies: [
      'button',
      'field',
      'input',
      registryUrl('option-select'),
      registryUrl('forms'),
      registryUrl('link'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/onboarding.tsx',
        type: 'registry:component',
      },
    ],
  },
]
