'use client'

import { BlockMessage } from '@/registry/components/dashboardblocks/block-state'
import {
  type StepState,
  getChecklistProgress,
  StepIndicator,
  stepStateConfig,
} from '@/registry/components/dashboardblocks/checklist'
import { Link } from '@/registry/components/dashboardblocks/link'
import { ActionCard } from '@/registry/components/dashboardblocks/onboarding'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useId } from 'react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface QuickStart {
  badge?: string
  description: string
  duration?: string
  href: string
  icon: ReactNode
  id: string
  title: string
}

interface SetupTask {
  href?: string
  id: string
  state: StepState
  title: string
}

interface HelpLink {
  description: string
  href: string
  icon: ReactNode
  id: string
  title: string
}

interface Onboarding2Props {
  firstName: string
  help: HelpLink[]
  quickStarts: QuickStart[]
  tasks: SetupTask[]
  templatesHref: string
  tourHref: string
  workspace: string
}

const exampleProps: Onboarding2Props = {
  firstName: 'Priya',
  help: [
    {
      description: 'Guides for every data source',
      href: '/docs',
      icon: (
        <IconPlaceholder
          lucide='BookOpenIcon'
          tabler='IconBook'
          hugeicons='BookOpen02Icon'
          phosphor='BookOpenIcon'
          remixicon='RiBookOpenLine'
        />
      ),
      id: 'docs',
      title: 'Documentation',
    },
    {
      description: 'Questions answered by other teams',
      href: '/community',
      icon: (
        <IconPlaceholder
          lucide='MessageCircleIcon'
          tabler='IconMessageCircle'
          hugeicons='BubbleChatIcon'
          phosphor='ChatCircleIcon'
          remixicon='RiChat3Line'
        />
      ),
      id: 'community',
      title: 'Community forum',
    },
    {
      description: 'A 20-minute call with our team',
      href: '/book-a-call',
      icon: (
        <IconPlaceholder
          lucide='HeadphonesIcon'
          tabler='IconHeadphones'
          hugeicons='HeadphonesIcon'
          phosphor='HeadphonesIcon'
          remixicon='RiHeadphoneLine'
        />
      ),
      id: 'call',
      title: 'Book a setup call',
    },
  ],
  quickStarts: [
    {
      badge: 'Recommended',
      description: 'Sync Postgres, Stripe, HubSpot or 40 other sources on a schedule.',
      duration: 'About 3 min',
      href: '/sources/new',
      icon: (
        <IconPlaceholder
          lucide='PlugIcon'
          tabler='IconPlug'
          hugeicons='PlugSocketIcon'
          phosphor='PlugIcon'
          remixicon='RiPlugLine'
        />
      ),
      id: 'connect',
      title: 'Connect a data source',
    },
    {
      description: 'Import a CSV or Excel file for a quick first look.',
      duration: 'About 1 min',
      href: '/import',
      icon: (
        <IconPlaceholder
          lucide='UploadIcon'
          tabler='IconUpload'
          hugeicons='Upload01Icon'
          phosphor='UploadSimpleIcon'
          remixicon='RiUploadLine'
        />
      ),
      id: 'upload',
      title: 'Upload a spreadsheet',
    },
    {
      description: "Click around a coffee chain's sales while your own data syncs.",
      duration: 'No setup',
      href: '/samples/coffee-chain',
      icon: (
        <IconPlaceholder
          lucide='LayoutDashboardIcon'
          tabler='IconDashboard'
          hugeicons='DashboardSquare01Icon'
          phosphor='SquaresFourIcon'
          remixicon='RiDashboardLine'
        />
      ),
      id: 'sample',
      title: 'Explore a sample dashboard',
    },
    {
      description: "Bring in the people who'll build and read dashboards with you.",
      duration: 'About 1 min',
      href: '/settings/members',
      icon: (
        <IconPlaceholder
          lucide='UserPlusIcon'
          tabler='IconUserPlus'
          hugeicons='UserAdd01Icon'
          phosphor='UserPlusIcon'
          remixicon='RiUserAddLine'
        />
      ),
      id: 'invite',
      title: 'Invite your team',
    },
  ],
  tasks: [
    { id: 'workspace', state: 'done', title: 'Create your workspace' },
    {
      href: '/sources/new',
      id: 'source',
      state: 'current',
      title: 'Connect a data source',
    },
    {
      href: '/dashboards/new',
      id: 'dashboard',
      state: 'todo',
      title: 'Build a dashboard',
    },
    { href: '/settings/members', id: 'team', state: 'todo', title: 'Invite your team' },
    { href: '/reports/new', id: 'report', state: 'todo', title: 'Schedule a report' },
  ],
  templatesHref: '/templates',
  tourHref: '/tour',
  workspace: 'Fernhill Coffee',
}

const Onboarding2 = (props: Onboarding2Props) => {
  const { firstName, help, quickStarts, tasks, templatesHref, tourHref, workspace } =
    props
  const id = useId()
  const progress = getChecklistProgress(tasks)

  return (
    <div className='bg-background @container/page flex min-h-svh flex-col'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 sm:p-6 lg:p-8'>
        <header className='flex flex-col gap-4 @3xl/page:flex-row @3xl/page:items-end @3xl/page:justify-between'>
          <div className='flex flex-col gap-1'>
            <p className='text-muted-foreground text-sm'>{workspace}</p>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Welcome, {firstName}
            </h1>
            <p className='text-muted-foreground max-w-prose text-pretty'>
              Your workspace is empty for now. Bring in some data and your first dashboard
              can be ready in minutes.
            </p>
          </div>
          <Link
            href={tourHref}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'self-start @3xl/page:self-auto',
            )}
          >
            <IconPlaceholder
              lucide='CirclePlayIcon'
              tabler='IconPlayerPlay'
              hugeicons='PlayCircleIcon'
              phosphor='PlayCircleIcon'
              remixicon='RiPlayCircleLine'
              data-icon='inline-start'
            />
            Watch the tour
          </Link>
        </header>
        <div className='grid gap-8 @4xl/page:grid-cols-[minmax(0,1fr)_20rem]'>
          <div className='flex flex-col gap-8'>
            <section aria-labelledby={`${id}-start`} className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <h2 id={`${id}-start`} className='font-medium'>
                  Start with your data
                </h2>
                <p className='text-muted-foreground text-sm'>
                  Pick any of these. The others will wait.
                </p>
              </div>
              <ul className='grid gap-4 @2xl/page:grid-cols-2'>
                {quickStarts.map((action) => (
                  <li key={action.id}>
                    <ActionCard
                      badge={
                        action.badge && <Badge variant='secondary'>{action.badge}</Badge>
                      }
                      description={action.description}
                      href={action.href}
                      icon={action.icon}
                      meta={action.duration}
                      title={action.title}
                    />
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby={`${id}-dashboards`} className='flex flex-col gap-4'>
              <h2 id={`${id}-dashboards`} className='font-medium'>
                Dashboards
              </h2>
              <div className='rounded-xl border border-dashed'>
                <BlockMessage
                  icon={
                    <IconPlaceholder
                      lucide='LayoutDashboardIcon'
                      tabler='IconDashboard'
                      hugeicons='DashboardSquare01Icon'
                      phosphor='SquaresFourIcon'
                      remixicon='RiDashboardLine'
                    />
                  }
                  title='No dashboards yet'
                  description='Dashboards you build or start from a template show up here.'
                  action={
                    <Link
                      href={templatesHref}
                      className={buttonVariants({ size: 'sm', variant: 'outline' })}
                    >
                      Browse templates
                    </Link>
                  }
                />
              </div>
            </section>
          </div>
          <aside aria-label='Setup and help' className='flex flex-col gap-6'>
            <Card size='sm'>
              <CardHeader>
                <CardTitle>Set up {workspace}</CardTitle>
                <CardDescription>
                  {progress.done} of {progress.total} done
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col gap-4'>
                <div
                  role='progressbar'
                  aria-label={`Set up ${workspace}`}
                  aria-valuemax={progress.total}
                  aria-valuemin={0}
                  aria-valuenow={progress.done}
                  aria-valuetext={`${progress.done} of ${progress.total} done`}
                >
                  <ProgressBar
                    className='h-1.5'
                    fillClassName='motion-reduce:transition-none'
                    percentage={progress.percentage}
                  />
                </div>
                <ol className='flex flex-col gap-3'>
                  {tasks.map((task, index) => (
                    <li
                      key={task.id}
                      aria-current={task.state === 'current' ? 'step' : undefined}
                      className='flex items-center gap-3 text-sm'
                    >
                      <StepIndicator
                        className='size-6'
                        index={index + 1}
                        state={task.state}
                      />
                      {task.href && task.state !== 'done' ? (
                        <Link
                          href={task.href}
                          className={cn(
                            'hover:underline',
                            task.state === 'current' && 'font-medium',
                          )}
                        >
                          {task.title}
                        </Link>
                      ) : (
                        <span className='text-muted-foreground'>{task.title}</span>
                      )}
                      <span className='sr-only'>
                        , {stepStateConfig[task.state].label}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <section aria-labelledby={`${id}-help`} className='flex flex-col gap-3'>
              <h2 id={`${id}-help`} className='text-sm font-medium'>
                Learn the basics
              </h2>
              <ul className='flex flex-col gap-1'>
                {help.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className='hover:bg-muted/50 focus-visible:ring-ring/50 -mx-2 flex items-center gap-3 rounded-md p-2 outline-none focus-visible:ring-3'
                    >
                      <span
                        aria-hidden
                        className='text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md border [&_svg]:size-4'
                      >
                        {link.icon}
                      </span>
                      <span className='flex min-w-0 flex-col'>
                        <span className='text-sm font-medium'>{link.title}</span>
                        <span className='text-muted-foreground text-xs'>
                          {link.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export { Onboarding2, exampleProps as onboarding2ExampleProps, type Onboarding2Props }
