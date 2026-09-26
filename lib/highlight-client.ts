import { type HighlighterCore } from 'shiki/core'

/**
 * A small highlighter for the browser, loaded only when a block's code is shown
 * for a component library or icon library other than the default.
 */

let highlighter: Promise<HighlighterCore> | undefined

function getHighlighter() {
  highlighter ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
    createHighlighterCore({
      engine: createJavaScriptRegexEngine(),
      langs: [import('shiki/langs/tsx.mjs')],
      themes: [
        import('shiki/themes/github-light-default.mjs'),
        import('shiki/themes/github-dark.mjs'),
      ],
    }),
  )
  return highlighter
}

export async function highlightTsx(code: string) {
  return (await getHighlighter()).codeToHtml(code, {
    lang: 'tsx',
    themes: { dark: 'github-dark', light: 'github-light-default' },
  })
}
