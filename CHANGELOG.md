# dashboardblocks

## 1.13.0

### Minor Changes

- 217b5f9: App Shell 01 can pin links to the bottom of the sidebar and leave out the notifications button.
- f5263bb: App Shell's user menu can offer a Light, Dark and System theme choice.

### Patch Changes

- 2e89d40: Leaderboard 01 takes `labelHeader` and `valueHeader` to name its two columns, and `viewAllLabel={null}` leaves out its View all button.
- 2e89d40: Leaderboard 05 shows each country's flag in place of its code, and Geo 02 takes `otherLabel={null}` to leave out the row that sums the rest.
- da24432: The retention part's cohort rows can show an icon before their label, such as a country's flag.

## 1.12.6

### Patch Changes

- b19efcb: `TabLinks` and `useHiddenRailItems` in `page-header.tsx` measure the rail again once More shows, so a tab that fits beside More no longer goes under it on a narrow screen.

## 1.12.5

### Patch Changes

- 3617d60: Dashboards line up the lines under the titles of blocks side by side, with shorter descriptions. Alerts: Inbox and Deployments: Build Health sum up their state in fewer words.

## 1.12.4

### Patch Changes

- 0152590: Buttons whose action has a clear symbol now show it: Add a plus, Edit a pencil, Remove a bin, Copy a copy icon that turns into a tick, Undo and Try again their arrows, View all and Go to an arrow after the label. `DataTablePager`'s Previous and Next show chevrons. Reload in States and the upload retry in Files use the same refresh icon as every other refresh.
- ac9bb44: `CohortTable` can make its cells buttons that open a cell (`onCellSelect`, `selected`, `selectedDetail`), report the row under the pointer (`onRowHover`), and stripe a cohort's period that is still filling, which the average leaves out (`filling`). A row that groups cohorts can pass `eligible`, the people old enough to reach each period, and each period's share counts over them. Hovering a cell shows its tooltip without a ring. `getPlateau` now finds where retention holds by a share of the rate, so a low curve no longer levels off before it falls again. `chart.tsx` adds `chartHatchFill`, the same stripes for an HTML cell or bar, which Forecast's key uses. `table.tsx` adds `DataTablePager`, the range and Previous and Next that Data Table's pagination now draws with.
- 114b490: Flow draws in once per set of data, not again when the page is resized, and a step's tooltip sits clear of its label.
- b360eeb: Flow can light a path through the chart (`highlight`), make its steps buttons (`onNodeSelect`) and keep the last column's labels outside it (`lastLabels`). Every flow now draws in column by column, and its labels sit on a backing that keeps them readable over the links. A flow of buttons is one tab stop: the arrow keys move between its steps. A chart's hover now holds across the gaps between its marks, so the tooltip and highlight no longer flicker on Flow, Breakdown's squares chart and Chart Panel's donut. A table's loading rows can sketch one cell per column (`DataTableStateRows`' `columns` and `detail`), so the table keeps its height and columns while it loads.
- 02c8601: `CountryFlag` in `geo.tsx` draws SVG flags from `country-flag-icons` in place of flag emoji, which Chrome and Edge on Windows showed as two letters. `countryFlag`, which returned the emoji, is gone.

## 1.12.3

### Patch Changes

- 8dd8813: `chart.tsx` adds `ChartHatch`, one hatching for a part of a chart that is left over or estimated. Realtime's Today So Far draws the hour still counting with it.
- f4cc4de: `formatDuration` takes `style: 'rough'` for a typical wait, in one unit up to days: "6 min", "1.8 days".

## 1.12.2

### Patch Changes

- 15ee9bd: Data Table's body rows carry `data-row-id`, each row's id, so a block can follow a row as it moves.

## 1.12.1

### Patch Changes

- 3e77e09: `chart.tsx` adds `ChartEdgeTick`, an x axis label that keeps the first and last dates inside the chart.
- f63c900: The date range picker takes `size='sm'`, so it lines up with small filter buttons beside it.
- 9589737: `formatList` takes `'or'` to join choices: "Germany or France".

## 1.12.0

### Minor Changes

- 79d0dc6: Every block that takes `status` also takes an optional `errorMessage`: one sentence your API writes on why a read failed, such as "The query took too long. Try a shorter range." It shows under "Couldn’t load". Leave it out to show "Couldn’t load" alone, as before.

### Patch Changes

- fd346fd: The shared loading, empty and error parts take an `emptyMessage`, so a block can say what belongs there instead of "No data".
- b05900f: Charts can mark named events, such as releases, with dashed lines that light up while the tooltip is on their day, and a dot that pulses on a point still filling. When the names don't fit, the markers become numbered pins with a key under the chart.
- 0792a65: Funnel 01 and Retention 02 take an optional `link`, shown beside the title, to open the full chart. Retention 02 and 04 no longer name a cohort or week when they fail to load.

## 1.11.0

### Minor Changes

- 133f917: Code in blocks is highlighted: syntax in a muted grey and values in your chart colour, through one new part, Highlighted Code, which can also mark text such as a key. AI Chat's code blocks and tool values use it, in place of shadcn's `use-highlighted-code`.

### Patch Changes

- 5853552: The heatmap grid can draw its cells as dots, ripple out from one cell, and take a stepped colour scale. Its legend can draw dots too. On the Tile Map and Dot Map, a hovered or focused tile or marker grows and turns the series colour instead of showing a black ring.
- 2d4f133: The geo part adds `MapRipple`: land dots that flash in rings out from a point on the dotted world map.
- 0f4e383: Record Detail has `RecordHeadline`, the number that leads a record's page or panel, which counts up as it shows. Progress bars, rings and numbers that start when they come into view now start in a panel that slides in, where they sometimes stayed empty.

## 1.10.2

### Patch Changes

- f09d1fa: AI replies fade in word by word as they stream, with no caret, in every block that draws a model's Markdown. KPI values can count from a previous value with `from`.

## 1.10.1

### Patch Changes

- 668ea5c: Activity Feed's line between two items can fill in green with `connector='done'`, for a step that's finished.
- 2e89d40: Leaderboard 01 takes `labelHeader` and `valueHeader` to name its two columns, and `viewAllLabel={null}` leaves out its View all button.
- 211b9ab: `geo.tsx`: country flags are larger, a map's tooltip goes when the pointer leaves its place, a map marker's tooltip shows its country's flag when the marker has a `country` code, and Geo 03's cities have one. `kpi.tsx`: `KPIChange` takes `changeType='count'` for a plain difference, such as `Up 6`.
- 2e89d40: Leaderboard 05 shows each country's flag in place of its code, and Geo 02 takes `otherLabel={null}` to leave out the row that sums the rest.

## 1.10.0

### Minor Changes

- 18c0891: App Shell 01 can open a side panel, such as a chat, from a button in its header: docked beside the page on a wide screen and a sheet on a smaller one. Links in a model's answer open with your app's router when `LinkProvider` is given `navigate`, so a chat keeps its place.

## 1.9.0

### Minor Changes

- b7bc253: AI Assistant: blocks take one `chat` prop shaped like the Vercel AI SDK's `useChat`, so `useChat()` passes in as it is, and replies show thinking, tool calls with Approve and Deny, Markdown tables, attached files and numbered sources. `useChatStream` builds the same chat from any function that streams. `onSend` and the `content` string on a message are gone: messages hold `parts`. New `ai-chat` and `disclosure` items hold the shared parts. Error Pages 03 folds its details with `Disclosure`.

## 1.8.3

### Patch Changes

- 91bbbe4: Table: a list row pads its sides like a table cell, so an icon or a name never sits against the list's edge (AI Usage 02).

## 1.8.2

### Patch Changes

- 4f56db2: AI Usage 2 and 3: a feature or model row can take an `href`, and the whole row opens it, such as the calls behind that row.
- 2de5ccc: Chart: `chartFadedColor` takes an optional strength, for a main series drawn softer beside a louder one.
- 2e2544e: Chart Panel: a chart's tooltip shows above a table or list that follows the chart, instead of behind it.
- bf8771b: AI Assistant and Error Pages 3: a code block's copy button keeps the code block's own size, so it lines up with the title.
- 65c8b10: Data Table: a facet filter's counts read with thousands separators (1,204), and the search box's name drops the placeholder's trailing ellipsis.
- 94256bc: Page Header: three facts sit in one row of three on a narrow screen, so none is left alone on a row.

## 1.8.1

### Patch Changes

- 261fb0c: `getBudgetPace` in `spend.tsx` takes an optional `projected`, so its status can follow a forecast of your own.
- ac8fed7: Stat Group: a row of stats takes its columns from how many stats it holds (`getStatColumns`), so the columns are equal and no stat sits alone on a row at any width. Phones show one column. Stat Group 1 uses it.

## 1.8.0

### Minor Changes

- 8db2bbc: Every block now formats money, numbers and dates through `format.ts`, so the same value reads the same way in every block.
  
  - `formatCurrency` takes a `precision`: `'whole'` (the default) for totals and KPIs, `'exact'` for amounts paid, owed or priced (`$49.00` beside `$2,240.00`), and `'fine'` for costs per request. Amounts in billing, invoice, table and stat blocks now show their cents on every row.
  - `formatDate(date, style, timeZone)` formats a date or time in a named style (`'day'`, `'date'`, `'time'`, `'clock'` and more), and `formatDateRange`, `formatRelativeTime`, `formatRelativeDays`, `formatDayHeading`, `formatList`, `formatOrdinal`, `zonedParts`, `resolveTimeZone` and `formatTimeZoneOffset` join them. Settings, Team, Alerts, Schedule, Calendar and Activity Feed use these in place of their own helpers, which are gone.
  - Lists of names join with a serial comma ("Ana, Ben, and Cy").

## 1.7.0

### Minor Changes

- 1e95018: App Shell 01's workspace switcher can open another workspace for real: pass `workspaceId` for the one that's open and `onWorkspaceChange` to open another, and `onCreateWorkspace` adds "New workspace…". Session Ended (Error Pages 05) takes `reason='signed-out'` for someone who signed out themselves, titled "You’re signed out".
- 31a9580: Command Menu: `panel` shows something between the search field and the results, such as an answer to what was typed, and an item with `keepOpen` leaves the menu open when picked. App Shell 01 takes `searchPlaceholder` for its search button.
- dcdba72: Comments' composer says why it kept a comment: `onSubmit` can resolve to a message, which shows under the field as an error and keeps what was typed, and submitting nothing says "Write something first." (set it with `emptyMessage`). The field's description now points at the error. Activity Feed exports `activityToneColors`, the colour of each tone for charts, and Chart exports `chartNiceTicks`, round ticks from 0 with room above the largest value.
- cd8a3b7: Settings: a connection's status can now be `importing` or `revoked` (access removed), and `ConnectionRow` draws one connection with its logo, status, description and actions. Settings 04 uses it and offers Reconnect for a revoked one. Settings 03 takes `unavailable` on a channel that can't send yet, such as Slack before it's connected: its switches turn off and the reason, which can hold a link, shows above the table. App Shell 01 takes a `banner`, shown across the top of every page under the header.
- 760591e: Data Table's `DataTableFacetFilter` now takes the table and a column id, `<DataTableFacetFilter table={table} columnId='status' />`, in place of `column={table.getColumn('status')}`. With the React Compiler on, a picked filter now shows as ticked in its menu, with a count on its button. Data Table 06 and Files 02 use the new props.
- ba2a895: `format.ts` exports `formatDay`, which writes `Dec 14` for a day in the current year and `Dec 14, 2026` otherwise. Data Table exports `DataTableRowTrigger`, a button that makes the whole row open a record. Table cells pad `0.75rem` at the table's edges too, so the first column no longer sits against the edge; Data Table's `--data-table-inset` now defaults to `0.75rem`, and every block that set it to `0px` leaves it.
- 59754fa: `formatDay` takes an optional time zone, which a `Date` is read in, and `format.ts` exports `dayIn`, the `YYYY-MM-DD` day a time falls on in a zone.
- b538cf7: `InvoiceStatusLabel` in Billing also reads Draft, Void and Uncollectible, so every status Stripe gives an invoice has a label.
- 4a6f360: Every table is drawn with one set of parts, in a new `table` item: `DataTable`, `DataTableRow`, `DataTableHead`, `DataTableCell` and the rest move there from Data Table, which builds on them, so import them from `@/components/dashboardblocks/table`. A table without sorting or filtering no longer installs TanStack Table. New parts: `DataTableRowHead` for the cell that names its row, `DataTableGroupHead` for a label over a group of rows, and `DataTableFooter`, with `sticky` columns. `DataTable` takes a `caption` and `density='compact'`, `DataTableRow` takes `highlighted`, and `align` takes `'center'`. Alignment and edge padding follow the reading direction.
  
  Tables no longer restack into labelled cards on narrow screens. Every `DataTable` scrolls sideways once it's wider than its card, and keyboard users can then tab to it; its caption names the scrolling region. `DataTableSortMenu`, the `label` prop on cells, and the `hideLabelWhenStacked` and `sortLabels` column options are gone, since the column headers always show.
  
  The tables in AI Usage, Breakdown, Chart Panel, Comparison, Funnel, Geo, Inventory, Invoice, Settings and Team use them, so their cells pad the table's edges and line up the same way as every other table; Breakdown exports `BreakdownTable`, the share table under a breakdown bar or a donut. Region health (`status-04`) and the product leaderboard (`leaderboard-04`) are tables now, and the notification and permission matrices scroll sideways from the keyboard.
- 074cb34: New Option Select: one value from a list of options, with a placeholder, on shadcn's Select, so its open list follows your style and font instead of the browser's. Forms 01, 02 and 03, Onboarding 03 and 04, the onboarding invite list, Security 06, Settings 07 and Team 06 use it instead of a native select. `useSimpleForm` gains `select(name)`, the props for an Option Select in the form.
- 5dbb164: Page Header 01 takes `createLabel` to rename its main action, or `null` to leave it out, and `exportLabel` to name what Export saves. Chart Panel's legend keys take a `dashed` shape, for an average or target line, and `chart.tsx` exports `chartReferenceColor`, the colour of a goal or average line, for its legend key. App Shell’s workspace menu draws each logo in an outline, so it stays visible on the highlighted item.
- 074cb34: Page Header 01 takes `exportLabel={null}` to leave Export out. Billing 03 shows its Download column only when you pass `onDownload`. Settings 07's `onSave` can resolve to field errors (`{ email: 'That email is taken.' }`), which show under their fields, and a save that throws says so under the form. Settings 07 shows Upload photo only when you pass `onAvatarChange`. Settings 03's `onChange` can be async: resolve to `{ status: 'error', message }`, or throw, and the switches it changed go back and the message shows under the table.
- 8ad0723: Statuses are badges: `StatusLabel` draws a thin border, a dot and the word by default, and takes `variant='text'` for a status inside a sentence and `indicator` for a mark of its own, such as the icon on a connection's status in Settings. Warnings are orange instead of amber, which read brown. `UrgencyBadge`, `UsageStatusBadge` and `GaugeToneBadge` are removed; use `UrgencyLabel`, `UsageStatusLabel` and `GaugeToneLabel`.
- dcdba72: Table: `DataTableBar` takes `fillClassName`, to colour the fill with classes such as a status tone's instead of `color`.
- dcdba72: Table exports `DataTableRowLink`, a link that makes the whole row go to a page, as `DataTableRowTrigger` makes it open a panel. Buttons, links and check boxes in the same row stay clickable above it. `DataTableListItem` does the same for a row in a list. Files 02's file names and Record Detail 01's orders use it, so the whole row opens the file or the order.

### Patch Changes

- 17313db: Retention and Heatmap 2: the cohort table's Average row shows the average cohort size, not the total of every cohort. Team 5's permission column scrolls with the rest of the table on a narrow screen.
- dcdba72: Invoice: `getTotalRows` leaves out Subtotal when nothing comes between it and the total (no discount, tax or shipping), so a one-line invoice shows its total once.
- 31a5994: Blocks no longer end with a line, so two blocks stacked on a page never draw a double line between them. Page Header, Dashboard Header, the headers of Dashboards 1 to 5 and the Notifications title row have no line under them, and lists drop the line after their last row. Geo 2 and Leaderboard 1, 2, 3 and 5 now have a line under their title, like the rest of their families.
- 96c35a8: `DataTableRowTrigger` and `DataTableRowLink` take `truncate={false}`, so a long name in a list row can wrap instead of ending in an ellipsis. Rows keep the ellipsis by default.
- 2e79c29: Data Table: the select-all checkbox shows ticked, not mixed, once every row on the page is ticked. Command Menu: clicking an item with `keepOpen` leaves focus in the search field, so typing carries on. Data Table's `empty` shows in the block's empty state too. Page Header's `ActionsMenu` takes a text trigger as its children, and items with an `href` and a `badge`. Page Header's `PageTabs` and App Shell's `TopNav` put the links that don't fit under More, and keep the current one in the row, instead of scrolling with a hidden scrollbar. Both use the new `TabLinks`.

## 1.6.2

### Patch Changes

- d754669: `BlockStateProvider` takes a `state` instead of `status` and `empty`, and `getBlockState(status, data)` works it out from the block's data: empty when the data is left out, `null`, `''` or an empty list. If your own code wraps blocks in `BlockStateProvider`, change `status='loading'` to `state='loading'`. What you pass to each block doesn't change.

## 1.6.1

### Patch Changes

- 1622056: Dashboards take `empty` and show every block's empty state, so a dashboard can be previewed with no data, as each block can.
  
  "No data" and "Couldn’t load" are the same size and wording in every block: 20px, light. Lists and tables no longer say "Couldn’t load the data."

## 1.6.0

### Minor Changes

- b59a430: Every block is redesigned in one house style. Blocks drop their cards for rules and space, headline numbers are large and light, and a change reads as a sentence ("Up 20.1% from $37,660 last month") instead of a badge. Status is a coloured word instead of a pill. Main charts carry a goal line, the previous period, a forecast or an average, and every chart shows the same tooltip.
  
  Every data block takes `status?: 'loading' | 'error'` and shows its own skeleton or error message. With no data it shows its empty state.
  
  New blocks and parts:
  
  - `kpi-04`: a value with its change and a button that shows the date range, filters and query behind the number. It uses the new `kpi-provenance`.
  - `format`: number, money, percentage and date range formatters, all in `en-US`, so server and browser render the same text.
  - `status-label`: a status word with a tone (`good`, `warning`, `bad`, `info` or `neutral`).
  - `details`: two or three short facts on one line, joined by a dot that screen readers skip.
  - `use-reveal`: grows bars in when they scroll into view.
  
  Blocks you already installed keep working. Run `npx shadcn add` again to get the new look.

## 1.5.5

### Patch Changes

- 7063367: The README's screenshot now shows on sites that display it outside GitHub, such as shadhub.dev.

## 1.5.4

### Patch Changes

- 955b297: This repository is now a GitHub registry, so you can install any block with `npx shadcn add LGLabGreg/dashboardblocks/<name>`. You get the same copy as `@dashboardblocks/<name>`, for your project's base.

## 1.5.3

### Patch Changes

- 5c785a7: Timeline 2's milestones take an optional date. A milestone without one, such as a step that waits on an event rather than a day, shows no date.
  
  Its status icons now stay beside the milestone's name when the description wraps.

## 1.5.2

### Patch Changes

- b317095: AI Assistant's suggested questions and its conversation no longer fade out at the edges.

## 1.5.1

### Patch Changes

- 3e6b0c0: AI Assistant shows the assistant's avatar at the top of its reply instead of the bottom. Code in a reply, and the technical details on Error Pages, no longer fade out at the edges.

## 1.5.0

### Minor Changes

- 053f070: AI Assistant's log is built on shadcn's Message Scroller, which installs with it and adds the `@shadcn/react` package. A new question (and one you retry or regenerate) moves to the top of the log and its reply grows below it, a saved conversation opens at its last question, and the log stops following a reply when you select text in it, as it already did when you scroll up. Screen readers still hear each reply once, when it's done.
  
  `ChatMessage` now has to render inside `ChatMessages`: wrap a message you show on its own in one.
- 38b04a0: AI Assistant is built on shadcn's Message, Bubble, Marker and Attachment, so it takes your style's chat look: the question is a Bubble, the typing indicator says "Thinking…" with a spinner, a failed reply is a destructive Bubble, suggested prompt chips are outline buttons in a row that scrolls sideways, and the context chip is an Attachment.
  
  Breaking: the message formatter `MessageContent` is renamed `ChatMessageContent`, since shadcn's Message exports a `MessageContent` of its own.
- 73bcdf8: AI Assistant's code and the details on the Something Went Wrong error page use shadcn's Code Block, so they take your style. Code in a reply is highlighted as it streams, SQL included. Both now install `code-block`, which adds the `shiki` package to your project.

### Patch Changes

- 410c228: Every block's registry item has a description saying what it shows, so shadcn's MCP server finds blocks by what you ask for. New docs page: [MCP server](https://www.dashboardblocks.com/docs/mcp), on letting Claude Code, Cursor, VS Code, Codex or OpenCode find and install blocks.
- f7d3223: Code in AI Assistant and the error details in Error Pages read left to right on right-to-left pages, and AI Assistant's spacing and alignment follow the page's direction.
- 73b0965: `TinyBarChart`, `TinyLineChart` and `TinyAreaChart` take a `label`, which names the chart for keyboard and screen reader users while its keyboard layer is on.

## 1.4.1

### Patch Changes

- 4b674d3: Days outside the month in the calendar and schedule month views (hovered ones included), past events in the calendar, and billing-05's billing period toggle now meet AA contrast in both themes. In the calendar's week and day views, an event that a later one overlaps shows only the lines the later event leaves uncovered, so its time no longer sits under the other event's title. billing-05's price summary is valid description list markup once you pick another plan or period.
- c504493: Blocks ship with fewer comments. Prop docs fit on one line, comments that only described the code are gone, and every remaining lint suppression says why it's there.
- cdce6f6: `useBlockState` shows a load's data or error in a transition, and the quote in `invoice-03` shows its accepted or declined state the same way, so with a Server Action the result shows together with the page's refreshed data.
- e45514d: Accessible names now contain the text a control shows, so voice control can reach it by what it says: the search button in App Shell and Command Menu, the account menu in App Shell, the rows-per-page menu in Data Table, the tiles in Geo's tile map, and events in Calendar.
- 98bd49f: Neutral badges and counts on a muted background now use the foreground colour, so their small text passes AA contrast in every style: the billing block's Due badge, the neutral or on-track badges in gauge, goals, insights, schedule, spend and status, the kanban WIP count and neutral card labels (and activity-feed's neutral tone), the SLA badge in kanban-03, comparison-02's result badge, funnel-03's step numbers, and a selected or hovered event's time in the calendar. `EventRow` takes a `selected` prop that tints the row and keeps its small text readable on the tint. Small avatar stacks no longer overlap, so each person's initials stay readable. activity-feed-04's counts are valid description list markup.
- c5bd598: Command Menu's ⌘K, App Shell's search shortcut and the Escape that cancels a Kanban drag now work while a control that stops key events has focus, such as a React Aria sidebar link.

## 1.4.0

### Minor Changes

- 9a22fe6: Block catalog: every block's registry item now has a `meta` field saying what it shows, its size, the blocks it's often used with, the component to import and the props it takes. All of it is also in one file, `/r/catalog.json`, for coding agents that build dashboards from the blocks.

### Patch Changes

- ae8de94: App Shell 01, 02 and 03: a wide header or table no longer makes the whole page scroll sideways. In App Shell 02, "New report" shows as an icon when the content area is narrow, so the page fits at tablet widths with the sidebar open.
- d76a918: Dashboard Header, Goals 01 and Forecast 02: date ranges render the same text on the server and in every browser, so server-rendered pages no longer fail hydration in browsers whose date formatting spaces the dash differently. Ranges now use plain spaces around the dash ("Sep 10 – Oct 9").
  
  Dashboard Header: a filter chip's field name is no longer muted, so it meets contrast on the chip's background.
- 3741faa: Blocks that wait on a callback (sending a reminder, posting a comment, deleting a file, verifying a code, saving a field) now show the result in a transition. When you pass a Server Action, the result shows together with the page's refreshed data instead of just before it.
- ccf10a6: Billing: in the MRR movement waterfall, a contraction or churn of $0 keeps its red swatch instead of turning green.
- 7add9f5: AI Assistant and Files: leaving a page in the middle of a reply or an upload no longer leaves it stuck when you come back, in apps that keep visited pages (Next.js with `cacheComponents`). The assistant keeps the reply so far, as Stop does, and you can send again. An upload starts again.
- 75b0b4d: Trend and KPI: an unchanged value's badge is readable in every style's light theme, a badge no longer wraps onto two lines in a narrow card, and a tiny fall shows as 0% rather than -0%.

## 1.3.12

### Patch Changes

- a4a6eaa: The settings block's copy button no longer submits a form it sits in.

## 1.3.11

### Patch Changes

- b00614f: Replace placeholder names in the app shell, command menu, notifications and activity feed examples.

## 1.3.10

### Patch Changes

- 2ac9934: Trim comments in the blocks' source.

## 1.3.9

### Patch Changes

- 63ba697: Blocks now install into their own folders on Windows. The shadcn CLI used to write every block file straight into `components/`, so `activity-feed-01.tsx` landed at `components/activity-feed-01.tsx` instead of `components/dashboardblocks/activity-feed/activity-feed-01.tsx`. The blocks still worked, because the CLI rewrote their imports. Each block file now names its folder, so the CLI writes it to the same place on every system. This needs version 4.7 of the shadcn CLI or later.

## 1.3.8

### Patch Changes

- 175edd1: Page Header, App Shell, Pipeline, Geo and Leaderboard: small counts, initials and rank labels on a muted background now use the foreground colour, so they pass colour contrast in the light theme. Team: the "+N" circle in an avatar stack does too.
- 17f9c07: Security 05's code step and Settings 02's new-key panel no longer tint the box around their error text, so the red text meets contrast in light themes.
- cd74c74: Kanban: the board's scrolling region now holds its columns' screen-reader labels, so the card no longer has hidden room to scroll sideways (784px at 360px in Kanban 01). Animated wave: the wave is `aria-hidden` and ignores the pointer, as a decorative layer should. Neither changes how they look.
- 30fea13: The KPI chart blocks no longer leave a tab stop that screen readers can't see. Each chart is labelled as one image, but Recharts made it focusable inside that image by default. `TinyBarChart`, `TinyLineChart` and `TinyAreaChart` take an `accessibilityLayer` prop, and the KPI blocks turn it off. Hover tooltips still work.
- a5a8b8e: Blocks now pass `eslint .` in a new Vite project, as they do in Next.js: Calendar, Geo and Dashboard 05 had small lint errors, fixed without changing what they do. App Shell installs its own `hooks/use-mobile.ts`, which replaces the one that comes with the sidebar and no longer sets state in an effect.
- 8f9e496: Blocks no longer change the colours of your shadcn components, so they match the same components elsewhere in your app. Avatar initials, keyboard hints, icon buttons and badges use your style's own colours. Data Table 05 and 06 show failed and past-due rows as a destructive badge. Settings 02 marks unused keys with an amber dot, Settings 06 drops the red ring around the danger zone, and Comments 04's internal badge is plain.
- e0bc829: Record detail 01 and 02 and the invoice's line items table now show their rows with React Aria. They used the shadcn `Table`, which in React Aria is a grid that renders no rows without a row header column. They're plain tables now, and look the same. Record detail 01 and 03's avatar initials also meet colour contrast, and record detail 02's items and the line items table scroll as a named region you can reach with Tab.
- 0462c18: Data table: the sort menu names a date column's orders "Oldest first" and "Newest first", where it said "A to Z" and "Z to A" for ISO date strings and "High to low" for `Date` values. A date held as a number, or a column you want worded differently, takes `meta.sortLabels`.

## 1.3.7

### Patch Changes

- 69c5885: AI Assistant: in example 01's panel, a welcome taller than the panel now scrolls from its top. It was centred, which cut off the greeting with no way to scroll up to it.
- e64710a: App Shell: on the collapsed rail, the brand and the workspace switcher no longer show a tooltip. It opened over the header's sidebar toggle, and stayed open while the pointer moved onto it, so the toggle couldn't be clicked. Nav items and the user menu keep theirs.
  
  Forms: `FormSheet`'s fields now line up with its title and buttons in every style. The body had a fixed 16px inset, while Maia, Mira, Luma, Rhea and Sera pad the sheet's header and footer by 24px or 32px.
- 6b853ff: Auth 04: screen readers now announce the status line under the form when it first shows a message. It was hidden while empty, which keeps a status region out of the accessibility tree, so its first message often went unread.
- aba4a78: Retention: `CohortTable` takes an optional `describeCell` to phrase the readout for a hovered cell, and `scaleMin` to set the share that gets the faintest colour, for tables whose shares sit in a narrow band, such as revenue around 100%. Without them, nothing changes. When it scrolls sideways (with `minWidth`), keyboard users can now focus the table and scroll it; it's named by its caption.
- 42318b5: Data table: a column's `sortLabels` meta names its orders in the sort menu, such as "Newest first" and "Oldest first" for a date, listed in the column's first sort direction. The "Signed up" column in data-table-06 uses it; it read "A to Z" before. Without it, nothing changes.

## 1.3.6

### Patch Changes

- 39823df: Comments: the initials in an avatar without a picture are easier to read. They were grey on a grey background, below WCAG's 4.5:1 contrast, in styles such as Nova. A long author name cut short shows in full on hover.
- 78ccc1c: Data Table: Clear filters, in the empty row, now uses the same text colour as other buttons. It was grey, like the message above it, and below WCAG's 4.5:1 contrast in Maia's light theme.
- 63b56d0: Data Table: when the table restacks in a narrow card, a long name in a truncating column now ends in an ellipsis instead of being cut off mid-word.
- 5333356: Block forms now have `method='post'`. Submitted before the page hydrates (on a slow connection in Next.js, say), they post to the same page instead of sending a GET, so fields you name when you connect a form to your API stay out of the URL. After hydration they work as before. Error Pages 04's "Notify me" moves focus to the email field when it's empty.
- 379779c: Page Header: `PageHeaderHeading` takes `wrap`, so a long title such as a record's name wraps onto more lines instead of being cut short. The back link's arrow keeps its size when its label wraps.
- 059393b: Command Menu and App Shell: the search button's label and ⌘K hint are easier to read. They were grey on a grey background, below WCAG's 4.5:1 contrast, in styles such as Maia and Nova. The ⌘K handler no longer throws on the key events Chrome's autofill sends, which have no key.
- d54b1bf: Data Table: on narrow screens, where rows stack into cards, the row checkbox lines up with the card's other content. It sat 15px further right, and its tap area reached past the card.

## 1.3.5

### Patch Changes

- ab818ee: App Shell on React Aria: Escape closes the mobile sidebar again when focus is on a link, the workspace switcher or the user menu, and the brand and workspace switcher leave room for the sheet's close button instead of sitting under it.

## 1.3.4

### Patch Changes

- e1c95ff: Data Table on React Aria: the Columns menu shows and hides a column again when the table's column visibility is kept outside it, such as in the URL. Each pick changed every column one at a time, and the last change undid the others.
- 687e1ba: `Link` no longer fails `eslint-plugin-react-hooks`' `static-components` rule (in `eslint-config-next`), which took the link component it reads from `LinkProvider` for one created during render.

## 1.3.3

### Patch Changes

- 14e5175: App Shell's `WorkspaceSwitcher` names the current workspace's item "(current)" for screen readers, which can't see its check mark, and its create item reads "New workspace…", since it opens a form. In React Aria, its menu stops at 18rem wide, so a long workspace name wraps instead of stretching the menu across the page.
- e32db22: Data Table's `DataTablePagination` takes an optional `selectedCount`, for a selection that reaches beyond the page, such as every row matching a server query. Without it, the footer counts the rows selected on the page, as before.
- 8b2f44e: Data Table's `createDataTableSelectColumn` takes an optional `getRowLabel`, which names each row's checkbox after the row ("Select Northwind") so a screen reader can tell the rows apart. Without it, or for a row whose label is empty, the checkbox reads "Select row". The Customers and Files examples pass it.

## 1.3.2

### Patch Changes

- ea5cb02: Data Table's facet filter options take an optional `count`. Pass it when your server filters and the table holds one page, so each value shows its count across every row instead of the rows on that page.
- 6eadf59: Data Table keeps focus in the table: Next on the last page hands focus to Previous (and Previous on the first page to Next), and Reset, Clear filters and the selection bar's Clear move focus to the table instead of the page. Picking another column in the sort menu sorts it in that column's own first direction, as its header does. The Customers example's CSV export writes values that start with `=`, `+`, `-` or `@` as text, so a spreadsheet doesn't run them as formulas, and quotes values with a carriage return. Block State's `BlockBusy` announces its label to screen readers: its status region now sits outside the busy element.
- 1e8fdcb: Data Table's pagination writes the range with thousands separators: "1–100 of 2,400" instead of "1–100 of 2400".
- 421c32a: Trend, Leaderboard 01 and Leaderboard 04 are client components, so they render from a Server Component with any icon library. With Phosphor they used to fail to load there. A Server Component can no longer pass Trend a `formatter`: render it from a client component to format the change.
  
  App Shell's sidebars work on Radix without a `TooltipProvider` of your own: the navigation, brand, workspace switcher and user menu bring their own. When the sidebar collapses to icons, the brand, workspace switcher and user menu show their name in a tooltip, as the navigation does. The user menu's email meets AA contrast on the open trigger.
  
  On Radix, block menus are no longer modal, so an open menu doesn't hide the rest of the page from screen readers. The page behind it now scrolls and takes clicks.
- 1af0486: Settings' `SettingsRow` breaks a long unbroken word in its description, such as a long workspace name, instead of pushing the page wider than the screen.

## 1.3.1

### Patch Changes

- 39a9e2b: App Shell's user avatars show their initials in the foreground colour, so they meet AA contrast on the avatar's muted fill. Long breadcrumbs truncate on one line, parents first, with the full text on hover, and a parent without a link is no longer marked as the current page.

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
