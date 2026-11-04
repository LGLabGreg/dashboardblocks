import { aiAssistant1ExampleProps } from './ai-assistant-01'
import { aiAssistant2ExampleProps } from './ai-assistant-02'
import { aiAssistant3ExampleProps } from './ai-assistant-03'
import { aiAssistant4ExampleProps } from './ai-assistant-04'
import {
  AiAssistant1Preview,
  AiAssistant2Preview,
  AiAssistant3Preview,
  AiAssistant4Preview,
  aiAssistantPreviewProps,
} from './preview'

export const aiAssistantComponents = {
  'ai-assistant-01': AiAssistant1Preview,
  'ai-assistant-02': AiAssistant2Preview,
  'ai-assistant-03': AiAssistant3Preview,
  'ai-assistant-04': AiAssistant4Preview,
}

export const aiAssistantExampleProps = {
  'ai-assistant-01': aiAssistant1ExampleProps,
  'ai-assistant-02': {
    ...aiAssistant2ExampleProps,
    ...aiAssistantPreviewProps['ai-assistant-02'],
  },
  'ai-assistant-03': {
    ...aiAssistant3ExampleProps,
    ...aiAssistantPreviewProps['ai-assistant-03'],
  },
  'ai-assistant-04': {
    ...aiAssistant4ExampleProps,
    ...aiAssistantPreviewProps['ai-assistant-04'],
  },
}

export const aiAssistantEmptyProps = {
  'ai-assistant-01': { accounts: [], metrics: [] },
  'ai-assistant-02': { messages: [] },
  'ai-assistant-03': { messages: [], tokens: undefined },
  'ai-assistant-04': { error: undefined, messages: [] },
}
