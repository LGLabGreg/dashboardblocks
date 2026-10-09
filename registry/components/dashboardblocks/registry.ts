import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const components: Registry['items'] = [
  {
    name: 'activity-feed',
    type: 'registry:component',
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
      'Primitives for alerts: critical, warning, info and resolved severities, each with an icon and label, plus relative time formatting.',
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
    registryDependencies: [registryUrl('use-animated-number')],
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
      'Primitives for app shells built on the shadcn sidebar: navigation sections from data with active links, badges and collapsible child links, a brand link, a workspace switcher, sidebar and avatar user menus, a top bar, breadcrumbs, a search button with a keyboard shortcut, a notifications bell, plan usage and a top navigation row.',
    registryDependencies: [
      'avatar',
      'breadcrumb',
      'button',
      'collapsible',
      'dropdown-menu',
      'kbd',
      'progress',
      'sidebar',
      registryUrl('link'),
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/app-shell.tsx',
        type: 'registry:component',
      },
      // Replaces the sidebar's own hooks/use-mobile.ts, which fails react-hooks/set-state-in-effect.
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
      'Primitives for signing in and joining a workspace: a full-page frame with one narrow centred column, a one-time code input with a box per digit that handles paste, autofill and Backspace, a square workspace avatar with initials, and an email masking helper.',
    registryDependencies: ['input', registryUrl('team')],
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
      'Primitives for subscription billing: currency formatting, MRR movement from starting to ending MRR, net revenue retention, a waterfall of the movement and an invoice status badge.',
    registryDependencies: [registryUrl('use-in-view')],
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
    registryDependencies: [registryUrl('use-in-view')],
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
      'Primitives for checklists and steppers: done, in progress, to do and skipped states, each with a marker shape and label, progress maths that leaves skipped steps out, and a styled checkbox.',
    files: [
      {
        path: 'registry/components/dashboardblocks/checklist.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'data-table',
    type: 'registry:component',
    title: 'Data Table',
    description:
      'Dashboard tables on TanStack Table: sorting, search, facet filters, pagination, row selection and column visibility, with inline bars and a stacked layout for narrow cards.',
    dependencies: ['@tanstack/react-table@^9.2.4'],
    registryDependencies: ['button', 'checkbox', 'dropdown-menu', 'input'],
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
    registryDependencies: [registryUrl('use-in-view')],
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
    registryDependencies: ['button', 'dropdown-menu', 'switch'],
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
      'Primitives for deployments: ready, failed, running, queued and rolled back statuses each with an icon and label, duration and short commit formatting, DORA bands for deployment frequency, lead time, change failure rate and time to restore, a DORA badge and a run history strip.',
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
      'Primitives for distributions: quantiles from raw values or from binned counts, binning, a five-number summary, the share above a limit, round ticks, a histogram with labelled percentile and threshold lines and an outline for an earlier period, a box plot, an axis and legend keys.',
    registryDependencies: [registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/distribution.tsx',
        type: 'registry:component',
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
      'Primitives for customer feedback: a rating summary with the average and share of each rating, CSAT as the share of 4 and 5 ratings, net sentiment, stars filled to a fractional rating, and a stacked or diverging sentiment bar with legend keys.',
    registryDependencies: [registryUrl('use-in-view')],
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
      "Primitives for flows: a Sankey layout that places nodes in columns and links as bands, keeping each flow's colour downstream and drawing drop-offs muted, a Sankey chart with hover highlighting and a readout, and path steps as chips.",
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
      'Primitives for forecasts: a straight-line fit with a prediction interval that widens with the horizon, run-rate projection, date-to-target solving, a striped projection bar, legend keys, a tooltip and a status badge.',
    dependencies: ['recharts'],
    registryDependencies: [registryUrl('chart-panel'), registryUrl('use-in-view')],
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
    registryDependencies: ['button', 'input', 'sheet'],
    files: [
      {
        path: 'registry/components/dashboardblocks/forms.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'funnel',
    type: 'registry:component',
    title: 'Funnel',
    description:
      'Primitives for conversion funnels: step conversion maths and horizontal or vertical stage bars.',
    registryDependencies: [registryUrl('use-in-view')],
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
      'Primitives for gauges and scores: a semicircle or three-quarter arc gauge built as a meter, with labelled bands, a target tick and an animated fill, plus band, weighted score and NPS helpers.',
    registryDependencies: [registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/gauge.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'geo',
    type: 'registry:component',
    title: 'Geo',
    description:
      'Primitives for location metrics: a US state tile map, a dotted world map from an embedded land mask with markers sized by value, country flags and share bars.',
    registryDependencies: [registryUrl('heatmap'), registryUrl('use-in-view')],
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
      'Primitives for goals and targets: pace against a straight line to the target, a progress bar with an expected-by-now marker, and a pace badge.',
    registryDependencies: [registryUrl('use-in-view')],
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
      'Primitives for heatmaps: a single-hue colour scale, a keyboard-readable grid with a readout line, a legend and an accessible data table.',
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
      'Primitives for insights: positive, negative, neutral and anomaly kinds, each with an icon and label, sentences with highlighted metrics, and a "why" line of drivers.',
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
      'Primitives for inventory: out of stock, low, in stock and overstock from on-hand stock and the reorder point, each with an icon and label, days of cover, a reorder quantity for the lead time plus a target, and a stock bar with a reorder point tick.',
    registryDependencies: [registryUrl('use-in-view')],
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
      'Primitives for KPI cards: a card, a value that counts up with the final value read out, change vs the previous period in percent or percentage points with the good direction, a chart wrapper with a text alternative, and named en-US formats.',
    registryDependencies: ['card', registryUrl('animated-number'), registryUrl('trend')],
    files: [
      {
        path: 'registry/components/dashboardblocks/kpi.tsx',
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
    registryDependencies: [registryUrl('use-in-view')],
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
      'Primitives for compact lists of metrics: a row with value, direction-aware change and sparkline, a bar against a target with its status, and value formatting helpers.',
    registryDependencies: [registryUrl('trend'), registryUrl('use-in-view')],
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
    ],
    files: [
      {
        path: 'registry/components/dashboardblocks/notifications.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'page-header',
    type: 'registry:component',
    title: 'Page Header',
    description:
      'Primitives for page headers: a heading with a badge, media and description, actions that wrap, facts with icons, a back link, section tabs and a more-actions menu.',
    registryDependencies: ['button', 'dropdown-menu', registryUrl('link')],
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
      'Primitives for pipelines of work in flight: stage summaries with count, value and weighted value, days in stage with a stuck state, a stage header, an item card and currency and age formatting.',
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
    registryDependencies: [registryUrl('use-in-view')],
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
      'Primitives for live data: an interval hook, a seeded random generator for demo streams, a rolling window, a pulsing live badge that stays still for reduced motion, a number that counts to each new value, rolling bars and a short time-ago format.',
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
      "Primitives for a record's page: a layout with a details column beside the main content, a list of labelled properties and a row of headline numbers.",
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
      'Primitives for retention: rates per cohort, a size-weighted average curve, where the curve levels off, the growth accounting quick ratio, a shaded cohort table, a bar with an earlier-value tick and a change in percentage points.',
    registryDependencies: [registryUrl('heatmap'), registryUrl('use-in-view')],
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
    registryDependencies: [registryUrl('use-in-view')],
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
      'Primitives for schedules: date helpers that take a fixed now and a time zone, an event row, urgency badges and a keyboard-navigable month calendar.',
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
      'Primitives for security: info, warning and critical audit severities and passing, attention and failing check results, each with an icon and label, a desktop or phone device icon, a weighted security score and a time-since format.',
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
    registryDependencies: ['button', 'dropdown-menu'],
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
      'Primitives for spend and budgets: pace against an even spend of the budget with a projected total and a status, runway at the current net burn, a budget bar with overspend and a striped projection, a status badge with an icon and label, and legend keys.',
    registryDependencies: [registryUrl('use-in-view')],
    files: [
      {
        path: 'registry/components/dashboardblocks/spend.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'stat-group',
    type: 'registry:component',
    title: 'Stat Group',
    description:
      'Primitives for a row of related stats: a divided grid, labels, values, change vs the previous period and sparklines.',
    registryDependencies: [registryUrl('trend'), registryUrl('use-in-view')],
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
      'Primitives for service status: status levels with icons and labels, badges, indicators and a 90-day uptime bar.',
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
      'Primitives for people: avatars with initials and a colour picked from the name, presence with a dot and a label, and an avatar stack with a "+N" overflow.',
    registryDependencies: ['avatar'],
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
      'Primitives for timelines: a UTC date scale, week, month and quarter ticks, days between dates, done, in progress, planned and at risk statuses each with an icon and label, an axis, grid lines, a today line and a Gantt-style timeline with grouped rows, progress fills and a readout.',
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
    registryDependencies: [registryUrl('animated-number')],
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
      'Primitives for usage against a limit: within limit, nearing it, critical and over limit, each with an icon and label, the share used, usage projected to the end of the period, days left at a daily rate, en-US number formatting, and a usage bar with overage, a striped projection and a limit tick.',
    registryDependencies: [registryUrl('use-in-view')],
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
      'Primitives for files: a dropzone around a real file input that checks type, size and count, a provider-agnostic upload hook with progress, cancel, retry and a concurrency limit, upload rows with a progress bar, tinted icons for eleven kinds of file from the name or MIME type, en-US file sizes, a file actions menu and folder breadcrumbs.',
    registryDependencies: ['button', 'dropdown-menu'],
    files: [
      {
        path: 'registry/components/dashboardblocks/files.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'ai-assistant',
    type: 'registry:component',
    title: 'AI Assistant',
    description:
      'Primitives for AI chat: a scrolling log that follows streamed replies and reads each one out once it has finished, user and assistant messages with safe formatting for lists, code and code blocks, copy, regenerate and feedback actions, a typing indicator, suggested prompts, a welcome, an error with retry, context chips, a message box where Enter sends and Stop halts a reply, and a hook that runs a chat from any function that streams text.',
    registryDependencies: ['button', 'input-group'],
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
      'Primitives for printable documents such as invoices, receipts, quotes and packing slips: totals that add up to the cent with discounts, tax per rate, shipping and balance due, a sheet that prints black on white, a toolbar hidden in print, a header, parties, dates, a line items table with optional checkboxes, totals, notes and a Code 39 barcode.',
    registryDependencies: ['badge', 'button', 'card', 'checkbox', registryUrl('billing')],
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
      'Primitives for first-run setup: a full-page frame with step progress and Back, Skip and Continue actions that moves focus to each new step, radio and checkbox choice cards on native inputs, an invite list of email and role rows that splits pasted lists and checks for invalid and duplicate addresses, large action cards for quick starts, and a URL slug helper.',
    registryDependencies: [
      'button',
      'card',
      'field',
      'input',
      'native-select',
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
