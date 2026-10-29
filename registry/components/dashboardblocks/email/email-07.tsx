import {
  type EmailBrand,
  EmailFooter,
  EmailLayout,
  EmailLink,
  EmailPanel,
  EmailPanelButton,
  EmailPanelNote,
  EmailPanelTitle,
  EmailRows,
  EmailSection,
  EmailText,
  EmailTitle,
} from '@/registry/components/dashboardblocks/email'
import { joinDetails } from '@/registry/lib/dashboardblocks/format'

interface WelcomeStep {
  /** The link's words: `Add the snippet` */
  action: string
  description: string
  title: string
  url: string
}

interface Email7Props {
  brand: EmailBrand
  /** The one thing to do first, on the panel. */
  firstStep: WelcomeStep
  /** A postal address for the footer. */
  address?: string
  /** A guide for anyone who gets stuck. */
  helpUrl?: string
  /** The person's first name. */
  name?: string
  /** What to do after the first step, in order. */
  nextSteps?: WelcomeStep[]
  /** Who gets the reply when someone answers this email. */
  sender?: { name: string; role: string }
  workspace?: string
}

const exampleProps: Email7Props = {
  address: '548 Market St, San Francisco',
  brand: {
    logo: 'https://www.dashboardblocks.com/images/logo-01.png',
    name: 'Acme Analytics',
  },
  firstStep: {
    action: 'Add the snippet',
    description:
      'One line in your site’s head. Visitors show up a few seconds after the first page view.',
    title: 'Add the tracking snippet',
    url: 'https://app.acme.com/setup',
  },
  helpUrl: 'https://acme.com/docs/getting-started',
  name: 'Ana',
  nextSteps: [
    {
      action: 'Invite',
      description: 'Share dashboards and the weekly report with them.',
      title: 'Invite your team',
      url: 'https://app.acme.com/settings/members',
    },
    {
      action: 'Set a goal',
      description: 'Count signups or purchases, not only visits.',
      title: 'Set your first goal',
      url: 'https://app.acme.com/goals/new',
    },
  ],
  sender: { name: 'Sam Lee', role: 'co-founder' },
  workspace: 'Northwind',
}

const email7Subject = ({ brand, name }: Email7Props) =>
  name ? `Welcome to ${brand.name}, ${name}` : `Welcome to ${brand.name}`

const Email7 = ({
  address,
  brand,
  firstStep,
  helpUrl,
  name,
  nextSteps,
  sender,
  workspace,
}: Email7Props) => (
  <EmailLayout
    brand={brand}
    preview={firstStep.description}
    footer={<EmailFooter>{joinDetails(brand.name, address)}</EmailFooter>}
  >
    <EmailTitle
      description={`${workspace ? `Your ${workspace} workspace` : 'Your account'} is ready. Here’s where to start.`}
    >
      {name ? `Welcome to ${brand.name}, ${name}` : `Welcome to ${brand.name}`}
    </EmailTitle>
    <EmailPanel label='Start here'>
      <EmailPanelTitle>{firstStep.title}</EmailPanelTitle>
      <EmailPanelNote>{firstStep.description}</EmailPanelNote>
      <EmailPanelButton href={firstStep.url}>{firstStep.action}</EmailPanelButton>
    </EmailPanel>
    {nextSteps && nextSteps.length > 0 ? (
      <EmailSection title='After that'>
        <EmailRows
          rows={nextSteps.map((step) => ({
            detail: step.description,
            label: step.title,
            value: <EmailLink href={step.url}>{step.action}</EmailLink>,
          }))}
        />
      </EmailSection>
    ) : null}
    {sender || helpUrl ? (
      <EmailSection>
        <EmailText>
          {helpUrl ? (
            <>
              Stuck? The <EmailLink href={helpUrl}>setup guide</EmailLink> walks through
              each step.{' '}
            </>
          ) : null}
          {sender
            ? `${helpUrl ? 'Or reply' : 'Questions? Reply'} to this email: it goes straight to ${sender.name}, ${sender.role}.`
            : null}
        </EmailText>
      </EmailSection>
    ) : null}
  </EmailLayout>
)

Email7.PreviewProps = exampleProps

export default Email7
export {
  Email7,
  email7Subject,
  exampleProps as email7ExampleProps,
  type Email7Props,
  type WelcomeStep,
}
