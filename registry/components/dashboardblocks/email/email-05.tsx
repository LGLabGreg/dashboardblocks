import {
  type EmailBrand,
  EmailFooter,
  EmailLayout,
  EmailPanel,
  EmailPanelButton,
  EmailPanelNote,
  EmailPanelValue,
  EmailRows,
  EmailSection,
  EmailTitle,
} from '@/registry/components/dashboardblocks/email'
import {
  daysBetween,
  formatCurrency,
  formatDate,
  formatNumber,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'

interface TrialPlan {
  interval: 'month' | 'year'
  name: string
  /** What each `interval` costs, as your pricing page shows it. */
  price: number
}

interface TrialChange {
  /** What the workspace has now: `8 in the workspace` */
  now: string
  /** `Members` */
  label: string
  /** What it gets on the plan it moves to: `Up to 3` */
  after: string
}

interface Email5Props {
  billingUrl: string
  brand: EmailBrand
  endsAt: Date
  plan: TrialPlan
  workspace: string
  /** A postal address for the footer. */
  address?: string
  /** @default 'USD' */
  currency?: string
  /** The plan the workspace moves to without a card, and what changes on it. */
  downgrade?: { changes: TrialChange[]; plan: string }
  /** The card on file, if any: `Visa ending 4242`. With one, the plan carries on and the email says what it charges. */
  paymentMethod?: string
  /** When the email goes out, to count the days left. @default new Date() */
  sentAt?: Date
  /** The time zone dates are written in. @default 'UTC' */
  timeZone?: string
}

const exampleProps: Email5Props = {
  address: '548 Market St, San Francisco',
  billingUrl: 'https://app.acme.com/settings/billing',
  brand: {
    logo: 'https://www.dashboardblocks.com/images/logo-01.png',
    name: 'Acme Analytics',
  },
  downgrade: {
    changes: [
      { after: 'Up to 3', label: 'Members', now: '8 in the workspace' },
      { after: '7 days', label: 'History', now: '90 days of events' },
      { after: 'None', label: 'Scheduled reports', now: '4 sent each week' },
    ],
    plan: 'Free',
  },
  endsAt: new Date(Date.UTC(2026, 10, 1, 9, 42)),
  plan: { interval: 'month', name: 'Pro', price: 49 },
  sentAt: new Date(Date.UTC(2026, 9, 29, 9, 42)),
  timeZone: 'Europe/London',
  workspace: 'Northwind Finance',
}

const daysLeft = ({ endsAt, sentAt = new Date(), timeZone = 'UTC' }: Email5Props) =>
  Math.max(0, daysBetween(sentAt, endsAt, timeZone))

const inDays = (days: number) =>
  days === 0 ? 'today' : `in ${formatNumber(days)} ${days === 1 ? 'day' : 'days'}`

const email5Subject = (props: Email5Props) =>
  `Your ${props.brand.name} trial ends ${inDays(daysLeft(props))}`

const Email5 = (props: Email5Props) => {
  const {
    address,
    billingUrl,
    brand,
    currency = 'USD',
    downgrade,
    endsAt,
    paymentMethod,
    plan,
    timeZone = 'UTC',
    workspace,
  } = props
  const days = daysLeft(props)
  const day = formatDate(endsAt, 'day', timeZone)
  const price = formatCurrency(plan.price, { currency, precision: 'exact' })
  const billed = plan.interval === 'month' ? 'monthly' : 'yearly'
  return (
    <EmailLayout
      brand={brand}
      preview={
        paymentMethod
          ? `Your ${plan.name} plan starts on ${day}, at ${price} a ${plan.interval}.`
          : `Add a card by ${day} to keep ${plan.name}.`
      }
      footer={<EmailFooter>{joinDetails(brand.name, address)}</EmailFooter>}
    >
      <EmailTitle
        description={
          paymentMethod
            ? `On ${day} your ${plan.name} plan starts, and we charge ${paymentMethod}. Nothing else changes.`
            : `Add a card to keep ${plan.name} for ${workspace}, at ${price} a ${plan.interval}. Without one, it moves to the ${downgrade?.plan ?? 'free'} plan on ${day}.`
        }
      >
        Your {plan.name} trial ends {inDays(days)}
      </EmailTitle>
      <EmailPanel label='Trial ends'>
        {days === 0 ? (
          <EmailPanelValue>Today</EmailPanelValue>
        ) : (
          <EmailPanelValue unit={days === 1 ? ' day' : ' days'}>
            {formatNumber(days)}
          </EmailPanelValue>
        )}
        <EmailPanelNote>
          {formatDate(endsAt, 'weekday-day-time-zone', timeZone)}
        </EmailPanelNote>
        <EmailPanelButton href={billingUrl}>
          {paymentMethod ? 'See billing' : 'Add a card'}
        </EmailPanelButton>
      </EmailPanel>
      {paymentMethod ? (
        <EmailSection title='First payment'>
          <EmailRows
            rows={[
              {
                detail: `${paymentMethod}, on ${day}`,
                label: `${plan.name} plan, ${billed}`,
                value: price,
              },
            ]}
          />
        </EmailSection>
      ) : downgrade && downgrade.changes.length > 0 ? (
        <EmailSection title={`What changes on ${downgrade.plan}`}>
          <EmailRows
            rows={downgrade.changes.map((change) => ({
              detail: change.now,
              label: change.label,
              value: change.after,
            }))}
          />
        </EmailSection>
      ) : null}
    </EmailLayout>
  )
}

Email5.PreviewProps = exampleProps

export default Email5
export {
  Email5,
  email5Subject,
  exampleProps as email5ExampleProps,
  type Email5Props,
  type TrialChange,
  type TrialPlan,
}
