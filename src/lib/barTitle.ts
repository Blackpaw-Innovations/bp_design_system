import { createContext, useContext } from 'react'

/**
 * v1.45 (D5, Marvin 25 Nov 2026): the app's top bar names the screen. The app passes that name in once
 * (<BarTitleProvider value={title}>), and every DS title (PageHeader, PageTitle, CountHero/MoneyHero `title`)
 * drops a title that repeats it, so the same words never show twice.
 */
const BarTitle = createContext<string | null>(null)
export const BarTitleProvider = BarTitle.Provider
export const useBarTitle = () => useContext(BarTitle)

const norm = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase()
export const sameWords = (a?: string | null, b?: string | null) => !!a && !!b && norm(a) === norm(b)

/** The title to draw under the top bar: undefined when it repeats the bar. */
export function useOwnTitle(title?: string | null): string | undefined {
  const bar = useBarTitle()
  return title && !sameWords(title, bar) ? title : undefined
}
