import { type Registry } from 'shadcn/schema'

import { registryUrl } from '@/lib/config'

export const components: Registry['items'] = [
  {
    name: 'activity-feed',
    type: 'registry:component',
    title: 'Activity Feed',
    description: 'Primitives for composing activity and timeline feeds.',
    dependencies: ['class-variance-authority'],
    files: [
      {
        path: 'registry/components/dashboardblocks/activity-feed.tsx',
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
      'Primitives for dashboard tables: sortable headers, inline bars, pagination and a stacked layout for narrow cards.',
    registryDependencies: ['button', 'dropdown-menu'],
    files: [
      {
        path: 'registry/components/dashboardblocks/data-table.tsx',
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
    name: 'kpi',
    type: 'registry:component',
    title: 'KPI',
    description:
      'A flexible KPI card with trend indicators, sparklines, and progress tracking.',
    registryDependencies: ['card'],
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
    description: 'A usage meter component.',
    files: [
      {
        path: 'registry/components/dashboardblocks/usage-meter.tsx',
        type: 'registry:component',
      },
    ],
  },
]
