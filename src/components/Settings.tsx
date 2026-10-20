import type { ReactNode } from 'react'

/**
 * Settings card (v1.21, 20 Oct 2026). Every settings page reads the same way: a blue head band with the
 * title, a one-line description and the normal secondary "Change" button; grouped sections; one sentence
 * per row with a hint and a state pill. Editing stays in the SlideOver the Change button opens.
 *   <SettingsCard title="Arrivals and check-out" description="…" action={<Button variant="secondary">Change</Button>} columns={2}>
 *     <SettingsGroup title="Before check-in">
 *       <SettingRow label="Stay paid" hint="The guest cannot check in until the stay is paid." state={{ value: 'Required', tone: 'required' }} />
 *     </SettingsGroup>
 *   </SettingsCard>
 * Group titles are sentence case (no all-caps text); the band colour and spacing set them apart.
 */
export function SettingsCard({ title, description, action, columns = 1, children, footer }: { title: string; description?: string; action?: ReactNode; columns?: 1 | 2; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="bp-settings" aria-label={title}>
      <header className="bp-settings-head">
        <div style={{ minWidth: 0 }}><h2>{title}</h2>{description && <p>{description}</p>}</div>
        {action}
      </header>
      <div className="bp-settings-groups" data-cols={columns} style={{ ['--cols' as string]: columns }}>{children}</div>
      {footer}
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

export function SettingRow({ label, hint, state, children }: { label: string; hint?: string; state?: { value: ReactNode; tone: StateTone }; children?: ReactNode }) {
  return (
    <div className="bp-setting-row">
      <span className="bp-setting-label"><b>{label}</b>{hint && <span>{hint}</span>}</span>
      {state ? <StatePill value={state.value} tone={state.tone} /> : children}
    </div>
  )
}

/** A short ordered list shown as numbered pills (a check-out checklist, steps a guest follows). */
export function NumberedPills({ items, label }: { items: string[]; label: string }) {
  return <ol className="bp-numbered" aria-label={label}>{items.map((t, i) => <li key={`${i}-${t}`}><span aria-hidden="true">{i + 1}</span>{t}</li>)}</ol>
}
