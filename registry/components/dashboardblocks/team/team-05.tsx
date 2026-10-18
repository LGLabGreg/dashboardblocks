'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { SaveBar } from '@/registry/components/dashboardblocks/forms'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { Fragment, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'

import { cn } from '@/lib/utils'

interface PermissionRole {
  id: string
  /** Has every permission and can't be edited, like a workspace owner. */
  locked?: boolean
  members: number
  name: string
}

interface Permission {
  description?: string
  id: string
  label: string
  requires?: string
}

interface PermissionGroup {
  id: string
  label: string
  permissions: Permission[]
}

/** `grants[roleId]` lists the permission ids that role has. */
type PermissionGrants = Record<string, string[]>

interface Team5Props {
  description: string
  /** Leave out, with `roles`, to show the empty state. */
  grants?: PermissionGrants
  groups: PermissionGroup[]
  onSave?: (grants: PermissionGrants) => void
  /** Leave out, or pass none, to show the empty state. */
  roles?: PermissionRole[]
  status?: BlockStatus
  title: string
}

interface PermissionMatrixProps extends Omit<Team5Props, 'grants' | 'roles' | 'status'> {
  grants: PermissionGrants
  roles: PermissionRole[]
}

const exampleProps: Team5Props = {
  description: 'Choose what each role can do. Changes apply to everyone with the role.',
  grants: {
    admin: [
      'dashboards.view',
      'dashboards.edit',
      'dashboards.delete',
      'dashboards.share',
      'data.view',
      'data.connect',
      'data.export',
      'members.view',
      'members.invite',
      'members.roles',
      'billing.view',
    ],
    analyst: [
      'dashboards.view',
      'dashboards.edit',
      'dashboards.share',
      'data.view',
      'data.export',
      'members.view',
    ],
    member: ['dashboards.view', 'dashboards.edit', 'data.view', 'members.view'],
    viewer: ['dashboards.view'],
  },
  groups: [
    {
      id: 'dashboards',
      label: 'Dashboards',
      permissions: [
        { id: 'dashboards.view', label: 'View dashboards' },
        {
          id: 'dashboards.edit',
          label: 'Create and edit',
          requires: 'dashboards.view',
        },
        { id: 'dashboards.delete', label: 'Delete', requires: 'dashboards.edit' },
        {
          description: 'Invite people and create public links',
          id: 'dashboards.share',
          label: 'Share',
          requires: 'dashboards.view',
        },
      ],
    },
    {
      id: 'data',
      label: 'Data',
      permissions: [
        { id: 'data.view', label: 'View data sources' },
        {
          description: 'Add, edit and remove connections',
          id: 'data.connect',
          label: 'Manage connections',
          requires: 'data.view',
        },
        { id: 'data.export', label: 'Export to CSV', requires: 'data.view' },
      ],
    },
    {
      id: 'members',
      label: 'Members',
      permissions: [
        { id: 'members.view', label: 'View members' },
        { id: 'members.invite', label: 'Invite and remove', requires: 'members.view' },
        { id: 'members.roles', label: 'Change roles', requires: 'members.invite' },
      ],
    },
    {
      id: 'billing',
      label: 'Billing',
      permissions: [
        { description: 'Plan, usage and invoices', id: 'billing.view', label: 'View' },
        {
          id: 'billing.manage',
          label: 'Change plan and payment',
          requires: 'billing.view',
        },
      ],
    },
  ],
  roles: [
    { id: 'owner', locked: true, members: 1, name: 'Owner' },
    { id: 'admin', members: 2, name: 'Admin' },
    { id: 'analyst', members: 4, name: 'Analyst' },
    { id: 'member', members: 12, name: 'Member' },
    { id: 'viewer', members: 7, name: 'Viewer' },
  ],
  title: 'Roles and permissions',
}

function grantWithRequirements(
  granted: Set<string>,
  id: string,
  byId: Map<string, Permission>,
) {
  for (let next: string | undefined = id; next && !granted.has(next);) {
    granted.add(next)
    next = byId.get(next)?.requires
  }
}

function revokeWithDependents(granted: Set<string>, id: string, all: Permission[]) {
  granted.delete(id)
  for (const permission of all) {
    if (permission.requires === id && granted.has(permission.id))
      revokeWithDependents(granted, permission.id, all)
  }
}

function PermissionMatrix(props: PermissionMatrixProps) {
  const { description, groups, onSave, roles, title } = props
  const [saved, setSaved] = useState(props.grants)
  const [grants, setGrants] = useState(props.grants)

  const all = groups.flatMap((group) => group.permissions)
  const byId = new Map(all.map((permission) => [permission.id, permission]))
  const editable = roles.filter((role) => !role.locked)

  const has = (source: PermissionGrants, roleId: string, permissionId: string) =>
    source[roleId]?.includes(permissionId) ?? false

  const changes = editable.reduce(
    (count, role) =>
      count +
      all.filter(
        (permission) =>
          has(grants, role.id, permission.id) !== has(saved, role.id, permission.id),
      ).length,
    0,
  )

  const toggle = (roleId: string, permissionId: string, on: boolean) => {
    setGrants((current) => {
      const granted = new Set(current[roleId] ?? [])
      if (on) grantWithRequirements(granted, permissionId, byId)
      else revokeWithDependents(granted, permissionId, all)
      return { ...current, [roleId]: all.map((p) => p.id).filter((p) => granted.has(p)) }
    })
  }

  const locked = roles.filter((role) => role.locked).map((role) => role.name)

  return (
    <section className='@container flex flex-col gap-3'>
      <header className='flex flex-col gap-0.5'>
        <h2 className='font-semibold tracking-tight'>{title}</h2>
        <p className='text-muted-foreground text-sm'>
          {description}
          {locked.length > 0 &&
            ` ${locked.join(' and ')} ${locked.length === 1 ? 'can' : 'can each'} do everything.`}
        </p>
      </header>
      <form
        method='post'
        onSubmit={(event) => {
          event.preventDefault()
          setSaved(grants)
          onSave?.(grants)
        }}
      >
        <div className='overflow-x-auto border-t'>
          <table className='w-full text-sm'>
            <caption className='sr-only'>{title}</caption>
            <thead>
              <tr className='border-b'>
                <th
                  scope='col'
                  className='bg-background sticky left-0 z-10 min-w-40 py-2.5 pr-4 text-left font-medium'
                >
                  <span className='sr-only'>Permission</span>
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    scope='col'
                    className='min-w-20 px-2 py-2.5 text-center font-medium'
                  >
                    <div className='flex flex-col items-center'>
                      {role.name}
                      <span className='text-muted-foreground inline-flex items-center gap-1 text-xs font-normal whitespace-nowrap tabular-nums [&_svg]:size-3'>
                        {role.locked && (
                          <IconPlaceholder
                            lucide='LockIcon'
                            tabler='IconLock'
                            hugeicons='SquareLock02Icon'
                            phosphor='LockIcon'
                            remixicon='RiLockLine'
                            aria-hidden
                          />
                        )}
                        {role.members} {role.members === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <Fragment key={group.id}>
                  <tr className='border-b'>
                    <th
                      scope='colgroup'
                      colSpan={roles.length + 1}
                      className='text-muted-foreground pt-4 pb-1.5 text-left text-xs font-medium'
                    >
                      <span className='sticky left-0'>{group.label}</span>
                    </th>
                  </tr>
                  {group.permissions.map((permission) => (
                    <tr key={permission.id} className='border-b'>
                      <th
                        scope='row'
                        className='bg-background sticky left-0 z-10 py-2.5 pr-4 text-left font-normal'
                      >
                        <span className='block'>{permission.label}</span>
                        {permission.description && (
                          <span className='text-muted-foreground block text-xs'>
                            {permission.description}
                          </span>
                        )}
                      </th>
                      {roles.map((role) => {
                        const on = role.locked || has(grants, role.id, permission.id)
                        const changed =
                          !role.locked && on !== has(saved, role.id, permission.id)
                        return (
                          <td
                            key={role.id}
                            className={cn(
                              'px-2 py-2.5 text-center',
                              changed && 'bg-primary/5',
                            )}
                          >
                            <span className='inline-flex'>
                              <Checkbox
                                aria-label={`${role.name}: ${group.label}, ${permission.label}`}
                                checked={on}
                                disabled={role.locked}
                                onCheckedChange={(next) =>
                                  toggle(role.id, permission.id, next === true)
                                }
                              />
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <SaveBar
          className='mt-4'
          isDirty={changes > 0}
          isSubmitting={false}
          message={`${changes} unsaved ${changes === 1 ? 'change' : 'changes'}`}
          onDiscard={() => setGrants(saved)}
        />
      </form>
    </section>
  )
}

const Team5 = (props: Team5Props) => {
  const { description, grants = {}, roles = [], status, title } = props
  const state = getBlockState(status, roles)

  return (
    <BlockStateProvider state={state}>
      {state ? (
        <section className='@container flex flex-col gap-3'>
          <header className='flex flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </header>
          <BlockStateRows className='border-t' rows={8} />
        </section>
      ) : (
        <PermissionMatrix {...props} grants={grants} roles={roles} />
      )}
    </BlockStateProvider>
  )
}

export {
  Team5,
  exampleProps as team5ExampleProps,
  type Permission,
  type PermissionGrants,
  type PermissionGroup,
  type PermissionRole,
  type Team5Props,
}
