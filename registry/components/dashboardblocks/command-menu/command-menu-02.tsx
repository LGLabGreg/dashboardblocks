'use client'

import {
  CommandMenu,
  type CommandMenuGroup,
  CommandMenuTrigger,
} from '@/registry/components/dashboardblocks/command-menu'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useRef, useState } from 'react'

interface CommandMenu2Props {
  recent: CommandMenuGroup
  search?: (query: string) => Promise<CommandMenuGroup[]>
  onNavigate?: (href: string) => void
}

const customerIcon = (
  <IconPlaceholder
    lucide='CircleUserRoundIcon'
    tabler='IconUserCircle'
    hugeicons='UserCircle02Icon'
    phosphor='UserCircleIcon'
    remixicon='RiUserLine'
  />
)

const orderIcon = (
  <IconPlaceholder
    lucide='ShoppingCartIcon'
    tabler='IconShoppingCart'
    hugeicons='ShoppingCart01Icon'
    phosphor='ShoppingCartIcon'
    remixicon='RiShoppingCartLine'
  />
)

const customers = [
  { email: 'jonas@northwind.io', id: 'c1', name: 'Jonas Weber' },
  { email: 'priya@lumen.dev', id: 'c2', name: 'Priya Nair' },
  { email: 'mateo@fieldnote.co', id: 'c3', name: 'Mateo Silva' },
  { email: 'sam@relay.dev', id: 'c4', name: 'Sam Rivera' },
  { email: 'lena@northwind.io', id: 'c5', name: 'Lena Fischer' },
]

const orders = [
  { customer: 'Jonas Weber', id: '1042', total: '$652.22' },
  { customer: 'Priya Nair', id: '1041', total: '$89.00' },
  { customer: 'Sam Rivera', id: '1038', total: '$1,210.00' },
  { customer: 'Mateo Silva', id: '1031', total: '$94.50' },
]

const exampleProps: CommandMenu2Props = {
  recent: {
    heading: 'Recently viewed',
    items: [
      {
        description: 'jonas@northwind.io',
        href: '/customers/c1',
        icon: customerIcon,
        id: 'recent-c1',
        label: 'Jonas Weber',
      },
      {
        description: 'Priya Nair · $89.00',
        href: '/orders/1041',
        icon: orderIcon,
        id: 'recent-1041',
        label: 'Order #1041',
      },
    ],
  },
}

async function searchRecords(query: string): Promise<CommandMenuGroup[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const needle = query.toLowerCase()
  const groups: CommandMenuGroup[] = [
    {
      heading: 'Customers',
      items: customers
        .filter((customer) =>
          `${customer.name} ${customer.email}`.toLowerCase().includes(needle),
        )
        .map((customer) => ({
          description: customer.email,
          href: `/customers/${customer.id}`,
          icon: customerIcon,
          id: customer.id,
          label: customer.name,
        })),
    },
    {
      heading: 'Orders',
      items: orders
        .filter((order) =>
          `#${order.id} ${order.customer}`.toLowerCase().includes(needle),
        )
        .map((order) => ({
          description: `${order.customer} · ${order.total}`,
          href: `/orders/${order.id}`,
          icon: orderIcon,
          id: `order-${order.id}`,
          label: `Order #${order.id}`,
        })),
    },
  ]
  return groups.filter((group) => group.items.length > 0)
}

const CommandMenu2 = (props: CommandMenu2Props) => {
  const [opened, setOpened] = useState<string | null>(null)
  const {
    onNavigate = (href: string) => setOpened(href),
    recent,
    search = searchRecords,
  } = props
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CommandMenuGroup[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const latest = useRef(0)

  function changeQuery(next: string) {
    setQuery(next)
    clearTimeout(timer.current)
    const request = ++latest.current
    if (!next.trim()) {
      setLoading(false)
      setResults([])
      return
    }
    setLoading(true)
    timer.current = setTimeout(() => {
      void search(next.trim()).then((groups) => {
        if (request !== latest.current) return
        setResults(groups)
        setLoading(false)
      })
    }, 250)
  }

  return (
    <div className='flex flex-col items-center gap-3'>
      <CommandMenuTrigger
        onClick={() => setOpen(true)}
        placeholder='Search customers and orders…'
        shortcut={null}
      />
      <p role='status' className='text-muted-foreground min-h-5 text-sm'>
        {opened && `Opened ${opened}`}
      </p>
      <CommandMenu
        open={open}
        onOpenChange={setOpen}
        query={query}
        onQueryChange={changeQuery}
        groups={query.trim() ? results : [recent]}
        loading={loading}
        onNavigate={onNavigate}
        placeholder='Search customers and orders…'
        emptyMessage='No customers or orders match.'
      />
    </div>
  )
}

export { CommandMenu2, exampleProps as commandMenu2ExampleProps, type CommandMenu2Props }
