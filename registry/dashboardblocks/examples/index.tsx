import { CompactKPI } from './compact-kpi'
import { DescriptiveKPI } from './descriptive-kpi'
import { MinimalKPI } from './minimal-kpi'

export const exampleComponents = {
  'minimal-kpi': MinimalKPI,
  'compact-kpi': CompactKPI,
  'descriptive-kpi': DescriptiveKPI,
}

export function getExampleComponent(name: string) {
  return exampleComponents[name as keyof typeof exampleComponents] || null
}
