// Universal print/PDF documents (v1.29.0, 13 Nov 2026): moved here from
// hakiqa-connect src/framework/printDocument.ts so every Hakiqa app and
// vertical prints Receipts, Invoices, Quotes, Delivery notes, Statements and
// Goods received notes with ONE layout. Framework-free (no React). Fonts and
// the Hakiqa promo icon load from the host app's own origin
// (`${assetBase}/fonts/google-sans/*.ttf`, `${assetBase}/brand/hakiqa-favicon.svg`),
// so each app ships those files in its public/ folder.
//
// Original note (Connect Phase 7): the shared print/PDF mechanism behind Receipt, Job Close Report, and
// every other document generator. Mechanism ported from Blackpaw's own
// production reference (firstlight/HakiqaDuka's Sell.jsx
// buildTillReportWithSessionExpenses print path) -- a hidden iframe filled
// with a fully self-contained print-only HTML document, then
// iframe.contentWindow.print(). No PDF library dependency: the browser's
// own print dialog ("Save as PDF") does the actual PDF generation.
//
// Visual structure (accent stripe, two-tone document title, Billed
// From/To card, accent-colored table header, big accent total) follows
// blackpaw-admin's own invoicePrintTemplate.ts/receiptPrintTemplate.ts
// literally -- but that reference hardcodes Blackpaw's own business and
// four fixed brand colors (it only ever bills one company). This can't
// hardcode anything: every car_parts tenant has a different name/logo/
// address, and the accent is a single tenant-configurable color (a
// paid-plan perk -- see useDocumentBranding.ts), not four fixed hues.
// Branding is resolved once via getBranding() (src/api/carPartsLiveAdapter.ts)
// and passed in per-document; this file only renders whatever it's given.
//
// This does not attempt: a server-rendered PDF, a portal URL, deterministic
// numbering beyond what the individual generators already do, or eTIMS --
// same scope note as the Quote/Invoice generators built earlier.

// One configured accent, not two -- a gradient's second stop is derived
// here (HSL, ~14% darker, same angle every time) rather than asking a
// tenant to pick a matching pair. Falls back to the input unchanged for
// a non-hex accent (e.g. a CSS keyword) rather than throwing.
export function darkenHex(hex: string, amount = 0.14): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const n = parseInt(match[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r / 255) h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g / 255) h = ((b / 255 - r / 255) / d + 2) / 6;
    else h = ((r / 255 - g / 255) / d + 4) / 6;
  }
  const l2 = Math.max(0, l - amount);
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r2: number, g2: number, b2: number;
  if (s === 0) { r2 = g2 = b2 = l2; }
  else {
    const q = l2 < 0.5 ? l2 * (1 + s) : l2 + s - l2 * s;
    const p = 2 * l2 - q;
    r2 = hue2rgb(p, q, h + 1 / 3); g2 = hue2rgb(p, q, h); b2 = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

export function escapeDoc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

export interface DocumentBranding {
  name: string;
  legalName?: string;
  logo?: string | null;
  address?: string;
  phone?: string;
  email?: string;
  footer?: string;
  accent?: string;
  /** The "Generated with Hakiqa · hakiqa.com" promo line + Haki icon --
   * on by default (every tenant's document carries this as marketing),
   * removable only as a paid premium toggle. Undefined/true = shown. */
  showPromo?: boolean;
}

export interface DocumentParty { name: string; lines?: string[] }
export type DocumentStatusTone = "success" | "warning" | "neutral";

// Google Sans is self-hosted (public/fonts/google-sans/*.ttf, OFL-licensed
// -- see that folder's OFL.txt) rather than linked from Google Fonts'
// CDN: a print iframe/popup has no guaranteed network access delay
// budget, and a font that hasn't finished loading when window.print()
// fires just silently falls back to the browser default -- same-origin
// files load deterministically and waitForFonts() below can actually
// wait on them.
const fontFaces = (base: string) => `
  @font-face { font-family: 'Google Sans'; src: url('${base}/fonts/google-sans/GoogleSans-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; font-display: block; }
  @font-face { font-family: 'Google Sans'; src: url('${base}/fonts/google-sans/GoogleSans-Medium.ttf') format('truetype'); font-weight: 500; font-style: normal; font-display: block; }
  @font-face { font-family: 'Google Sans'; src: url('${base}/fonts/google-sans/GoogleSans-SemiBold.ttf') format('truetype'); font-weight: 600; font-style: normal; font-display: block; }
  @font-face { font-family: 'Google Sans'; src: url('${base}/fonts/google-sans/GoogleSans-Bold.ttf') format('truetype'); font-weight: 700; font-style: normal; font-display: block; }
  /* Manrope, self-hosted for the same reason Google Sans is (a print
     iframe has no guaranteed network budget) -- numerics only (money,
     quantities, reference/account numbers), body text stays Google Sans. */
  @font-face { font-family: 'Manrope'; src: url('${base}/fonts/manrope/Manrope-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; font-display: block; }
  @font-face { font-family: 'Manrope'; src: url('${base}/fonts/manrope/Manrope-Medium.ttf') format('truetype'); font-weight: 500; font-style: normal; font-display: block; }
  @font-face { font-family: 'Manrope'; src: url('${base}/fonts/manrope/Manrope-SemiBold.ttf') format('truetype'); font-weight: 600; font-style: normal; font-display: block; }
  @font-face { font-family: 'Manrope'; src: url('${base}/fonts/manrope/Manrope-Bold.ttf') format('truetype'); font-weight: 700; font-style: normal; font-display: block; }
  @font-face { font-family: 'Manrope'; src: url('${base}/fonts/manrope/Manrope-ExtraBold.ttf') format('truetype'); font-weight: 800; font-style: normal; font-display: block; }
`;

const STATUS_TONE_COLORS: Record<DocumentStatusTone, { bg: string; fg: string }> = {
  success: { bg: "#ecfdf5", fg: "#059669" }, // allow-raw-color: print output is theme-invariant by design (see the doc comment on documentStyle() below) -- black-on-white regardless of the app's own theme
  warning: { bg: "#fffbeb", fg: "#b45309" }, // allow-raw-color: print output is theme-invariant by design (see the doc comment on documentStyle() below) -- black-on-white regardless of the app's own theme
  neutral: { bg: "#f3f4f6", fg: "#4b5563" }, // allow-raw-color: print output is theme-invariant by design (see the doc comment on documentStyle() below) -- black-on-white regardless of the app's own theme
};

// Standard business-document paper margin (A4), used consistently across
// @page (actual print inset), .page's screen-mode padding, and the
// accent stripe's bleed -- one constant so the three stay in lock-step
// instead of three copies of "14mm" that could quietly drift apart.
const PAGE_MARGIN = "14mm";

/** Shared A4 print stylesheet -- print output is deliberately black-on-white
 * regardless of the app's own theme (light or dark): a printer or a saved
 * PDF has no "dark mode", and print-color-adjust:exact only helps if the
 * source colors themselves are print-safe to begin with. The accent color
 * is the one exception, driven by the tenant's own branding.
 *
 * This is the ONE canonical ruleset for every Hakiqa Connect document
 * (Receipt, Purchase Order, Warranty Certificate, Shipment Manifest, Job
 * Close Report, Report, and whatever's added next) -- a new document type
 * calls buildDocumentHtml() with its own docType/meta/bodyHtml and gets
 * this styling for free. Extend it here, don't fork a per-document copy:
 * a table, a totals card, a party block should look identical no matter
 * which document it appears on. */
function documentStyle(accent: string, base = '') {
  const accentDark = darkenHex(accent);
  return `
  ${fontFaces(base)}
  @page { size: A4; margin: ${PAGE_MARGIN}; }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: auto; overflow-y: auto; } /* the old hidden-iframe flow never needed to scroll on screen -- the visible popup window this now opens does */
  body { color: #111827; font-family: 'Google Sans', Arial, Helvetica, sans-serif; font-size: 12px; background: #eef0f2; padding: 24px 16px 48px; -webkit-print-color-adjust: exact; print-color-adjust: exact; } /* allow-raw-color: screen-only backdrop behind the white page card, matches blackpaw-admin's printWindow.ts reference; @media print below strips this back to a plain white page */
  .page { width: 100%; max-width: 800px; margin: 0 auto; background: #fff; padding: ${PAGE_MARGIN}; border-radius: 12px; box-shadow: 0 4px 24px -8px rgba(17,24,39,.18); } /* allow-raw-color: screen-only card chrome, stripped under @media print */
  .doc-accent-stripe { height: 6px; background: ${accent}; margin: -${PAGE_MARGIN} -${PAGE_MARGIN} 22px; border-radius: 12px 12px 0 0; }
  @media print {
    body { background: #fff !important; padding: 0 !important; }
    .page { max-width: 100% !important; margin: 0 !important; padding: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
    .doc-accent-stripe { margin: 0 0 22px !important; border-radius: 0 !important; }
  }
  .doc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 20px; }
  .doc-brand-row { display: flex; align-items: center; gap: 12px; }
  .doc-logo { height: 40px; max-width: 160px; object-fit: contain; }
  .doc-brand { font-size: 17px; font-weight: 700; line-height: 1.15; }
  .doc-brand-legal { font-size: 10px; font-weight: 400; color: #6b7280; margin-top: 1px; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-sub { font-size: 11px; color: #4b5563; margin-top: 6px; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-title { font-size: 26px; font-weight: 700; line-height: 1.1; text-align: right; }
  .doc-title .accent { color: ${accent}; }
  .doc-title-meta { margin-top: 8px; font-size: 11.5px; color: #6b7280; text-align: right; line-height: 1.75; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-title-meta strong { color: #111827; font-family: 'Manrope', 'Google Sans', Arial, sans-serif; font-variant-numeric: tabular-nums; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-status { display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .doc-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-party-label { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 6px; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-party-name { font-size: 13.5px; font-weight: 700; margin-bottom: 2px; overflow-wrap: break-word; }
  .doc-party-line { font-size: 11.5px; color: #4b5563; line-height: 1.6; overflow-wrap: break-word; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) -- overflow-wrap: a long address/email/PIN never overflows its 1fr column, even as one unbroken word */
  .doc-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 20px; margin-bottom: 18px; }
  .doc-meta-item { border-top: 2px solid #111827; padding-top: 6px; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.07em; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-value { font-size: 13px; font-weight: 700; margin-top: 3px; font-family: 'Manrope', 'Google Sans', Arial, sans-serif; font-variant-numeric: tabular-nums; }
  h2 { font-size: 12.5px; font-weight: 700; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  /* One table treatment for every line-item table across every document
     type: accent header bar, flat body rows with a hairline divider, no
     border on the closing row so the table ends cleanly rather than
     trailing a line into whatever follows it. */
  table { width: 100%; border-collapse: collapse; border-spacing: 0; font-size: 11.5px; margin-bottom: 4px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #fff; background: ${accent}; padding: 9px 10px; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  th.right, td.right { text-align: right; }
  td.right { font-family: 'Manrope', 'Google Sans', Arial, sans-serif; font-variant-numeric: tabular-nums; }
  th:first-child { border-radius: 6px 0 0 6px; }
  th:last-child { border-radius: 0 6px 6px 0; }
  td { border-bottom: 1px solid #e5e7eb; padding: 9px 10px; vertical-align: top; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  tbody tr:last-child td { border-bottom: none; }
  .right { text-align: right; }
  /* Accent-derived gradient card, same 135deg angle and ~14% darker
     second stop as blackpaw-admin's payment-details card -- one
     configured colour in, no second colour for the tenant to pick. */
  .doc-totals { padding: 16px 18px; margin-top: 10px; max-width: 320px; margin-left: auto; background: linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%); border-radius: 12px; color: #fff; }
  .doc-totals-row { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; font-size: 12px; color: rgba(255,255,255,.75); }
  .doc-totals-row .amount, .doc-totals-row span:last-child { color: #fff; font-family: 'Manrope', 'Google Sans', Arial, sans-serif; font-variant-numeric: tabular-nums; }
  .doc-grand { display: flex; justify-content: space-between; gap: 12px; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.25); font-size: 15px; font-weight: 700; color: rgba(255,255,255,.9); }
  .doc-grand .amount { color: #fff; font-size: 19px; font-family: 'Manrope', 'Google Sans', Arial, sans-serif; font-variant-numeric: tabular-nums; font-weight: 800; }
  /* Same gradient-card treatment, reusable for STATIC payment-reference
     info (where to pay: a bank account, a paybill/till number a tenant
     has actually configured) -- deliberately NOT a payment-collection
     widget (P0.1 stays deferred). A caller only reaches for this once it
     has real static payment details to show; nothing calls it today. */
  .doc-payment-card { padding: 16px 18px; margin-top: 14px; background: linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%); border-radius: 12px; color: #fff; }
  .doc-payment-label { font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; opacity: .75; margin-bottom: 10px; }
  .doc-payment-row { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; font-size: 11px; }
  .doc-payment-row span:first-child { opacity: .8; }
  .doc-payment-row span:last-child { font-weight: 800; font-size: 14px; font-family: 'Manrope', 'Google Sans', Arial, sans-serif; font-variant-numeric: tabular-nums; }
  .doc-note { margin-top: 16px; font-size: 10.5px; color: #6b7280; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280; text-align: center; line-height: 1.7; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-promo { margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .doc-promo img { height: 22px; width: 22px; object-fit: contain; }
  .doc-promo span { font-size: 10.5px; color: #9ca3af; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-promo strong { color: #6b7280; } /* allow-raw-color: print output is theme-invariant by design (isolated iframe stylesheet, no access to the app's CSS custom properties) */
  .doc-sign { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 24px; margin-top: 28px; break-inside: avoid; }
  .doc-sign-img { height: 48px; max-width: 200px; object-fit: contain; display: block; }
  .doc-sign-line { border-top: 1px solid #111827; margin-top: 6px; padding-top: 6px; font-size: 11.5px; font-weight: 700; } /* allow-raw-color: print output is theme-invariant by design */
  .doc-sign-sub { font-size: 10.5px; color: #6b7280; line-height: 1.6; } /* allow-raw-color: print output is theme-invariant by design */
  .doc-promo a { text-decoration: none; } /* allow-raw-color: inherits .doc-promo strong's colour, print output is theme-invariant by design */
  `;
}

export interface DocumentField { label: string; value: string }

export function buildDocumentHtml(opts: {
  title: string;
  branding: DocumentBranding;
  docType: string;
  docNumber?: string;
  issuedDate?: string;
  dueDate?: string;
  status?: string;
  statusTone?: DocumentStatusTone;
  billedTo?: DocumentParty;
  /** Overrides the "Billed From"/"Billed To" party labels -- e.g. a
   * Purchase Order isn't billing anyone, it's ordering from a vendor.
   * Defaults preserve the billing wording every existing caller relies on. */
  partyLabels?: { from?: string; to?: string };
  meta?: DocumentField[];
  bodyHtml: string;
  generatedNote?: string;
  /** Prefix for the font and promo-icon URLs. Default '' (same origin root). */
  assetBase?: string;
}) {
  const accent = opts.branding.accent || "#1E3A7A"; // allow-raw-color: print output is theme-invariant by design (see the doc comment on documentStyle() below) -- black-on-white regardless of the app's own theme
  const titleWords = opts.docType.trim().split(/\s+/);
  const titleLast = titleWords.pop() ?? opts.docType;
  const titleRest = titleWords.join(" ");

  const meta = (opts.meta ?? [])
    .map((m) => `<div class="doc-meta-item"><div class="doc-label">${escapeDoc(m.label)}</div><div class="doc-value">${escapeDoc(m.value)}</div></div>`)
    .join("");

  const parties = opts.billedTo ? `<div class="doc-parties">
    <div>
      <div class="doc-party-label">${escapeDoc(opts.partyLabels?.from || "Billed From")}</div>
      <div class="doc-party-name">${escapeDoc(opts.branding.name)}</div>
      ${opts.branding.address ? `<div class="doc-party-line">${escapeDoc(opts.branding.address)}</div>` : ""}
      ${opts.branding.phone || opts.branding.email ? `<div class="doc-party-line">${escapeDoc([opts.branding.phone, opts.branding.email].filter(Boolean).join(" · "))}</div>` : ""}
    </div>
    <div>
      <div class="doc-party-label">${escapeDoc(opts.partyLabels?.to || "Billed To")}</div>
      <div class="doc-party-name">${escapeDoc(opts.billedTo.name)}</div>
      ${(opts.billedTo.lines ?? []).map((l) => `<div class="doc-party-line">${escapeDoc(l)}</div>`).join("")}
    </div>
  </div>` : "";

  const tone = STATUS_TONE_COLORS[opts.statusTone ?? "neutral"];
  const statusHtml = opts.status
    ? `<div class="doc-status" style="background:${tone.bg};color:${tone.fg}">${escapeDoc(opts.status)}</div>`
    : "";

  const titleMetaLines = [
    opts.docNumber ? `Ref: <strong>${escapeDoc(opts.docNumber)}</strong>` : "",
    opts.issuedDate ? `Issued: <strong>${escapeDoc(opts.issuedDate)}</strong>` : "",
    opts.dueDate ? `Due: <strong>${escapeDoc(opts.dueDate)}</strong>` : "",
  ].filter(Boolean).join("<br/>");

  const footerLines = [
    !opts.billedTo && opts.branding.address ? opts.branding.address : "",
    !opts.billedTo ? [opts.branding.phone, opts.branding.email].filter(Boolean).join(" · ") : "",
    opts.branding.footer,
    opts.generatedNote ?? `Generated ${new Date().toLocaleString("en-KE")}`,
  ].filter(Boolean).map((line) => escapeDoc(line)).join("<br/>");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeDoc(opts.title)}</title><style>${documentStyle(accent, opts.assetBase ?? '')}</style></head><body><div class="page">
    <div class="doc-accent-stripe"></div>
    <div class="doc-header">
      <div>
        <div class="doc-brand-row">
          ${opts.branding.logo ? `<img class="doc-logo" src="${/^(data:|https?:|\/)/.test(opts.branding.logo) ? escapeDoc(opts.branding.logo) : `data:image/png;base64,${opts.branding.logo}`}" alt="" />` : ""}
          <div>
            <div class="doc-brand">${escapeDoc(opts.branding.name)}</div>
            ${opts.branding.legalName ? `<div class="doc-brand-legal">Trading as · ${escapeDoc(opts.branding.legalName)}</div>` : ""}
          </div>
        </div>
        <div class="doc-sub">${escapeDoc(opts.title)}</div>
      </div>
      <div>
        <div class="doc-title">${titleRest ? `${escapeDoc(titleRest)} ` : ""}<span class="accent">${escapeDoc(titleLast)}</span></div>
        ${titleMetaLines ? `<div class="doc-title-meta">${titleMetaLines}</div>` : ""}
        ${statusHtml}
      </div>
    </div>
    ${parties}
    ${meta ? `<div class="doc-meta">${meta}</div>` : ""}
    ${opts.bodyHtml}
    <div class="doc-footer">
      ${footerLines}
      ${opts.branding.showPromo === false ? "" : `<div class="doc-promo">
        <img src="${opts.assetBase ?? ''}/brand/hakiqa-favicon.svg" alt="" />
        <span>Generated with <a href="https://hakiqa.com/" target="_blank" rel="noopener noreferrer"><strong>Hakiqa</strong></a> · hakiqa.com</span>
      </div>`}
    </div>
  </div></body></html>`;
}

/** Waits for the print document's own fonts to finish loading (bounded to
 * 1.5s so a font-loading hiccup degrades to the system-font fallback
 * instead of hanging the print dialog forever). */
function waitForFonts(doc: Document): Promise<void> {
  const fonts = (doc as unknown as { fonts?: { ready: Promise<unknown> } }).fonts;
  if (!fonts) return Promise.resolve();
  return Promise.race([
    fonts.ready.then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, 1500)),
  ]);
}

/** Opens a real, visible, resizable browser window with the document --
 * the user can read and scroll it before deciding to print, exactly like
 * blackpaw-admin's own printWindow.ts (the actual reference this was
 * meant to match). A hidden 0x0 iframe that jumps straight to the print
 * dialog with nothing to look at first was a regression from that, not
 * "the same mechanism" the old comment here claimed. "Save as PDF" in the
 * print dialog is how the user actually gets a PDF file out of this. */
export function printDocument(input: string | DocumentSpec, title?: string) {
  const html = typeof input === "string" ? input : renderDocument(input);
  title = title ?? (typeof input === "string" ? "Hakiqa Document" : input.title);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    window.alert("Pop-up blocked. Please allow pop-ups for this site and try again.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.title = title;
  win.document.close();
  waitForFonts(win.document).then(() => {
    win.focus();
    win.print();
    win.onafterprint = () => win.close();
  });
}

// ---- Structured API: data in, the one house layout out -------------------

/** The document types every app shares. Any other string still works. */
export type DocumentKind = "Receipt" | "Invoice" | "Quote" | "Delivery Note" | "Statement" | "Goods Received Note" | "Purchase Order";

export interface DocumentColumn { key: string; label: string; align?: "left" | "right" }
export type DocumentLine = Record<string, string | number | null | undefined>;
export interface DocumentSignature { label: string; name?: string; lines?: string[]; image?: string | null }

export interface DocumentSpec {
  kind: DocumentKind | (string & {});
  title: string;
  branding: DocumentBranding;
  number?: string;
  issuedDate?: string;
  dueDate?: string;
  status?: string;
  statusTone?: DocumentStatusTone;
  party?: DocumentParty;
  partyLabels?: { from?: string; to?: string };
  meta?: DocumentField[];
  linesHeading?: string;
  columns?: DocumentColumn[];
  lines?: DocumentLine[];
  totals?: DocumentField[];
  grandTotal?: DocumentField;
  notes?: string[];
  signatures?: DocumentSignature[];
  generatedNote?: string;
  assetBase?: string;
}

const isBlank = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

/** Line table. A column with no value in any row is dropped (no empty columns). */
export function documentTable(columns: DocumentColumn[], lines: DocumentLine[], heading = "Items"): string {
  const cols = columns.filter((c) => lines.some((l) => !isBlank(l[c.key])));
  if (!cols.length || !lines.length) return "";
  const cls = (c: DocumentColumn) => (c.align === "right" ? ' class="right"' : "");
  return `<h2>${escapeDoc(heading)}</h2><table><thead><tr>${cols.map((c) => `<th${cls(c)}>${escapeDoc(c.label)}</th>`).join("")}</tr></thead>
    <tbody>${lines.map((l) => `<tr>${cols.map((c) => `<td${cls(c)}>${escapeDoc(l[c.key])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

export function renderDocument(spec: DocumentSpec): string {
  const totals = spec.totals?.length || spec.grandTotal
    ? `<div class="doc-totals">${(spec.totals ?? []).map((t) => `<div class="doc-totals-row"><span>${escapeDoc(t.label)}</span><span>${escapeDoc(t.value)}</span></div>`).join("")}${
        spec.grandTotal ? `<div class="doc-grand"><span>${escapeDoc(spec.grandTotal.label)}</span><span class="amount">${escapeDoc(spec.grandTotal.value)}</span></div>` : ""}</div>`
    : "";
  const signatures = spec.signatures?.length
    ? `<div class="doc-sign">${spec.signatures.map((s) => `<div>${s.image ? `<img class="doc-sign-img" src="${escapeDoc(s.image)}" alt="" />` : ""}<div class="doc-sign-line">${escapeDoc(s.label)}${s.name ? ` · ${escapeDoc(s.name)}` : ""}</div>${(s.lines ?? []).filter(Boolean).map((l) => `<div class="doc-sign-sub">${escapeDoc(l)}</div>`).join("")}</div>`).join("")}</div>`
    : "";
  const notes = (spec.notes ?? []).filter(Boolean).map((n) => `<p class="doc-note">${escapeDoc(n)}</p>`).join("");
  return buildDocumentHtml({
    title: spec.title,
    branding: spec.branding,
    docType: spec.kind,
    docNumber: spec.number,
    issuedDate: spec.issuedDate,
    dueDate: spec.dueDate,
    status: spec.status,
    statusTone: spec.statusTone,
    billedTo: spec.party,
    partyLabels: spec.partyLabels,
    meta: spec.meta?.filter((m) => !isBlank(m.value)),
    bodyHtml: documentTable(spec.columns ?? [], spec.lines ?? [], spec.linesHeading) + totals + notes + signatures,
    generatedNote: spec.generatedNote,
    assetBase: spec.assetBase,
  });
}
