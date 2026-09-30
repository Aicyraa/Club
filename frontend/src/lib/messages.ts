import type { Message } from '@repo/types'

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
   ['year', 365 * 24 * 60 * 60 * 1000],
   ['month', 30 * 24 * 60 * 60 * 1000],
   ['week', 7 * 24 * 60 * 60 * 1000],
   ['day', 24 * 60 * 60 * 1000],
   ['hour', 60 * 60 * 1000],
   ['minute', 60 * 1000],
]

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/**
 * created_at arrives as an ISO string over JSON, so it is parsed on the client
 * rather than typed as a Date. Falls back to an absolute date if the string is
 * unparseable rather than rendering "in NaN seconds".
 */
export const formatRelativeTime = (iso: string): string => {
   const then = new Date(iso).getTime()

   if (Number.isNaN(then)) {
      return ''
   }

   const elapsed = then - Date.now()

   for (const [unit, ms] of UNITS) {
      if (Math.abs(elapsed) >= ms) {
         return formatter.format(Math.round(elapsed / ms), unit)
      }
   }

   return 'just now'
}

/**
 * A message with no author is either hidden from this viewer (a `normal` user)
 * or belongs to a deleted account. Both render the same way, which is the
 * point: the UI never has to distinguish "you can't see this" from "there is
 * nobody to see".
 */
export const isAnonymous = (message: Message): boolean => !message.author

export const ANONYMOUS_LABEL = 'Anonymous'
