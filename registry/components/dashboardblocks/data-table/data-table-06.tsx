'use client'

import {
  createDataTableColumnHelper,
  createDataTableSelectColumn,
  DataTableContent,
  DataTableFacetFilter,
  type DataTableFacetOption,
  DataTablePagination,
  DataTableReset,
  DataTableSearch,
  DataTableSortMenu,
  DataTableViewOptions,
  useDataTable,
} from '@/registry/components/dashboardblocks/data-table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type CustomerPlan = 'Enterprise' | 'Free' | 'Pro' | 'Team'
type CustomerStatus = 'active' | 'churned' | 'past-due' | 'trial'

interface CustomerRow {
  company: string
  email: string
  id: string
  /** Monthly recurring revenue, in dollars. */
  mrr: number
  plan: CustomerPlan
  seats: number
  /** ISO date. */
  signedUp: string
  status: CustomerStatus
}

interface DataTable6Props {
  description: string
  pageSize?: number
  rows: CustomerRow[]
  title: string
}

const COMPANIES = [
  ['Northwind', 'northwind.io'],
  ['Brightpath', 'brightpath.dev'],
  ['Loop Studio', 'loop.studio'],
  ['Fieldnotes', 'fieldnotes.co'],
  ['Harbor', 'harbor.app'],
  ['Quanta', 'quanta.ai'],
  ['Pinecrest', 'pinecrest.com'],
  ['Juniper Labs', 'juniperlabs.io'],
  ['Sable', 'sable.so'],
  ['Kitefin', 'kitefin.com'],
  ['Mosaic', 'mosaic.design'],
  ['Arcadia', 'arcadia.health'],
  ['Tidewater', 'tidewater.co'],
  ['Emberly', 'emberly.app'],
  ['Cobalt', 'cobalt.sh'],
  ['Wren & Co', 'wren.co'],
  ['Lumen', 'lumen.fm'],
  ['Orbital', 'orbital.dev'],
  ['Parcel', 'parcel.shop'],
  ['Stackwise', 'stackwise.io'],
  ['Verdant', 'verdant.farm'],
  ['Halcyon', 'halcyon.travel'],
]

const PLANS: CustomerPlan[] = ['Pro', 'Team', 'Free', 'Pro', 'Enterprise', 'Team', 'Pro']
const STATUSES: CustomerStatus[] = [
  'active',
  'active',
  'trial',
  'active',
  'past-due',
  'active',
  'churned',
  'trial',
]
const SEAT_PRICE: Record<CustomerPlan, number> = {
  Enterprise: 45,
  Free: 0,
  Pro: 12,
  Team: 24,
}

const exampleProps: DataTable6Props = {
  description: 'All accounts, by monthly recurring revenue',
  pageSize: 8,
  rows: COMPANIES.map(([company, domain], index) => {
    const plan = PLANS[index % PLANS.length]
    const status = STATUSES[(index * 3) % STATUSES.length]
    const seats = plan === 'Free' ? 1 + (index % 3) : 3 + ((index * 7) % 38)
    const month = String(1 + ((index * 5) % 12)).padStart(2, '0')
    const day = String(1 + ((index * 11) % 28)).padStart(2, '0')
    return {
      company,
      email: `billing@${domain}`,
      id: `cus_${(1_042 + index * 37).toString(36)}`,
      mrr: status === 'churned' || status === 'trial' ? 0 : seats * SEAT_PRICE[plan],
      plan,
      seats,
      signedUp: `${index % 3 === 0 ? 2024 : 2025}-${month}-${day}`,
      status,
    }
  }),
  title: 'Customers',
}

const STATUS_CONFIG: Record<
  CustomerStatus,
  { className?: string; icon: React.ReactNode; label: string }
> = {
  active: {
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'Active',
  },
  churned: {
    className: 'text-muted-foreground',
    icon: (
      <IconPlaceholder
        lucide='CircleXIcon'
        tabler='IconCircleX'
        hugeicons='CancelCircleIcon'
        phosphor='XCircleIcon'
        remixicon='RiCloseCircleLine'
        aria-hidden
      />
    ),
    label: 'Churned',
  },
  'past-due': {
    className: 'text-destructive',
    icon: (
      <IconPlaceholder
        lucide='ClockIcon'
        tabler='IconClock'
        hugeicons='Clock01Icon'
        phosphor='ClockIcon'
        remixicon='RiTimeLine'
        aria-hidden
      />
    ),
    label: 'Past due',
  },
  trial: {
    icon: (
      <IconPlaceholder
        lucide='CircleDashedIcon'
        tabler='IconCircleDashed'
        hugeicons='DashedLineCircleIcon'
        phosphor='CircleDashedIcon'
        remixicon='RiLoader2Line'
        aria-hidden
      />
    ),
    label: 'Trial',
  },
}

const STATUS_OPTIONS: DataTableFacetOption[] = (
  ['active', 'trial', 'past-due', 'churned'] as const
).map((status) => ({
  icon: STATUS_CONFIG[status].icon,
  label: STATUS_CONFIG[status].label,
  value: status,
}))

const PLAN_OPTIONS: DataTableFacetOption[] = ['Free', 'Pro', 'Team', 'Enterprise'].map(
  (plan) => ({ label: plan, value: plan }),
)

const dateFormat = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

const columnHelper = createDataTableColumnHelper<CustomerRow>()

const columns = columnHelper.columns([
  createDataTableSelectColumn<CustomerRow>(),
  columnHelper.accessor('company', {
    cell: ({ row }) => (
      <>
        <span className='block truncate'>{row.original.company}</span>
        <span className='text-muted-foreground block truncate text-xs font-normal'>
          {row.original.email}
        </span>
      </>
    ),
    enableHiding: false,
    header: 'Customer',
    meta: { primary: true, truncate: true },
  }),
  columnHelper.accessor('status', {
    cell: ({ getValue }) => {
      const status = STATUS_CONFIG[getValue()]
      return (
        <Badge variant='outline' className={status.className}>
          {status.icon}
          {status.label}
        </Badge>
      )
    },
    enableGlobalFilter: false,
    enableSorting: false,
    header: 'Status',
  }),
  columnHelper.accessor('plan', { header: 'Plan' }),
  columnHelper.accessor('seats', {
    enableGlobalFilter: false,
    header: 'Seats',
    meta: { align: 'end' },
  }),
  columnHelper.accessor('mrr', {
    cell: ({ getValue }) => `$${getValue().toLocaleString('en-US')}`,
    enableGlobalFilter: false,
    header: 'MRR',
    meta: { align: 'end', cellClassName: 'font-medium' },
  }),
  columnHelper.accessor('signedUp', {
    cell: ({ getValue }) => dateFormat.format(new Date(getValue())),
    enableGlobalFilter: false,
    header: 'Signed up',
    meta: { align: 'end' },
    sortDescFirst: true,
  }),
])

const DataTable6 = (props: DataTable6Props) => {
  const { description, pageSize = 8, rows, title } = props
  const table = useDataTable({
    columns,
    data: rows,
    getRowId: (row) => row.id,
    initialState: {
      columnVisibility: { seats: false },
      sorting: [{ desc: true, id: 'mrr' }],
    },
    pageSize,
  })

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <div className='flex flex-wrap items-center gap-2 border-b px-6 py-3'>
        <DataTableSearch table={table} placeholder='Search customers…' />
        <DataTableFacetFilter
          column={table.getColumn('status')}
          options={STATUS_OPTIONS}
        />
        <DataTableFacetFilter column={table.getColumn('plan')} options={PLAN_OPTIONS} />
        <DataTableReset table={table} />
        <div className='ml-auto flex items-center gap-2'>
          <DataTableSortMenu className='@2xl/data-table:hidden' table={table} />
          <DataTableViewOptions className='@max-2xl/data-table:hidden' table={table} />
        </div>
      </div>
      <DataTableContent caption={`${title}: ${description}`} table={table} />
      <DataTablePagination
        className='border-t px-6 py-3'
        pageSizeOptions={[8, 16, 24]}
        table={table}
      />
    </Card>
  )
}

export { DataTable6, exampleProps as dataTable6ExampleProps, type DataTable6Props }
