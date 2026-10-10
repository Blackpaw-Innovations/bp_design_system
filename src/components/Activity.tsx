import { useState, type ReactNode } from 'react'
import { MessageCircle, Phone } from 'lucide-react'
import { Avatar } from './Data'
import { Button } from './Guarded'
import { Segmented } from './Form'
import { formatDateTime } from '../lib/format'

/**
 * Activity (chatter) for every SlideOver and record page (standards §17.7, round 2 W1).
 * Three kinds, one look each:
 *   message  to or from the customer: tinted bubble, channel label; theirs left, ours right
 *   note     staff only: sunken bubble with an edge, "Note · staff only"
 *   change   by a person or the system: one muted line with a dot
 * Newest at the bottom, beside the composer. Filter: All · Messages · Notes · Changes.
 * The composer switches between "Message {name}" (sent on WhatsApp, shows the number) and
 * "Internal note" (sunken field). Never one box that silently does both.
 */
export type ActivityKind = 'message' | 'note' | 'change'

export interface ActivityEntry {
  id: string
  kind: ActivityKind
  /** Person name, or "System". */
  who: string
  /** ISO date-time. */
  at: string
  text: string
  /** true for messages sent by staff (right side). */
  mine?: boolean
  channel?: 'WhatsApp' | 'SMS' | 'Email'
}

export interface ActivityProps {
  entries: ActivityEntry[]
  /** Customer first name for the composer: "Message Jane". Omit to allow notes only. */
  contactName?: string
  contactPhone?: string
  onSend?: (kind: 'message' | 'note', text: string) => void | Promise<void>
  /** "2 new" on the Activity heading when the panel uses the Details / Activity switch (W1c). */
  unread?: number
}

type Filter = 'all' | ActivityKind
const FILTERS: { value: Filter; label: string }[] = [{ value: 'all', label: 'All' }, { value: 'message', label: 'Messages' }, { value: 'note', label: 'Notes' }, { value: 'change', label: 'Changes' }]

export function Activity({ entries, contactName, contactPhone, onSend, unread }: ActivityProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [mode, setMode] = useState<'message' | 'note'>(contactName ? 'message' : 'note')
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const shown = entries.filter((e) => filter === 'all' || e.kind === filter)
  const send = async () => {
    const v = draft.trim()
    if (!v || !onSend) return
    setBusy(true)
    try { await onSend(mode, v); setDraft(''); setFilter('all') } finally { setBusy(false) }
  }
  return (
    <section aria-label="Activity" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h3 style={{ flex: 1, margin: 0, fontSize: 17, fontWeight: 800 }}>Activity{unread ? <span className="bp-count" style={{ marginLeft: 8, background: 'var(--c-selected)' }}>{unread} new</span> : null}</h3>
        <Segmented label="Show" value={filter} onChange={setFilter} options={FILTERS} />
      </div>
      <ol className="bp-activity" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {shown.length === 0 && <li className="bp-help">Nothing here yet.</li>}
        {shown.map((e) => e.kind === 'change'
          ? <li key={e.id} className="bp-act-event" data-system={e.who === 'System' || undefined}><span><b>{e.who}</b> {e.text} · {formatDateTime(e.at)}</span></li>
          : (
            <li key={e.id} className="bp-act-msg" data-mine={e.mine || undefined} data-kind={e.kind}>
              <Avatar name={e.who} size={32} />
              <div className="bp-bubble">
                <span className="bp-bubble-meta">{e.kind === 'note' ? `Note · staff only · ${e.who}` : `${e.channel ?? 'WhatsApp'} · ${e.who}`} · {formatDateTime(e.at)}</span>
                <span>{e.text}</span>
              </div>
            </li>
          ))}
      </ol>
      {onSend && (
        <div className="bp-composer" style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6 }}>
          {contactName && <Segmented label="Write" value={mode} onChange={setMode} options={[{ value: 'message', label: `Message ${contactName}` }, { value: 'note', label: 'Internal note' }]} />}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div className="bp-control" style={{ flex: 1 }}>
              <textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} data-note={mode === 'note' || undefined}
                placeholder={mode === 'message' ? `Message ${contactName} on WhatsApp${contactPhone ? ` (${contactPhone})` : ''}` : `Note for staff only${contactName ? `; ${contactName} will not see it` : ''}`}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send() }} style={{ minHeight: 52 }} />
            </div>
            <Button variant="secondary" loading={busy} disabled={!draft.trim()} onClick={() => void send()}>{mode === 'message' ? 'Send' : 'Add note'}</Button>
          </div>
        </div>
      )}
    </section>
  )
}

/** Contact shortcuts for SlideOver.quickActions. WhatsApp uses the brand green fill (allowed for the channel). */
export function ContactActions({ phone, waText, extra }: { phone: string; waText?: string; extra?: ReactNode }) {
  const digits = phone.replace(/\D/g, '')
  return (
    <>
      <a className="bp-btn" data-size="md" href={`https://wa.me/${digits}${waText ? `?text=${encodeURIComponent(waText)}` : ''}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: 'var(--c-whatsapp)', borderColor: 'var(--c-whatsapp)', color: '#fff' }}><MessageCircle size={17} aria-hidden="true" />WhatsApp</a>
      <a className="bp-btn" data-variant="secondary" data-size="md" href={`tel:+${digits}`} style={{ flex: 1 }}><Phone size={17} aria-hidden="true" />Call</a>
      {extra}
    </>
  )
}
