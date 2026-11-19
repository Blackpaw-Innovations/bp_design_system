import { useCallback, useId, useMemo, useState, type ReactNode } from 'react'

/**
 * Settings (v1.21, made premium in v1.38.0, 19 Nov 2026, audit round 4). Every settings page in every vertical:
 *   <SettingsLayout nav={<SettingsNav items={…} current="money" onSelect={go} />}>
 *     <SettingsCard title="Payment plan defaults" description="…" fields>
 *       <Field label="Design deposit" help="…"><NumberInput value={50} suffix="%" onChange={…} /></Field>
 *     </SettingsCard>
 *     <SettingsCard title="Sending invoices" description="…">
 *       <SettingRow label="Send invoices on their own" hint="…" toggle={{ checked, onChange, offText: 'you send each one with one tap' }} />
 *       <SettingRow label="Bill an approved change" hint="…"><RadioGroup variant="cards" … /></SettingRow>
 *     </SettingsCard>
 *     <SaveBar changes={form.changes} onDiscard={form.discard} onSave={save} saving={busy} saveLabel="Save money settings" />
 *   </SettingsLayout>
 * The card head is quiet (navy title, muted line, hairline), never a colour band. Every child gets the card's inner
 * padding, whatever it is. Group titles are sentence case (no all-caps text).
 */
export function SettingsCard({ title, description, action, columns, fields, children, footer }: {
  title: string
  description?: string
  /** Right of the title: a quiet Change button or a StatePill ("New proposals"). */
  action?: ReactNode
  /** 2 puts groups (or, with `fields`, fields) side by side; one column on a phone. */
  columns?: 1 | 2
  /** Children are Fields: a padded grid, label above and help below, two columns unless `columns={1}`. */
  fields?: boolean
  children: ReactNode
  footer?: ReactNode
}) {
  const cols = columns ?? (fields ? 2 : 1)
  return (
    <section className="bp-settings" aria-label={title}>
      <header className="bp-settings-head">
        <div style={{ minWidth: 0 }}><h2>{title}</h2>{description && <p>{description}</p>}</div>
        {action}
      </header>
      <div className="bp-settings-groups" data-cols={cols} data-fields={fields || undefined} style={{ ['--cols' as string]: cols }}>{children}</div>
      {footer && <div className="bp-settings-foot">{footer}</div>}
    </section>
  )
}

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="bp-settings-group" aria-label={title}><h3>{title}</h3>{children}</section>
}

export type StateTone = 'required' | 'on' | 'off'
/** Required = blue tint, On = green tint, Off / Not required = grey. Always a word, never a bare colour. */
export function StatePill({ value, tone }: { value: ReactNode; tone: StateTone }) {
  return <span className="bp-state" data-tone={tone}>{value}</span>
}

/** A switch in a settings row that says what its state means: "Off · you send each one with one tap". Saved with the form. */
export interface SettingToggle { checked: boolean; onChange: (checked: boolean) => void; onText?: string; offText?: string; disabled?: boolean }

/**
 * One question per row: the question and its help on the left, the control on the right (a StatePill, a toggle,
 * choice cards, a Select). Choice cards get the wider right column on their own.
 */
export function SettingRow({ label, hint, state, toggle, children }: { label: string; hint?: string; state?: { value: ReactNode; tone: StateTone }; toggle?: SettingToggle; children?: ReactNode }) {
  const id = useId()
  return (
    <div className="bp-setting-row">
      <span className="bp-setting-label"><b id={`${id}-l`}>{label}</b>{hint && <span id={`${id}-h`}>{hint}</span>}</span>
      {state ? <StatePill value={state.value} tone={state.tone} />
        : toggle ? (
          <button type="button" role="switch" aria-checked={toggle.checked} aria-labelledby={`${id}-l`} aria-describedby={hint ? `${id}-s ${id}-h` : `${id}-s`} disabled={toggle.disabled}
            className="bp-setting-toggle" onClick={() => toggle.onChange(!toggle.checked)}>
            <span id={`${id}-s`} className="bp-state" data-tone={toggle.checked ? 'on' : 'off'}>
              {toggle.checked ? 'On' : 'Off'}{(toggle.checked ? toggle.onText : toggle.offText) && <> · {toggle.checked ? toggle.onText : toggle.offText}</>}
            </span>
            <span className="bp-switch" aria-hidden="true" />
          </button>
        )
        : children && <div className="bp-setting-control">{children}</div>}
    </div>
  )
}

/** A short ordered list shown as numbered pills (a check-out checklist, steps a guest follows). */
export function NumberedPills({ items, label }: { items: string[]; label: string }) {
  return <ol className="bp-numbered" aria-label={label}>{items.map((t, i) => <li key={`${i}-${t}`}><span aria-hidden="true">{i + 1}</span>{t}</li>)}</ol>
}

/* ── Settings navigation and layout (v1.38.0) ─────────────────────── */
export interface SettingsNavItem { id: string; label: string; href?: string; /** Starts a titled section of the list on desktop ("Business"). */ section?: string }

/**
 * The settings sections: a fixed list on the left on desktop, scrolling pill tabs on a phone. It never opens over
 * the form (it replaces pop-out "Settings" menus). Links when items have `href`, buttons otherwise.
 */
export function SettingsNav({ items, current, onSelect, label = 'Settings sections' }: { items: SettingsNavItem[]; current: string; onSelect?: (id: string) => void; label?: string }) {
  return (
    <nav className="bp-settings-nav" aria-label={label}>
      <ul>
        {items.map((it) => {
          const on = it.id === current
          const props = { 'aria-current': on ? ('page' as const) : undefined, onClick: onSelect ? (e: { preventDefault: () => void }) => { if (!it.href) e.preventDefault(); onSelect(it.id) } : undefined }
          return (
            <li key={it.id}>
              {it.section && <small>{it.section}</small>}
              {it.href ? <a href={it.href} {...props}>{it.label}</a> : <button type="button" {...props}>{it.label}</button>}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Nav on the left (sticky), cards on the right; stacked with pill tabs on top on a phone. */
export function SettingsLayout({ nav, children }: { nav?: ReactNode; children: ReactNode }) {
  return <div className="bp-settings-layout" data-nav={nav ? '' : undefined}>{nav}<div className="bp-settings-main">{children}</div></div>
}

/* ── Save bar (v1.38.0) ───────────────────────────────────────────── */
/**
 * The navy bar on every settings form: shown only while something has changed, stays in view at the bottom.
 * Wire it with useSettingsDraft, or pass any count of changes.
 */
export function SaveBar({ changes, onSave, onDiscard, saving, saveLabel = 'Save changes', error }: {
  changes: number
  onSave: () => void
  onDiscard: () => void
  saving?: boolean
  saveLabel?: string
  /** What to do after a failed save, in words ("Not saved. Check the connection and press Save again"). */
  error?: string
}) {
  if (changes <= 0 && !saving) return null
  return (
    <div className="bp-savebar" role="region" aria-label="Unsaved changes" data-error={error ? '' : undefined}>
      <span className="bp-savebar-dot" aria-hidden="true" />
      <span className="bp-savebar-text" aria-live="polite">{error ?? `${changes} unsaved change${changes === 1 ? '' : 's'}`}</span>
      <span className="bp-savebar-actions">
        <button type="button" className="bp-savebar-discard" onClick={onDiscard} disabled={saving}>Discard</button>
        <button type="button" className="bp-savebar-save" onClick={onSave} disabled={saving} aria-busy={saving || undefined}>{saving ? 'Saving…' : saveLabel}</button>
      </span>
    </div>
  )
}

/**
 * A draft of a settings form for SaveBar: `const f = useSettingsDraft(saved)` → f.draft, f.set('deposit', 50),
 * f.changes (fields that differ from saved), f.discard(). After a successful save, pass the new saved object in.
 */
export function useSettingsDraft<T extends Record<string, unknown>>(saved: T) {
  const [edits, setEdits] = useState<Partial<T>>({})
  const key = JSON.stringify(saved)
  const [base, setBase] = useState(key)
  if (base !== key) { setBase(key); setEdits({}) } // the saved values changed (after Save or a reload): start clean
  const draft = useMemo(() => ({ ...saved, ...edits }) as T, [saved, edits])
  const changes = Object.keys(edits).filter((k) => JSON.stringify(edits[k]) !== JSON.stringify(saved[k])).length
  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => setEdits((e) => ({ ...e, [key]: value })), [])
  const discard = useCallback(() => setEdits({}), [])
  return { draft, set, changes, discard }
}
