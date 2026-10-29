import {
  type EmailBrand,
  EmailFooter,
  EmailLayout,
  EmailLink,
  EmailPanel,
  EmailPanelButton,
  EmailPanelMoney,
  EmailPanelNote,
  EmailRows,
  EmailSection,
  EmailText,
  EmailTitle,
} from '@/registry/components/dashboardblocks/email'
import {
  formatCurrency,
  formatDate,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'

interface Email4Props {
  /** What the charge was for, tax included. */
  amount: number
  brand: EmailBrand
  invoiceUrl: string
  /** `Visa ending 4242` */
  paymentMethod: string
  plan: string
  updateUrl: string
  /** A postal address for the footer. */
  address?: string
  /** @default 'USD' */
  currency?: string
  /** The bank's reason, as your payment provider gives it: `Insufficient funds`. */
  reason?: string
  /** When the card is charged again, if your provider retries it. */
  retryAt?: Date
  /** When the plan is paused if the payment still fails. */
  suspendsAt?: Date
  /** The time zone dates are written in. @default 'UTC' */
  timeZone?: string
}

const exampleProps: Email4Props = {
  address: '548 Market St, San Francisco',
  amount: 58.8,
  brand: {
    logo: 'https://www.dashboardblocks.com/images/logo-01.png',
    name: 'Acme Analytics',
  },
  invoiceUrl: 'https://app.acme.com/settings/billing/invoices/2026-0431',
  paymentMethod: 'Visa ending 4242',
  plan: 'Pro',
  reason: 'Insufficient funds',
  retryAt: new Date(Date.UTC(2026, 10, 1, 9, 42)),
  suspendsAt: new Date(Date.UTC(2026, 10, 12, 9, 42)),
  timeZone: 'Europe/London',
  updateUrl: 'https://app.acme.com/settings/billing/payment-method',
}

const email4Subject = ({ amount, brand, currency }: Email4Props) =>
  `Your ${brand.name} payment of ${formatCurrency(amount, { currency, precision: 'exact' })} didn’t go through`

const Email4 = ({
  address,
  amount,
  brand,
  currency = 'USD',
  invoiceUrl,
  paymentMethod,
  plan,
  reason,
  retryAt,
  suspendsAt,
  timeZone = 'UTC',
  updateUrl,
}: Email4Props) => {
  const due = formatCurrency(amount, { currency, precision: 'exact' })
  const day = (date: Date) => formatDate(date, 'day', timeZone)
  const next = [
    retryAt && {
      detail: `${paymentMethod}, or the card you add before then`,
      label: 'We try again',
      value: day(retryAt),
    },
    suspendsAt && {
      detail: 'If the payment still fails',
      label: `Your ${plan} plan is paused`,
      value: day(suspendsAt),
    },
  ].filter((row) => !!row)
  return (
    <EmailLayout
      brand={brand}
      preview={`${paymentMethod} was declined. Update your card to keep your ${plan} plan.`}
      footer={<EmailFooter>{joinDetails(brand.name, address)}</EmailFooter>}
    >
      <EmailTitle
        description={`We couldn’t charge ${paymentMethod} for your ${plan} plan. Update your card and we’ll take the payment straight away.`}
      >
        Your payment didn’t go through
      </EmailTitle>
      <EmailPanel label='Amount due'>
        <EmailPanelMoney>{due}</EmailPanelMoney>
        <EmailPanelNote>{joinDetails(paymentMethod, reason)}</EmailPanelNote>
        <EmailPanelButton href={updateUrl}>Update card</EmailPanelButton>
      </EmailPanel>
      {next.length > 0 ? (
        <EmailSection title='What happens next'>
          <EmailRows rows={next} />
        </EmailSection>
      ) : null}
      <EmailSection>
        <EmailText>
          The <EmailLink href={invoiceUrl}>invoice</EmailLink> shows what the payment is
          for.
        </EmailText>
      </EmailSection>
    </EmailLayout>
  )
}

Email4.PreviewProps = exampleProps

export default Email4
export { Email4, email4Subject, exampleProps as email4ExampleProps, type Email4Props }
