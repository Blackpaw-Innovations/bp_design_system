import { cloneElement, isValidElement, useId, useRef, useState, type InputHTMLAttributes, type ReactElement, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { AlertCircle, Check, Minus, Plus } from 'lucide-react'
import { cn, type IconComponent } from '../lib/utils'

/**
 * Form controls (standards §17.2, §17.3, §17.5, §17.21).
 *   Field          label above (15/700), "(optional)", help under, error replaces help; wires ids for a11y
 *   Input          44 px, 16 px text, prefix/suffix on a sunken segment ("+254", "KES", "kg")
 *   Textarea       3 rows → grows to 8; counter only for an enforced limit, from 80 %
 *   MoneyInput     KES prefix, separators while typing, stores a number, no minus, cents opt-in
 *   QuantityInput  whole counts 1–99 with − / + (44 px) and typing
 *   Checkbox, RadioGroup, Switch, Segmented
 */

export interface FieldProps {
  label: string
  optional?: boolean
  /** One sentence, 14 px muted. Replaced by `error` when there is one. May hold an <ExampleTag> ("PCI-014"). */
  help?: ReactNode
  /** What to do, not what went wrong: "Enter all 9 digits after +254". Show on blur or Save, never while first typing. */
  error?: string
  /** Right-aligned in the label row, e.g. the character counter. */
  aside?: ReactNode
  className?: string
  children: ReactElement
}

export function Field({ label, optional, help, error, aside, className, children }: FieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-err` : help ? `${id}-help` : undefined
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, invalid: !!error })
    : children
  return (
    <div className={cn('bp-field', className)}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <label htmlFor={id}>{label}{optional && <span className="bp-optional"> (optional)</span>}</label>
        {aside}
      </div>
      {control}
      {error
        ? <p id={`${id}-err`} className="bp-error" role="alert" style={{ margin: 0 }}><AlertCircle size={16} aria-hidden="true" style={{ marginTop: 2, flex: 'none' }} />{error}</p>
        : help && <p id={`${id}-help`} className="bp-help" style={{ margin: 0 }}>{help}</p>}
    </div>
  )
}

type Affix = { prefix?: string; suffix?: string }
export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'style' | 'prefix'> & Affix & {
  invalid?: boolean
  /** Width follows the content: "full" for names and notes, "short" (~200 px) for weights, codes, quantities. */
  width?: 'full' | 'short'
  figure?: boolean
}

/** Keeps password managers (browser, 1Password, LastPass, Dashlane) off number boxes: no "•••" icon in a "days" field. */
const NO_PASSWORD_MANAGER = { autoComplete: 'off', 'data-1p-ignore': '', 'data-lpignore': 'true', 'data-form-type': 'other' } as const

export function Input({ prefix, suffix, invalid, disabled, width = 'full', figure, ...rest }: InputProps) {
  const numeric = rest.inputMode === 'numeric' || rest.inputMode === 'decimal' || rest.type === 'number'
  return (
    <div className="bp-control" data-invalid={invalid || undefined} data-disabled={disabled || undefined} data-figure={figure || undefined} style={width === 'short' ? { width: 200 } : undefined}>
      {prefix && <span className="bp-affix" data-side="start" aria-hidden="true">{prefix}</span>}
      <input {...(numeric ? NO_PASSWORD_MANAGER : null)} {...rest} disabled={disabled} />
      {suffix && <span className="bp-affix" data-side="end" aria-hidden="true">{suffix}</span>}
    </div>
  )
}

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'style'> & { invalid?: boolean }

export function Textarea({ invalid, disabled, rows = 3, ...rest }: TextareaProps) {
  return (
    <div className="bp-control" data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
      <textarea {...rest} rows={rows} disabled={disabled} />
    </div>
  )
}

/** Counter for Field.aside. Renders nothing below 80 % of the limit. */
export function CharCount({ value, limit }: { value: string; limit: number }) {
  if (value.length < limit * 0.8) return null
  return <span className="bp-counter" data-over={value.length > limit || undefined} aria-live="polite">{value.length} / {limit}</span>
}

/* ── Money ─────────────────────────────────────────────────── */
export interface MoneyInputProps {
  value: number | null
  onChange: (value: number | null) => void
  /** Allow up to 2 decimal places (fuel, per-litre milk). Off by default: whole shillings. */
  cents?: boolean
  /** Fixed "KES". A currency choice is only for businesses that really take two (Imports). */
  currency?: string
  invalid?: boolean
  disabled?: boolean
  id?: string
  placeholder?: string
  'aria-describedby'?: string
  onBlur?: () => void
}

/** Parses pasted text like "Ksh 1,200.00" → 1200. Never negative. */
export function parseMoney(text: string, cents = false): number | null {
  const clean = text.replace(/[^\d.]/g, '')
  if (!clean) return null
  const [whole, frac = ''] = clean.split('.')
  const n = Number(cents ? `${whole}.${frac.slice(0, 2)}` : whole)
  return Number.isFinite(n) ? n : null
}

function groupDigits(raw: string, cents: boolean) {
  const [w, f] = raw.split('.')
  const whole = (w.replace(/^0+(?=\d)/, '') || (raw ? '0' : '')).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return cents && f !== undefined ? `${whole}.${f.slice(0, 2)}` : whole
}

export function MoneyInput({ value, onChange, cents = false, currency = 'KES', invalid, disabled, onBlur, ...rest }: MoneyInputProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(value == null ? '' : groupDigits(String(value), cents))
  const [focused, setFocused] = useState(false)
  const shown = focused ? text : value == null ? '' : groupDigits(String(value), cents)
  return (
    <div className="bp-control" data-invalid={invalid || undefined} data-disabled={disabled || undefined} data-figure="">
      <span className="bp-affix" data-side="start" aria-hidden="true">{currency}</span>
      <input
        {...NO_PASSWORD_MANAGER}
        {...rest}
        ref={ref}
        disabled={disabled}
        inputMode={cents ? 'decimal' : 'numeric'}
        value={shown}
        onFocus={() => { setText(value == null ? '' : groupDigits(String(value), cents)); setFocused(true) }}
        onBlur={() => { setFocused(false); onBlur?.() }}
        onChange={(e) => {
          const el = e.target
          const caretFromEnd = el.value.length - (el.selectionStart ?? el.value.length)
          const raw = el.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
          const next = groupDigits(cents ? raw : raw.replace(/\..*/, ''), cents)
          setText(next)
          onChange(parseMoney(next, cents))
          requestAnimationFrame(() => { const p = Math.max(0, next.length - caretFromEnd); el.setSelectionRange(p, p) })
        }}
      />
    </div>
  )
}

export function QuantityInput({ value, onChange, min = 1, max = 99, label = 'Quantity' }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label?: string }) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n || min)))
  return (
    <div className="bp-control bp-qty" style={{ width: 180 }} role="group" aria-label={label}>
      <button type="button" aria-label="Less" disabled={value <= min} onClick={() => onChange(clamp(value - 1))}><Minus size={18} /></button>
      <input {...NO_PASSWORD_MANAGER} inputMode="numeric" aria-label={label} value={value} onChange={(e) => onChange(clamp(Number(e.target.value.replace(/\D/g, ''))))} />
      <button type="button" aria-label="More" disabled={value >= max} onClick={() => onChange(clamp(value + 1))}><Plus size={18} /></button>
    </div>
  )
}

/**
 * A plain number setting (a percentage, days, a rate) with light unit tags: `<NumberInput value={7} suffix="days" />`.
 * Numeric keypad on phones, no password-manager icon, stores a number (null when empty).
 */
export interface NumberInputProps {
  value: number | null
  onChange: (value: number | null) => void
  /** Allow a decimal point (a rate per km, a weight). Off: whole numbers. */
  decimal?: boolean
  prefix?: string
  suffix?: string
  invalid?: boolean
  disabled?: boolean
  width?: 'full' | 'short'
  id?: string
  placeholder?: string
  'aria-label'?: string
  'aria-describedby'?: string
  onBlur?: () => void
}

export function NumberInput({ value, onChange, decimal, ...rest }: NumberInputProps) {
  const [text, setText] = useState(value == null ? '' : String(value))
  // Keep what is typed ("12." on the way to "12.5"); follow the value when it changes from outside (Discard).
  const shown = (text === '' ? null : Number(text)) === value ? text : value == null ? '' : String(value)
  return (
    <Input
      {...rest}
      inputMode={decimal ? 'decimal' : 'numeric'}
      value={shown}
      onChange={(e) => {
        const raw = e.target.value.replace(decimal ? /[^\d.]/g : /\D/g, '').replace(/(\..*)\./g, '$1')
        setText(raw)
        onChange(raw === '' || raw === '.' ? null : Number(raw))
      }}
    />
  )
}

/** A live example of what a setting produces, inside a Field's help: help={<>Clients pay to <ExampleTag>PCI-014</ExampleTag></>}. */
export function ExampleTag({ children }: { children: ReactNode }) {
  return <span className="bp-example">{children}</span>
}

/**
 * Shares that must add up to 100 (payment milestones, a commission split): one box per share, a bar that
 * shows the split, and a live "Adds up to 100%" check, so nobody learns it is wrong only on Save.
 * Inside a Field, the label points at the first box and the Field's help is read with every box.
 */
export function SplitPercentInput({ value, onChange, label = 'Share', invalid, disabled, id, 'aria-describedby': describedBy }: {
  value: (number | null)[]
  onChange: (value: (number | null)[]) => void
  /** Each box is read as "<label> 1 of 4". */
  label?: string
  invalid?: boolean
  disabled?: boolean
  id?: string
  'aria-describedby'?: string
}) {
  const checkId = useId()
  const total = Math.round(value.reduce<number>((a, n) => a + (n ?? 0), 0) * 100) / 100
  const off = Math.round((100 - total) * 100) / 100
  return (
    <div className="bp-split">
      <div className="bp-split-boxes" style={{ ['--n' as string]: value.length }}>
        {value.map((n, i) => (
          <NumberInput key={i} id={i === 0 ? id : undefined} value={n} suffix="%" disabled={disabled} invalid={invalid} decimal
            aria-label={`${label} ${i + 1} of ${value.length}`} aria-describedby={[describedBy, checkId].filter(Boolean).join(' ')}
            onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
        ))}
      </div>
      <div className="bp-split-bar" aria-hidden="true">
        {value.map((n, i) => <i key={i} data-i={i % 4} style={{ flexGrow: n ?? 0 }} />)}
        {off > 0 && <i data-gap="" style={{ flexGrow: off }} />}
      </div>
      <p id={checkId} className="bp-split-check" data-ok={off === 0 || undefined} aria-live="polite">
        {off === 0 ? <><Check size={14} strokeWidth={3} aria-hidden="true" /> Adds up to 100%</>
          : off > 0 ? `Adds up to ${total}%: ${off}% still to place` : `Adds up to ${total}%: ${-off}% too much`}
      </p>
    </div>
  )
}

/* ── Choices ───────────────────────────────────────────────── */
export interface CheckboxProps {
  checked: boolean | 'mixed'
  onChange: (checked: boolean) => void
  /** States the "on" meaning: "Email me a daily summary". */
  label: ReactNode
  help?: string
  disabled?: boolean
}

export function Checkbox({ checked, onChange, label, help, disabled }: CheckboxProps) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} disabled={disabled} className="bp-choice" data-help={help ? '' : undefined} onClick={() => onChange(checked !== true)} style={{ border: 0, background: 'transparent', padding: 0, textAlign: 'left' }}>
      <span className="bp-box" aria-hidden="true">{checked === true ? <Check size={16} strokeWidth={3} /> : checked === 'mixed' ? <Minus size={16} strokeWidth={3} /> : null}</span>
      <span>{label}{help && <span className="bp-choice-sub">{help}</span>}</span>
    </button>
  )
}

export interface ChoiceOption<V extends string> { value: V; label: string; help?: string; icon?: IconComponent }

/**
 * One of 2–5 options that each need a line of explanation. 2–3 short options: Segmented. 6+: Select.
 * `variant="cards"` (v1.38.0, settings, round 5): 2–4 side-by-side cards, a title and a one-line consequence each. The
 * chosen card is solid navy with white text and an orange tick in a filled circle; the others are white with an empty
 * ring; hover only darkens the border. `variant="switch"`: short answers as one filled switch (chosen segment navy).
 * In both, the legend is read, not shown: the SettingRow question says it on screen.
 * Both variants are one tab stop; arrow keys move and choose, like a native radio group.
 */
export function RadioGroup<V extends string>({ legend, value, onChange, options, variant = 'list' }: { legend: string; value: V; onChange: (v: V) => void; options: ChoiceOption<V>[]; variant?: 'list' | 'cards' | 'switch' }) {
  const cards = variant === 'cards'
  const sw = variant === 'switch'
  const max = cards || sw ? 4 : 5
  if (options.length > max && typeof console !== 'undefined') console.warn(`[@blackpaw/ui] RadioGroup over ${max} options: use <Select>.`)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const current = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <fieldset role="radiogroup" aria-label={legend} className={cards ? 'bp-cards' : sw ? 'bp-seg' : undefined} data-filled={sw || undefined}
      style={sw ? { border: 0, margin: 0 } : cards ? { ['--n' as string]: Math.min(options.length, 2) } : { border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}
      onKeyDown={(e) => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
        if (!d) return
        e.preventDefault()
        const n = (current + d + options.length) % options.length
        onChange(options[n].value); refs.current[n]?.focus()
      }}>
      <legend className={cards || sw ? 'sr-only' : 'bp-legend'} style={cards || sw ? undefined : { fontSize: 16, fontWeight: 800, paddingBottom: 4 }}>{legend}</legend>
      {options.map((o, i) => (
        <button key={o.value} ref={(el) => { refs.current[i] = el }} type="button" role="radio" aria-checked={value === o.value}
          tabIndex={i === current ? 0 : -1} className={cards ? 'bp-card-choice' : sw ? undefined : 'bp-choice'} data-help={o.help ? '' : undefined}
          onClick={() => onChange(o.value)} style={cards || sw ? undefined : { border: 0, background: 'transparent', padding: 0, textAlign: 'left' }}>
          {sw ? o.label : <>
            <span className="bp-radio" aria-hidden="true">{cards && value === o.value && <Check size={14} strokeWidth={3.5} />}</span>
            <span>{cards ? <b>{o.label}</b> : o.label}{o.help && <span className="bp-choice-sub">{o.help}</span>}</span>
          </>}
        </button>
      ))}
    </fieldset>
  )
}

/** Takes effect at once (no Save). Confirm with a toast. Saved with a form? Use Checkbox. */
export function Switch({ checked, onChange, label, help, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} className="bp-switch-row" onClick={() => onChange(!checked)}>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 16, fontWeight: 700 }}>{label}</span>{help && <span className="bp-help">{help}</span>}</span>
      <span className="bp-switch" aria-hidden="true" />
    </button>
  )
}

/**
 * Switches the view of the same data or a short choice (List / Cards / Table, Day / Week / Month,
 * Add / Remove). 2–4 segments, labels always; icons only if every segment has one. Never navigation
 * (pill-nav), never filters. Replaces ViewToggle.
 */
export function Segmented<V extends string>({ label, value, onChange, options, hideIconsOnPhone = true }: { label: string; value: V; onChange: (v: V) => void; options: ChoiceOption<V>[]; hideIconsOnPhone?: boolean }) {
  const allIcons = options.every((o) => o.icon)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  return (
    <div className="bp-seg" role="radiogroup" aria-label={label} onKeyDown={(e) => {
      const i = options.findIndex((o) => o.value === value)
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
      if (!d) return
      e.preventDefault()
      const n = (i + d + options.length) % options.length
      onChange(options[n].value); refs.current[n]?.focus()
    }}>
      {options.map((o, i) => (
        <button key={o.value} ref={(el) => { refs.current[i] = el }} type="button" role="radio" aria-checked={value === o.value} tabIndex={value === o.value ? 0 : -1} onClick={() => onChange(o.value)}>
          {allIcons && o.icon && <o.icon size={18} className={hideIconsOnPhone ? 'max-sm:hidden' : undefined} />}{o.label}
        </button>
      ))}
    </div>
  )
}
