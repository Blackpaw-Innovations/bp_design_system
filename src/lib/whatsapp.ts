/** Blackpaw's own official support line -- for reaching a human when the
 * app itself is the problem. Real number, confirmed by the product owner. */
export const BLACKPAW_SUPPORT_PHONE = '+254114911852'

export function buildWhatsAppUrl(phone: string, message: string): string {
  let e164 = phone.replace(/[\s\-()]/g, '')
  if (e164.startsWith('0')) e164 = '254' + e164.slice(1)
  if (e164.startsWith('+')) e164 = e164.slice(1)
  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`
}

/**
 * A WhatsApp link with the words filled in: to one person when their phone is known, else WhatsApp asks who.
 * ponytail: Kenyan numbers only (07…/01… become 2547…); other countries must be typed with their + code.
 */
export function whatsAppLink(phone?: string | null, message?: string): string {
  const digits = phone ? phone.replace(/\D/g, '') : ''
  const to = digits.startsWith('0') ? `254${digits.slice(1)}` : digits
  return `https://wa.me/${to}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
