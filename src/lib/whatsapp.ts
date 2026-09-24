/** Blackpaw's own official support line -- for reaching a human when the
 * app itself is the problem. Real number, confirmed by the product owner. */
export const BLACKPAW_SUPPORT_PHONE = '+254114911852'

export function buildWhatsAppUrl(phone: string, message: string): string {
  let e164 = phone.replace(/[\s\-()]/g, '')
  if (e164.startsWith('0')) e164 = '254' + e164.slice(1)
  if (e164.startsWith('+')) e164 = e164.slice(1)
  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`
}
