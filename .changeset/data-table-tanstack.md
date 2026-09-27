---
'dashboardblocks': minor
---

Data Table is now built on TanStack Table v9. `useDataTable` and `DataTableContent` add sorting (with multi-sort), search, facet filters with counts, pagination with page sizes, row selection with a selection bar for bulk actions, and column visibility, laid out from each column's `meta`. New example: Full Featured.

Breaking: `useTableSort` and `DataTableSortHead` are removed, and `DataTableSortMenu` and `DataTablePagination` now take a `table` from `useDataTable`. The layout primitives (`DataTable`, `DataTableRow`, `DataTableCell`…) are unchanged.
