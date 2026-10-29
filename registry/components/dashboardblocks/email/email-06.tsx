import {
  type EmailBrand,
  EmailFooter,
  EmailLayout,
  EmailLink,
  EmailPanel,
  EmailPanelButton,
  EmailPanelMeter,
  EmailPanelNote,
  EmailPanelValue,
  EmailRows,
  EmailSection,
  EmailText,
  EmailTitle,
} from '@/registry/components/dashboardblocks/email'
import {
  formatCompact,
  formatDate,
  formatPercent,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'

interface UsageSource {
  name: string
  used: number
}

interface Email6Props {
  brand: EmailBrand
  limit: number
  /** What's counted, in the plural: `events`. */
  metric: string
  plan: string
  resetsAt: Date
  upgradeUrl: string
  used: number
  usageUrl: string
  /** A postal address for the footer. */
  address?: string
  /** What happens at the limit, to end the sentence `At the limit, …`. */
  atLimit?: string
  /** When usage reaches the limit at the pace so far. */
  projectedAt?: Date
  /** Where the usage came from, largest first: projects, keys or sites. */
  sources?: UsageSource[]
  /** The heading over `sources`. @default 'By project' */
  sourcesTitle?: string
  /** The time zone dates are written in. @default 'UTC' */
  timeZone?: string
}

const exampleProps: Email6Props = {
  address: '548 Market St, San Francisco',
  atLimit: 'new events are dropped until it resets',
  brand: {
    logo: 'https://www.dashboardblocks.com/images/logo-01.png',
    name: 'Acme Analytics',
  },
  limit: 10_000_000,
  metric: 'events',
  plan: 'Pro',
  projectedAt: new Date(Date.UTC(2026, 10, 24, 12)),
  resetsAt: new Date(Date.UTC(2026, 11, 1)),
  sources: [
    { name: 'Web app', used: 5_120_000 },
    { name: 'iOS app', used: 2_340_000 },
    { name: 'Marketing site', used: 1_040_000 },
  ],
  timeZone: 'Europe/London',
  upgradeUrl: 'https://app.acme.com/settings/billing/plans',
  usageUrl: 'https://app.acme.com/settings/usage',
  used: 8_500_000,
}

const email6Subject = ({ brand, limit, metric, used }: Email6Props) =>
  used >= limit
    ? `You’ve reached your ${brand.name} limit of ${formatCompact(limit)} ${metric}`
    : `You’ve used ${formatPercent(used / limit, { maximumFractionDigits: 0 })} of your ${brand.name} ${metric}`

const Email6 = ({
  address,
  atLimit,
  brand,
  limit,
  metric,
  plan,
  projectedAt,
  resetsAt,
  sources,
  sourcesTitle = 'By project',
  timeZone = 'UTC',
  upgradeUrl,
  usageUrl,
  used,
}: Email6Props) => {
  const share = formatPercent(used / limit, { maximumFractionDigits: 0 })
  const resets = formatDate(resetsAt, 'day', timeZone)
  const left = Math.max(0, limit - used)
  return (
    <EmailLayout
      brand={brand}
      preview={`${formatCompact(used)} of ${formatCompact(limit)} ${metric} used. The limit resets on ${resets}.`}
      footer={<EmailFooter>{joinDetails(brand.name, address)}</EmailFooter>}
    >
      <EmailTitle
        description={
          projectedAt && projectedAt < resetsAt
            ? `At this pace you’ll reach the limit around ${formatDate(projectedAt, 'day', timeZone)}, before it resets on ${resets}.`
            : `The limit resets on ${resets}.`
        }
      >
        {used >= limit
          ? `You’ve reached your ${plan} plan’s limit of ${formatCompact(limit)} ${metric}`
          : `You’ve used ${share} of your ${plan} plan’s ${metric}`}
      </EmailTitle>
      <EmailPanel label={`${metric[0].toUpperCase()}${metric.slice(1)} used`}>
        <EmailPanelValue unit={` of ${formatCompact(limit)}`}>
          {formatCompact(used)}
        </EmailPanelValue>
        <EmailPanelMeter
          label={`${share} of ${formatCompact(limit)} ${metric} used`}
          value={used / limit}
        />
        <EmailPanelNote>
          {joinDetails(
            left > 0 ? `${formatCompact(left)} left` : 'None left',
            `Resets ${resets}`,
          )}
        </EmailPanelNote>
        <EmailPanelButton href={upgradeUrl}>Raise the limit</EmailPanelButton>
      </EmailPanel>
      {sources && sources.length > 0 ? (
        <EmailSection title={sourcesTitle}>
          <EmailRows
            rows={sources.map((source) => ({
              detail: `${formatPercent(source.used / used, { maximumFractionDigits: 0 })} of the ${metric}`,
              label: source.name,
              value: formatCompact(source.used),
            }))}
          />
        </EmailSection>
      ) : null}
      <EmailSection>
        <EmailText>
          {atLimit ? `At the limit, ${atLimit}. ` : null}
          See each day’s {metric} in <EmailLink href={usageUrl}>Usage</EmailLink>.
        </EmailText>
      </EmailSection>
    </EmailLayout>
  )
}

Email6.PreviewProps = exampleProps

export default Email6
export {
  Email6,
  email6Subject,
  exampleProps as email6ExampleProps,
  type Email6Props,
  type UsageSource,
}
